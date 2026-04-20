import type { WorkflowNodeType } from '../../types/workflow'

export const NODE_CONFIG: Record<WorkflowNodeType, { label: string; color: string; bg: string; border: string; icon: string; description: string }> = {
  start:     { label: 'Start',     color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',   icon: '▶', description: 'Workflow entry point' },
  task:      { label: 'Task',      color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)',  icon: '◈', description: 'Human task step' },
  approval:  { label: 'Approval',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  icon: '◇', description: 'Requires sign-off' },
  automated: { label: 'Automated', color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.3)',  icon: '⚡', description: 'System-triggered action' },
  end:       { label: 'End',       color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',   icon: '■', description: 'Workflow completion' },
}
