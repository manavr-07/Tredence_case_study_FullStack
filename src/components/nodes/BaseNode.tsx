import { Handle, Position } from 'reactflow'
import type { WorkflowNodeType } from '../../types/workflow'
import { NODE_CONFIG } from './nodeConfig'

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error'

interface BaseNodeProps {
  id: string
  type: WorkflowNodeType
  title: string
  subtitle?: string
  selected: boolean
  showSource?: boolean
  showTarget?: boolean
  executionStatus?: ExecutionStatus
  validationErrors?: string[]
}

export function BaseNode({
  type, title, subtitle, selected,
  showSource = true, showTarget = true,
  executionStatus = 'idle', validationErrors = [],
}: BaseNodeProps) {
  const config = NODE_CONFIG[type]
  const hasErrors = validationErrors.length > 0
  const isRunning = executionStatus === 'running'
  const isSuccess = executionStatus === 'success'
  const isError = executionStatus === 'error'

  const borderColor = isRunning ? '#facc15'
    : isSuccess ? '#22c55e'
      : isError ? '#ef4444'
        : selected ? config.color
          : hasErrors ? '#ef444466'
            : config.border

  const boxShadow = isRunning
    ? '0 0 0 3px #facc1544, 0 0 24px #facc1544'
    : isSuccess
      ? '0 0 0 3px #22c55e44, 0 0 24px #22c55e33'
      : selected
        ? `0 0 0 3px ${config.color}22, 0 8px 32px rgba(0,0,0,0.4)`
        : hasErrors
          ? '0 0 0 2px #ef444422, 0 4px 16px rgba(0,0,0,0.3)'
          : '0 4px 16px rgba(0,0,0,0.3)'

  return (
    <div
      className={`relative min-w-[180px] max-w-[220px] rounded-xl transition-all duration-300 ${isRunning ? 'node-running' : ''}`}
      style={{
        background: isSuccess ? 'rgba(34,197,94,0.1)' : isRunning ? 'rgba(250,204,21,0.08)' : config.bg,
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        transform: isRunning ? 'scale(1.04)' : 'scale(1)',
        cursor: 'grab',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 rounded-t-xl w-full transition-all duration-300"
        style={{ background: isRunning ? '#facc15' : isSuccess ? '#22c55e' : config.color }} />

      {/* Content — pointer-events none so ReactFlow handles drag */}
      <div className="px-4 py-3" style={{ pointerEvents: 'none' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ color: config.color, background: `${config.color}18`, border: `1px solid ${config.color}33` }}>
            {config.icon} {config.label}
          </span>

          {isRunning && (
            <span className="ml-auto flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce"
                  style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
          )}
          {isSuccess && <span className="ml-auto text-green-400 font-bold text-sm">✓</span>}
          {isError && <span className="ml-auto text-red-400 font-bold text-sm">✗</span>}

          {executionStatus === 'idle' && hasErrors && (
            <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{ background: '#ef444422', border: '1px solid #ef444444' }}
              title={validationErrors.join(' · ')}>
              <span className="text-red-400 text-xs">⚠</span>
              <span className="text-red-400 text-xs font-mono">{validationErrors.length}</span>
            </div>
          )}
        </div>

        <p className="text-sm font-semibold leading-tight truncate"
          style={{ color: '#e8eaf0', fontFamily: 'Syne, sans-serif' }}>
          {title}
        </p>

        {subtitle && (
          <p className="text-xs mt-1 truncate" style={{ color: '#6b7280' }}>{subtitle}</p>
        )}

        {executionStatus === 'idle' && hasErrors && (
          <p className="text-xs mt-1.5 truncate" style={{ color: '#ef4444' }}>
            {validationErrors[0]}
          </p>
        )}
      </div>

      {showTarget && (
        <Handle type="target" position={Position.Top}
          style={{ background: config.color, border: '2px solid #1c1f2a', width: 10, height: 10 }} />
      )}
      {showSource && (
        <Handle type="source" position={Position.Bottom}
          style={{ background: config.color, border: '2px solid #1c1f2a', width: 10, height: 10 }} />
      )}
    </div>
  )
}