import { defineStore } from 'pinia'
import { ref, computed, watch, type Ref } from 'vue'
import type { Node, Edge, Connection } from '@vue-flow/core'
import { apiService, type ApiWorkflow, type WorkflowStatus } from '@/services/api.service'

export interface ConditionRule {
  id: string
  field: string
  operator: string
  value: string
}

export interface ConduitNodeData {
  label: string // display name — stored in config so it survives sync/reload
  description: string
  backendType:
    | 'TRIGGER'
    | 'SCHEDULE'
    | 'DELAY'
    | 'CONDITION'
    | 'EMAIL'
    | 'WEBHOOK'
    | 'HTTP_FETCH'
    | 'VISION'
    | 'REGEX'
  status?: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  executionTimeMs?: number
  outputPreview?: string
  // CONDITION
  rules?: ConditionRule[]
  matchType?: 'AND' | 'OR'
  // HTTP_FETCH
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url?: string
  // DELAY
  delay_ms?: number
  // EMAIL
  recipient?: string
  subject?: string
  body?: string
  // SCHEDULE
  cronExpression?: string
  // VISION
  prompt?: string
  imageUrlField?: string
  model?: string

  // REGEX
  pattern?: string
  inputField?: string
  flags?: string
}

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes: Ref<Node<ConduitNodeData>[]> = ref([])
  const edges: Ref<Edge[]> = ref([])
  const workflowId: Ref<string | null> = ref(null)
  const workflowName: Ref<string> = ref('')
  const workflowStatus: Ref<WorkflowStatus | null> = ref(null)

  const lastSavedHistoryIndex = ref(0)
  const hasUnsavedChanges = computed(() => lastSavedHistoryIndex.value !== historyIndex.value)

  function addNode(node: Node<ConduitNodeData>) {
    nodes.value.push(node)
  }

  function addEdge(connection: Connection) {
    // 1. Prevent multiple edges between the exact same two nodes
    // (e.g. dragging the same connection twice, or routing both True/False handles to the same node)
    const isAlreadyConnected = edges.value.some(
      (e) => e.source === connection.source && e.target === connection.target,
    )
    if (isAlreadyConnected) return

    // 2. A source handle can only have ONE outgoing connection.
    // If one already exists (pointing to a different target), we remove it to allow "re-routing".
    const existingIndex = edges.value.findIndex(
      (e) => e.source === connection.source && e.sourceHandle === connection.sourceHandle,
    )
    if (existingIndex !== -1) {
      edges.value.splice(existingIndex, 1)
    }

    // Since a source handle only has one output, this ID is inherently unique per workflow
    const handleId = connection.sourceHandle || 'default'
    const newEdge: Edge = {
      id: `edge_${connection.source}_${handleId}`,
      source: connection.source,
      target: connection.target,
      ...(connection.sourceHandle && { sourceHandle: connection.sourceHandle }),
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

  // History for Undo/Redo
  interface Snapshot {
    nodes: Node<ConduitNodeData>[]
    edges: Edge[]
  }
  const history = ref<Snapshot[]>([])
  const historyIndex = ref(-1)
  const isUndoRedo = ref(false)

  function getCleanState() {
    return {
      nodes: nodes.value.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.position.x, y: n.position.y },
        data: JSON.parse(JSON.stringify(n.data)),
      })),
      edges: edges.value.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
      })),
    }
  }

  function takeSnapshot() {
    if (isUndoRedo.value) return

    const currentStateStr = JSON.stringify(getCleanState())

    if (historyIndex.value >= 0 && historyIndex.value < history.value.length) {
      const lastSnapshotStr = JSON.stringify(history.value[historyIndex.value])
      if (currentStateStr === lastSnapshotStr) {
        return // Avoid spurious snapshots from Vue Flow internal changes
      }
    }

    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push(JSON.parse(currentStateStr))
    if (history.value.length > 50) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function resetHistory() {
    history.value = []
    historyIndex.value = -1
    lastSavedHistoryIndex.value = 0
    isUndoRedo.value = false
    takeSnapshot()
  }

  function undo() {
    if (historyIndex.value > 0) {
      isUndoRedo.value = true
      historyIndex.value--
      const snapshot = history.value[historyIndex.value] as Snapshot
      nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
      edges.value = JSON.parse(JSON.stringify(snapshot.edges))
      setTimeout(() => {
        isUndoRedo.value = false
      }, 100)
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      isUndoRedo.value = true
      historyIndex.value++
      const snapshot = history.value[historyIndex.value] as Snapshot
      nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
      edges.value = JSON.parse(JSON.stringify(snapshot.edges))
      setTimeout(() => {
        isUndoRedo.value = false
      }, 100)
    }
  }

  function discardUnsavedChanges() {
    if (lastSavedHistoryIndex.value !== -1 && lastSavedHistoryIndex.value < history.value.length) {
      isUndoRedo.value = true
      historyIndex.value = lastSavedHistoryIndex.value
      const snapshot = history.value[historyIndex.value] as Snapshot
      nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
      edges.value = JSON.parse(JSON.stringify(snapshot.edges))
      setTimeout(() => {
        isUndoRedo.value = false
      }, 100)
    }
  }

  let snapshotTimeout: ReturnType<typeof setTimeout> | null = null
  watch(
    [nodes, edges],
    () => {
      if (isUndoRedo.value) return
      if (snapshotTimeout) clearTimeout(snapshotTimeout)
      snapshotTimeout = setTimeout(() => {
        takeSnapshot()
      }, 400)
    },
    { deep: true },
  )

  function _applyWorkflow(workflow: ApiWorkflow) {
    workflowId.value = workflow.id
    workflowName.value = workflow.name
    workflowStatus.value = workflow.status

    nodes.value = workflow.nodes.map((apiNode) => ({
      id: apiNode.id,
      type: 'custom',
      position: apiNode.ui_position,
      data: {
        label: (apiNode.config.label as string) ?? apiNode.type,
        backendType: apiNode.type as ConduitNodeData['backendType'],
        description: (apiNode.config.description as string) ?? '',
        ...apiNode.config,
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
    resetHistory()
  }

  async function syncCanvas() {
    if (!workflowId.value) throw new Error('No workflow loaded')

    const payload = {
      nodes: nodes.value.map((node) => {
        const { backendType, status, executionTimeMs, outputPreview, ...config } = node.data!
        return {
          id: node.id,
          type: backendType,
          config,
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
    workflowName.value = updated.name
    workflowStatus.value = updated.status
    lastSavedHistoryIndex.value = historyIndex.value
    return updated
  }

  async function renameWorkflow(name: string) {
    if (!workflowId.value) return
    const updated = await apiService.updateWorkflow(workflowId.value, { name })
    workflowName.value = updated.name
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
    hasUnsavedChanges,
    historyIndex,
    historyLength: computed(() => history.value.length),
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    updateNodeStatus,
    loadWorkflow,
    syncCanvas,
    renameWorkflow,
    setWorkflowStatus,
    undo,
    redo,
    discardUnsavedChanges,
  }
})
