import { createContext, useContext } from 'react'
import type { NodeProps } from 'reactflow'
import type { StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, EndNodeData } from '../../types/workflow'
import { BaseNode, type ExecutionStatus } from './BaseNode'

// ─── Context to pass execution + validation state into nodes ─────────────────
interface NodeMetaContextType {
  executionStatus: Record<string, ExecutionStatus>
  validationErrors: Record<string, string[]>
}

export const NodeMetaContext = createContext<NodeMetaContextType>({
  executionStatus: {},
  validationErrors: {},
})

function useMeta(id: string) {
  const ctx = useContext(NodeMetaContext)
  return {
    executionStatus: ctx.executionStatus[id] ?? 'idle',
    validationErrors: ctx.validationErrors[id] ?? [],
  }
}

// ─── Node Components ─────────────────────────────────────────────────────────
export function StartNode({ id, data, selected }: NodeProps<StartNodeData>) {
  const { executionStatus, validationErrors } = useMeta(id)
  return <BaseNode id={id} type="start" title={data.title || 'Start'}
    subtitle={data.metadata.length > 0 ? `${data.metadata.length} metadata field(s)` : 'Workflow entry point'}
    selected={selected} showTarget={false} executionStatus={executionStatus} validationErrors={validationErrors} />
}

export function TaskNode({ id, data, selected }: NodeProps<TaskNodeData>) {
  const { executionStatus, validationErrors } = useMeta(id)
  return <BaseNode id={id} type="task" title={data.title || 'Task'}
    subtitle={data.assignee ? `Assignee: ${data.assignee}` : data.description || 'Human task step'}
    selected={selected} executionStatus={executionStatus} validationErrors={validationErrors} />
}

export function ApprovalNode({ id, data, selected }: NodeProps<ApprovalNodeData>) {
  const { executionStatus, validationErrors } = useMeta(id)
  return <BaseNode id={id} type="approval" title={data.title || 'Approval'}
    subtitle={`Approver: ${data.approverRole}`}
    selected={selected} executionStatus={executionStatus} validationErrors={validationErrors} />
}

export function AutomatedNode({ id, data, selected }: NodeProps<AutomatedNodeData>) {
  const { executionStatus, validationErrors } = useMeta(id)
  return <BaseNode id={id} type="automated" title={data.title || 'Automated Step'}
    subtitle={data.actionId ? `Action: ${data.actionId}` : 'No action selected'}
    selected={selected} executionStatus={executionStatus} validationErrors={validationErrors} />
}

export function EndNode({ id, data, selected }: NodeProps<EndNodeData>) {
  const { executionStatus, validationErrors } = useMeta(id)
  return <BaseNode id={id} type="end" title={data.endMessage || 'End'}
    subtitle={data.summaryFlag ? 'Summary enabled' : 'Workflow completion'}
    selected={selected} showSource={false} executionStatus={executionStatus} validationErrors={validationErrors} />
}
