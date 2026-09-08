<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { markRaw, ref } from 'vue'
import {
  type Connection,
  type GraphNode,
  type NodeMouseEvent,
  useVueFlow,
  VueFlow,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import SidebarPalette from '../components/SidebarPalette.vue'
import ConfigDrawer from '../components/ConfigDrawer.vue'
import CustomNode from '../components/nodes/CustomNode.vue'
import { useWorkflowStore } from '../stores/useWorkflowStore'
import TopNavbar from '@/components/TopNavbar.vue'

const workflowStore = useWorkflowStore()
// const selectedNode = ref(null)
const selectedNode = ref<GraphNode | null>(null)

const nodeTypes = {
  custom: markRaw(CustomNode),
}

const { screenToFlowCoordinate } = useVueFlow()

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  const isWebhook = type === 'webhook'
  const isCondition = type === 'condition'

  const newNode = {
    id: `node_${Date.now()}`,
    type: 'custom',
    position,
    label: isWebhook ? 'Webhook Trigger' : isCondition ? 'KYC & Age Check' : 'Send Welcome Email',
    data: {
      description: isWebhook
        ? 'POST /v1/user/signup'
        : isCondition
          ? 'Condition Rule (AND)'
          : 'Template: auth-kyc-welcome',
      backendType: (isWebhook ? 'WEBHOOK' : isCondition ? 'CONDITION' : 'EMAIL') as 'WEBHOOK' | 'CONDITION' | 'EMAIL',
      status: 'IDLE' as const,
    },
  }

  workflowStore.addNode(newNode)
}

// allow dropping by preventing default dragover behavior
function onNodeClick(e: NodeMouseEvent) {
  selectedNode.value = e.node
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onConnect = (connection: Connection) => {
  workflowStore.addEdge(connection)
  console.log('hey')
}
</script>

<template>
  <div class="h-screen w-screen bg-[#0F172A] flex flex-col font-sans overflow-hidden">
    <TopNavbar />

    <!-- Main Workspace Area -->
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
      </main>

      <ConfigDrawer :selected-node="selectedNode" />
    </div>
  </div>
</template>
