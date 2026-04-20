import type { WorkflowNode } from '../../hooks/useWorkflow'
import type { WorkflowNodeData } from '../../types/workflow'
import { NODE_CONFIG } from '../nodes/nodeConfig'
import { StartForm, TaskForm, ApprovalForm, AutomatedForm, EndForm } from './NodeForms'

interface NodeFormPanelProps {
  node: WorkflowNode | null
  onUpdate: (nodeId: string, data: Partial<WorkflowNodeData>) => void
  onDelete: (nodeId: string) => void
  onClose: () => void
}

export function NodeFormPanel({ node, onUpdate, onDelete, onClose }: NodeFormPanelProps) {
  if (!node) return null

  const config = NODE_CONFIG[node.data.type]

  const renderForm = () => {
    switch (node.data.type) {
      case 'start':     return <StartForm data={node.data} onChange={(p) => onUpdate(node.id, p)} />
      case 'task':      return <TaskForm data={node.data} onChange={(p) => onUpdate(node.id, p)} />
      case 'approval':  return <ApprovalForm data={node.data} onChange={(p) => onUpdate(node.id, p)} />
      case 'automated': return <AutomatedForm data={node.data} onChange={(p) => onUpdate(node.id, p)} />
      case 'end':       return <EndForm data={node.data} onChange={(p) => onUpdate(node.id, p)} />
    }
  }

  return (
    <aside className="w-72 flex flex-col h-full" style={{ background: '#13151c', borderLeft: '1px solid #2a2d3a' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#2a2d3a] flex items-center justify-between"
        style={{ borderLeft: `3px solid ${config.color}` }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: config.color }}>{config.icon}</span>
            <span className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e8eaf0' }}>
              {config.label} Node
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>ID: {node.id}</p>
        </div>
        <button onClick={onClose} className="text-lg transition-colors" style={{ color: '#4b5563' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#e8eaf0' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563' }}>✕</button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5">{renderForm()}</div>

      {/* Delete */}
      <div className="px-5 py-4 border-t border-[#2a2d3a]">
        <button onClick={() => onDelete(node.id)} className="w-full py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: '#ef444411', color: '#ef4444', border: '1px solid #ef444433' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ef444422' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ef444411' }}>
          Delete Node
        </button>
      </div>
    </aside>
  )
}
