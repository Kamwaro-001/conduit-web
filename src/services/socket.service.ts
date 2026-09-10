import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useWorkflowStore, type ConduitNodeData } from '../stores/useWorkflowStore'

export const telemetryState = ref({
  activeJobs: 0,
  workerHealth: '100.00',
})

class SocketService {
  private socket: Socket | null = null

  connect(workflowId: string) {
    // Disconnect any previous connection before creating a new one
    this.disconnect()

    this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000')

    this.socket.on('connect', () => {
      console.log('[Conduit] Connected to engine telemetry')
      this.socket?.emit('subscribe_workflow', workflowId)
    })

    this.socket.on(
      'node_status',
      (data: { nodeId: string; status: ConduitNodeData['status']; duration: number }) => {
        const store = useWorkflowStore()
        store.updateNodeStatus(data.nodeId, data.status, data.duration)
      },
    )

    this.socket.on('engine_telemetry', (data: { activeJobs: number; workerHealth: string }) => {
      telemetryState.value.activeJobs = data.activeJobs
      telemetryState.value.workerHealth = data.workerHealth
    })

    this.socket.on('disconnect', () => {
      console.log('[Conduit] Disconnected from engine telemetry')
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export const socketService = new SocketService()
