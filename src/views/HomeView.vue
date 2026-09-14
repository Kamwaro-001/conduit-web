<script setup lang="ts">
import { markRaw, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  type Connection,
  type GraphNode,
  type NodeChange,
  type EdgeChange,
  type NodeMouseEvent,
  useVueFlow,
  VueFlow,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import SidebarPalette from '../components/SidebarPalette.vue'
import ConfigDrawer from '../components/ConfigDrawer.vue'
import CustomNode from '../components/nodes/CustomNode.vue'
import TopNavbar from '@/components/TopNavbar.vue'
import { useWorkflowStore, type ConduitNodeData } from '../stores/useWorkflowStore'
import { socketService } from '@/services/socket.service'
import { apiService } from '@/services/api.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const workflowStore = useWorkflowStore()
const { showToast } = useToast()

const selectedNode = ref<GraphNode | null>(null)
const triggering = ref(false)

const nodeTypes = { custom: markRaw(CustomNode) }

const { screenToFlowCoordinate, onNodesChange, onEdgesChange } = useVueFlow()

// ── Keep store in sync with VueFlow's internal drag / delete state ───────────
onNodesChange((changes: NodeChange[]) => {
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      const node = workflowStore.nodes.find((n) => n.id === change.id)
      if (
        node &&
        (node.position.x !== change.position.x || node.position.y !== change.position.y)
      ) {
        node.position = change.position
        workflowStore.hasUnsavedChanges = true
      }
    }
    if (change.type === 'remove') {
      workflowStore.removeNode(change.id)
      workflowStore.hasUnsavedChanges = true
    }
  }
})

onEdgesChange((changes: EdgeChange[]) => {
  for (const change of changes) {
    if (change.type === 'remove') {
      workflowStore.removeEdge(change.id)
      workflowStore.hasUnsavedChanges = true
    }
    // Note: edge addition is handled in onConnect
  }
})

// Canvas interactions
const NODE_DEFAULTS: Record<
  string,
  {
    label: string
    description: string
    backendType: ConduitNodeData['backendType']
  } & Partial<ConduitNodeData>
> = {
  trigger: { label: 'App Trigger', description: 'Manual or API execution', backendType: 'TRIGGER' },
  webhook: { label: 'Webhook Trigger', description: 'POST /v1/webhook', backendType: 'WEBHOOK' },
  schedule: {
    label: 'Schedule',
    description: '* * * * *',
    backendType: 'SCHEDULE',
    cronExpression: '* * * * *',
  },
  condition: {
    label: 'Condition / Branch',
    description: 'IF / ELSE logic',
    backendType: 'CONDITION',
    rules: [],
    matchType: 'AND',
  },
  delay: { label: 'Delay', description: '5000 ms', backendType: 'DELAY', delay_ms: 5000 },
  http_fetch: {
    label: 'HTTP Fetch',
    description: 'REST API Request',
    backendType: 'HTTP_FETCH',
    method: 'GET',
    url: '',
  },
  email: {
    label: 'Send Email',
    description: 'SMTP delivery',
    backendType: 'EMAIL',
    recipient: '',
    subject: '',
    body: '',
  },
  vision: {
    label: 'Vision / AI',
    description: 'Analyze image or prompt',
    backendType: 'VISION',
    prompt: '',
    imageUrlField: '',
    model: '',
  },
  regex: {
    label: 'Regex Match',
    description: 'Pattern extraction',
    backendType: 'REGEX',
    pattern: '',
    inputField: 'payload.',
    flags: 'i',
  },
}

function onDrop(event: DragEvent) {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type || !NODE_DEFAULTS[type]) return

  const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  const defaults = NODE_DEFAULTS[type]

  workflowStore.addNode({
    id: `node_${Date.now()}`,
    type: 'custom',
    position,
    data: { ...defaults, status: 'IDLE' },
  })
  workflowStore.hasUnsavedChanges = true
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onNodeClick(e: NodeMouseEvent) {
  selectedNode.value = e.node
}

function onConnect(connection: Connection) {
  workflowStore.addEdge(connection)
  workflowStore.hasUnsavedChanges = true
}

// Keyboard shortcuts
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Backspace' || e.key === 'Delete') {
    // Avoid deleting if user is typing in an input inside ConfigDrawer
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }
    if (selectedNode.value) {
      workflowStore.removeNode(selectedNode.value.id)
      workflowStore.hasUnsavedChanges = true
      selectedNode.value = null
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  const id = route.params.id as string
  try {
    await workflowStore.loadWorkflow(id)
    socketService.connect(id)
  } catch {
    showToast('Failed to load workflow.', 'error')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  socketService.disconnect()
})

