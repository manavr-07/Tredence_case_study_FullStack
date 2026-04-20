export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

export interface KeyValuePair {
  id: string
  key: string
  value: string
}

export interface StartNodeData {
  type: 'start'
  title: string
  metadata: KeyValuePair[]
}

export interface TaskNodeData {
  type: 'task'
  title: string
  description: string
  assignee: string
  dueDate: string
  customFields: KeyValuePair[]
}

export interface ApprovalNodeData {
  type: 'approval'
  title: string
  approverRole: 'Manager' | 'HRBP' | 'Director'
  autoApproveThreshold: number
}

export interface AutomatedNodeData {
  type: 'automated'
  title: string
  actionId: string
  actionParams: Record<string, string>
}

export interface EndNodeData {
  type: 'end'
  endMessage: string
  summaryFlag: boolean
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData

export interface AutomationAction {
  id: string
  label: string
  params: string[]
}

export interface SimulationStep {
  nodeId: string
  nodeTitle: string
  nodeType: WorkflowNodeType
  status: 'success' | 'error' | 'skipped'
  message: string
  timestamp: number
}

export interface SimulationResult {
  success: boolean
  steps: SimulationStep[]
  summary: string
  errors: string[]
}

export interface SimulatePayload {
  nodes: Array<{ id: string; type: WorkflowNodeType; data: WorkflowNodeData }>
  edges: Array<{ id: string; source: string; target: string }>
}

export interface ValidationError {
  nodeId?: string
  message: string
  severity: 'error' | 'warning'
}
