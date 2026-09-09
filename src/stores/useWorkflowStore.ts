import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { Node, Edge, Connection } from '@vue-flow/core'
import { apiService, type ApiWorkflow, type WorkflowStatus } from '@/services/api.service'

export interface ConditionRule {
  id: string
  field: string
  operator: string
  value: string
}

export interface ConduitNodeData {
  label: string   // display name — stored in config so it survives sync/reload
  description: string
  backendType: 'TRIGGER' | 'WEBHOOK' | 'CONDITION' | 'DELAY' | 'EMAIL'
  status?: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  executionTimeMs?: number
  outputPreview?: string
  rules?: ConditionRule[]
  matchType?: 'AND' | 'OR'
}

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes: Ref<Node<ConduitNodeData>[]> = ref([])
  const edges: Ref<Edge[]> = ref([])
  const workflowId: Ref<string | null> = ref(null)
  const workflowName: Ref<string> = ref('')
  const workflowStatus: Ref<WorkflowStatus | null> = ref(null)

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

  function removeNode(id: string) {
    nodes.value = nodes.value.filter((n) => n.id !== id)
  }

  function removeEdge(id: string) {
    edges.value = edges.value.filter((e) => e.id !== id)
  }

  function updateNodeStatus(
    nodeId: string,
    status: ConduitNodeData['status'],
    durationMs?: number,
  ) {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node?.data) {
      node.data.status = status
      if (durationMs !== undefined) node.data.executionTimeMs = durationMs
    }
  }

  function _applyWorkflow(workflow: ApiWorkflow) {
    workflowId.value = workflow.id
    workflowName.value = workflow.name
    workflowStatus.value = workflow.status

    nodes.value = workflow.nodes.map((apiNode) => ({
      id: apiNode.id,
      type: 'custom',
      position: apiNode.uiPosition,
      data: {
        label: (apiNode.config.label as string) ?? apiNode.type,
        backendType: apiNode.type,
        description: (apiNode.config.description as string) ?? '',
        rules: apiNode.config.rules as ConditionRule[] | undefined,
        matchType: apiNode.config.matchType as 'AND' | 'OR' | undefined,
        status: 'IDLE' as const,
      },
    }))

    edges.value = workflow.edges.map((apiEdge) => ({
      id: apiEdge.id,
      source: apiEdge.source,
      target: apiEdge.target,
      ...(apiEdge.source_handle && { sourceHandle: apiEdge.source_handle }),
      style: { stroke: '#8B5CF6', strokeWidth: 2 },
      animated: true,
    }))
  }

  async function loadWorkflow(id: string) {
    const workflow = await apiService.getWorkflow(id)
    _applyWorkflow(workflow)
  }

  async function syncCanvas() {
    if (!workflowId.value) throw new Error('No workflow loaded')

    const payload = {
      nodes: nodes.value.map((node) => {
        const {
          backendType,
          status: _s,
          executionTimeMs: _e,
          outputPreview: _o,
          ...config
        } = node.data!
        return {
          id: node.id,
          type: backendType,
          config,           // includes label, description, rules, matchType
          ui_position: node.position,
        }
      }),
      edges: edges.value.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        ...(edge.sourceHandle && { source_handle: edge.sourceHandle }),
      })),
    }

    const updated = await apiService.syncWorkflow(workflowId.value, payload)
    // Only refresh metadata — don't reload nodes/edges to avoid canvas flicker
    workflowName.value = updated.name
    workflowStatus.value = updated.status
    return updated
  }

  async function setWorkflowStatus(status: WorkflowStatus) {
    if (!workflowId.value) return
    const updated = await apiService.updateWorkflow(workflowId.value, { status })
    workflowStatus.value = updated.status
  }

  return {
    nodes,
    edges,
    workflowId,
    workflowName,
    workflowStatus,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    updateNodeStatus,
    loadWorkflow,
    syncCanvas,
    setWorkflowStatus,
  }
})
