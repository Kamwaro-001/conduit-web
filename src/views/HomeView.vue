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
      if (node) node.position = change.position
    }
    if (change.type === 'remove') {
      workflowStore.removeNode(change.id)
    }
  }
})

onEdgesChange((changes: EdgeChange[]) => {
  for (const change of changes) {
    if (change.type === 'remove') {
      workflowStore.removeEdge(change.id)
    }
  }
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const id = route.params.id as string
  try {
    await workflowStore.loadWorkflow(id)
    socketService.connect(id)
  } catch {
    showToast('Failed to load workflow.', 'error')
  }
})

onUnmounted(() => {
  socketService.disconnect()
})

// ── Canvas interactions ───────────────────────────────────────────────────────
const NODE_DEFAULTS: Record<
  string,
  { label: string; description: string; backendType: ConduitNodeData['backendType'] }
> = {
  manual: { label: 'Manual Trigger', description: 'Execute from dashboard', backendType: 'MANUAL' },
  webhook: { label: 'Webhook Trigger', description: 'POST /v1/webhook', backendType: 'WEBHOOK' },
  trigger: { label: 'App Trigger', description: 'Manual execution', backendType: 'TRIGGER' },
  event: { label: 'Event Trigger', description: 'Listen to system events', backendType: 'EVENT' },
  condition: {
    label: 'Condition / Branch',
    description: 'IF / ELSE logic',
    backendType: 'CONDITION',
    rules: [],
    matchType: 'AND',
  },
  switch: { label: 'Switch / Router', description: 'Multi-path routing', backendType: 'SWITCH' },
  loop: { label: 'Loop / Iterator', description: 'Iterate over arrays', backendType: 'LOOP' },
  merge: { label: 'Merge', description: 'Wait for branches', backendType: 'MERGE' },
  delay: { label: 'Delay', description: '5 seconds', backendType: 'DELAY' },
  http: { label: 'HTTP Request', description: 'REST API Request', backendType: 'HTTP' },
  transform: { label: 'Data Transform', description: 'Map payload data', backendType: 'TRANSFORM' },
  code: { label: 'Custom Code', description: 'JS/TS Code execution', backendType: 'CODE' },
  email: { label: 'Send Email', description: 'Template: welcome-email', backendType: 'EMAIL' },
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
}

// ── Trigger execution ─────────────────────────────────────────────────────────
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
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="text-center space-y-2">
            <p class="text-slate-600 text-sm font-mono">
              Drag nodes from the palette to get started
            </p>
          </div>
        </div>
      </main>

      <ConfigDrawer :selected-node="selectedNode" @close="selectedNode = null" />
    </div>

    <!-- Trigger button -->
    <button
      @click="handleTrigger"
      :disabled="triggering"
      class="fixed bottom-24 right-4 z-50 px-4 py-2 rounded shadow-lg text-xs font-bold transition-colors disabled:opacity-50"
      :class="
        workflowStore.workflowStatus === 'PUBLISHED'
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
      "
    >
      {{ triggering ? '⏳ Triggering…' : '▶ Trigger Execution' }}
    </button>
  </div>
</template>
