import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { Node, Edge, Connection } from '@vue-flow/core'

export interface ConditionRule {
  id: string
  field: string
  operator: string
  value: string
}

export interface ConduitNodeData {
  description: string
  backendType: 'TRIGGER' | 'WEBHOOK' | 'CONDITION' | 'DELAY' | 'EMAIL'
  status?: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  executionTimeMs?: number
  outputPreview?: string
  rules?: ConditionRule[]
  matchType?: 'AND' | 'OR'
}

export const useWorkflowStore = defineStore('workflow', () => {
  // const nodes = ref<Node<ConduitNodeData>[]>([])
  const nodes: Ref<Node<ConduitNodeData>[]> = ref([])
  const edges: Ref<Edge[]> = ref([])

  function addNode(node: Node<ConduitNodeData>) {
    nodes.value.push(node)
  }

  function addEdge(connection: Connection) {
    const newEdge: Edge = {
      id: `edge_${connection.source}_${connection.target}`,
      source: connection.source,
      target: connection.target,
      style: { stroke: '#8B5CF6', strokeWidth: 2 },
      animated: true,
    }
    edges.value.push(newEdge)
  }

  // Called by your SocketService when a 'node_status' event arrives
  function updateNodeStatus(nodeId: string, status: ConduitNodeData['status']) {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node && node.data) {
      node.data.status = status
    }
  }

  return { nodes, edges, addNode, addEdge, updateNodeStatus }
})
