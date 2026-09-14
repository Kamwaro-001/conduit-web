const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3000'
const TOKEN_KEY = 'conduit_token'

// ---- Shared types (mirrors backend DTOs / entities) ----

export type NodeType =
  | 'TRIGGER'
  | 'SCHEDULE'
  | 'DELAY'
  | 'EMAIL'
  | 'CONDITION'
  | 'WEBHOOK'
  | 'HTTP_FETCH'
  | 'VISION'
  | 'REGEX'
export type WorkflowStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type UserRole = 'ADMIN' | 'USER'

export interface ApiWorkflowNode {
  id: string
  type: NodeType
  config: Record<string, unknown>
  ui_position: { x: number; y: number }
}

export interface ApiWorkflowEdge {
  id: string
  source: string
  target: string
  source_handle: string | null
}

export interface ApiWorkflow {
  id: string
  name: string
  status: WorkflowStatus
  createdAt: string
  nodes: ApiWorkflowNode[]
  edges: ApiWorkflowEdge[]
}

export interface SyncNodeDto {
  id: string
  type: NodeType
  config: Record<string, unknown>
  ui_position: { x: number; y: number }
}

export interface SyncEdgeDto {
  id: string
  source: string
  target: string
  source_handle?: string
}

export interface SyncWorkflowPayload {
  nodes: SyncNodeDto[]
  edges: SyncEdgeDto[]
}

export interface UpdateWorkflowPayload {
  name?: string
  status?: WorkflowStatus
}

export interface TriggerWebhookResponse {
  message: string
  workflowId: string
  triggeredNodes: string[]
}

export interface AuthResponse {
  access_token: string
  user: { id: string; email: string; role: UserRole }
}

// ---- Internal fetch wrapper ----

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[${res.status}] ${path}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ---- API methods ----

export const apiService = {
  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<AuthResponse['user']>('/auth/me'),

  // Workflows
  createWorkflow: (name: string) =>
    request<ApiWorkflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getWorkflows: () => request<ApiWorkflow[]>('/workflows'),

  getWorkflow: (id: string) => request<ApiWorkflow>(`/workflows/${id}`),

  updateWorkflow: (id: string, payload: UpdateWorkflowPayload) =>
    request<ApiWorkflow>(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteWorkflow: (id: string) => request<void>(`/workflows/${id}`, { method: 'DELETE' }),

  syncWorkflow: (id: string, payload: SyncWorkflowPayload) =>
    request<ApiWorkflow>(`/workflows/${id}/sync`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Webhooks / Executions
  triggerWebhook: (workflowId: string, payload: Record<string, unknown> = {}) =>
    request<TriggerWebhookResponse>(`/webhooks/${workflowId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