// Trigger execution
async function handleTrigger() {
  if (!workflowStore.workflowId || triggering.value) return

  if (workflowStore.workflowStatus !== 'PUBLISHED') {
    showToast('Publish the workflow before triggering it.', 'info')
    return
  }

  triggering.value = true
  try {
    // make sure backend has latest nodes and edges
    await workflowStore.syncCanvas()

    await apiService.triggerWebhook(workflowStore.workflowId)
    showToast('Execution triggered — watch the nodes.', 'success')
  } catch {
    showToast('Failed to trigger execution.', 'error')
  } finally {
    triggering.value = false
  }
}
</script>

<template>
  <div class="h-screen w-screen bg-[#0F172A] flex flex-col font-sans overflow-hidden">
    <TopNavbar />

    <div class="flex-1 flex overflow-hidden">
      <SidebarPalette />

      <main class="flex-1 relative h-full" @drop="onDrop" @dragover="onDragOver">
        <VueFlow
          :nodes="workflowStore.nodes"
          :edges="workflowStore.edges"
          :node-types="nodeTypes"
          @node-click="onNodeClick"
          @pane-click="selectedNode = null"
          @connect="onConnect"
        >
          <Background pattern-color="#475569" :gap="16" />
        </VueFlow>

        <!-- Empty state -->
        <div
          v-if="workflowStore.nodes.length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <div
            class="text-center space-y-4 bg-neutral-800 p-6 rounded-lg shadow-lg border border-slate-700 max-w-sm"
          >
            <h3 class="text-slate-300 text-sm font-bold">Welcome to Conduit</h3>
            <ul class="text-slate-400 text-xs font-mono space-y-2 text-left">
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
                  <path
                    fill="currentColor"
                    d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"
                  />
                </svg>
                <div class="flex-1">
                  <strong class="text-slate-200">Drag</strong> nodes from the left palette onto the
                  canvas
                </div>
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
                  <path
                    fill="currentColor"
                    d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5m-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4zm-3-4h8v2H8z"
                  />
                </svg>
                <div class="flex-1">
                  <strong class="text-slate-200">Connect</strong> them by dragging from the dots
                </div>
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
                  <path
                    fill="currentColor"
                    d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.49.49 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.6.6 0 0 0-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1q.09.03.18.03c.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64zm-1.98-1.71c.04.31.05.52.05.73s-.02.43-.05.73l-.14 1.13l.89.7l1.08.84l-.7 1.21l-1.27-.51l-1.04-.42l-.9.68c-.43.32-.84.56-1.25.73l-1.06.43l-.16 1.13l-.2 1.35h-1.4l-.19-1.35l-.16-1.13l-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7l-1.06.43l-1.27.51l-.7-1.21l1.08-.84l.89-.7l-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13l-.89-.7l-1.08-.84l.7-1.21l1.27.51l1.04.42l.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43l.16-1.13l.2-1.35h1.39l.19 1.35l.16 1.13l1.06.43c.43.18.83.41 1.23.71l.91.7l1.06-.43l1.27-.51l.7 1.21l-1.07.85l-.89.7zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2"
                  />
                </svg>
                <div class="flex-1">
                  <strong class="text-slate-200">Click</strong> a node to configure it
                </div>
              </li>

              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
                  <path
                    fill="currentColor"
                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
                  />
                </svg>
                <div class="flex-1">
                  <strong class="text-slate-200">Backspace/Delete</strong> removes a selected node
                </div>
              </li>

              <!-- scroll to zoom -->
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14M7 9h5v1H7z"
                  />
                </svg>
                <div class="flex-1">
                  <strong class="text-slate-200">Scroll</strong> to zoom in/out on the canvas
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <ConfigDrawer :selected-node="selectedNode" @close="selectedNode = null" />
    </div>

    <!-- Trigger button -->
    <button
      @click="handleTrigger"
      :disabled="triggering"
      class="fixed bottom-24 right-4 z-50 px-2 py-2 rounded shadow-lg text-xs font-bold transition-colors disabled:opacity-50"
      :class="
        workflowStore.workflowStatus === 'PUBLISHED'
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
      "
    >
      <div class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
          <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
        {{ triggering ? 'Triggering…' : 'Trigger Execution' }}
      </div>
    </button>
  </div>
</template>
