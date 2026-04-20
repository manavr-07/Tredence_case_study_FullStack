import { useState } from 'react'
import { mockApi } from '../api/mockApi'
import type { SimulationResult, SimulationStep } from '../types/workflow'
import type { WorkflowNode } from '../hooks/useWorkflow'
import type { Edge } from 'reactflow'
import { NODE_CONFIG } from './nodes/nodeConfig'

interface SandboxPanelProps {
  nodes: WorkflowNode[]
  edges: Edge[]
  onClose: () => void
  onSimulationComplete: (steps: SimulationStep[]) => void
}

type PanelState = 'idle' | 'loading' | 'done'

export function SandboxPanel({ nodes, edges, onClose, onSimulationComplete }: SandboxPanelProps) {
  const [state, setState] = useState<PanelState>('idle')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [visibleSteps, setVisibleSteps] = useState<number>(-1)

  const handleSimulate = async () => {
    if (nodes.length === 0) return
    setState('loading')
    setResult(null)
    setVisibleSteps(-1)

    const payload = {
      nodes: nodes.map((n) => ({ id: n.id, type: n.data.type, data: n.data })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    }

    const res = await mockApi.simulate(payload)
    setResult(res)
    setState('done')

    // Trigger canvas animation
    onSimulationComplete(res.steps)

    // Animate log entries
    for (let i = 0; i < res.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 700))
      setVisibleSteps(i)
    }
  }

  const handleReset = () => {
    setState('idle')
    setResult(null)
    setVisibleSteps(-1)
    onSimulationComplete([])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#16181f', border: '1px solid #2a2d3a', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2a2d3a] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e8eaf0' }}>
              Workflow Sandbox
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
              {nodes.length} node(s) · {edges.length} connection(s)
            </p>
          </div>
          <button onClick={onClose} className="text-lg transition-colors" style={{ color: '#4b5563' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e8eaf0' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4b5563' }}>✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {state === 'idle' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl"
                style={{ background: '#f9731611', border: '1px solid #f9731633' }}>⚡</div>
              <p className="text-sm font-medium" style={{ color: '#e8eaf0' }}>Ready to simulate</p>
              <p className="text-xs mt-2 max-w-xs" style={{ color: '#4b5563' }}>
                Validates your workflow structure and runs a step-by-step dry run.
              </p>
            </div>
          )}

          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex gap-1 mb-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#f97316', animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <p className="text-sm" style={{ color: '#6b7280' }}>Running simulation...</p>
            </div>
          )}

          {state === 'done' && result && (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <div className="px-4 py-3 rounded-xl"
                style={{ background: result.success ? '#22c55e11' : '#ef444411', border: `1px solid ${result.success ? '#22c55e33' : '#ef444433'}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: result.success ? '#22c55e' : '#ef4444' }}>{result.success ? '✓' : '✗'}</span>
                  <p className="text-sm font-medium" style={{ color: result.success ? '#22c55e' : '#ef4444' }}>{result.summary}</p>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ef4444' }}>Validation Errors</p>
                  {result.errors.map((err, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: '#ef444411', color: '#ef4444', border: '1px solid #ef444422' }}>⚠ {err}</div>
                  ))}
                </div>
              )}

              {/* Execution log */}
              {result.steps.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Execution Log</p>
                  {result.steps.map((step, i) => {
                    const config = NODE_CONFIG[step.nodeType]
                    const isVisible = i <= visibleSteps
                    return (
                      <div key={step.nodeId}
                        className="flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-500"
                        style={{
                          background: isVisible ? config.bg : 'transparent',
                          border: `1px solid ${isVisible ? config.border : 'transparent'}`,
                          opacity: isVisible ? 1 : 0.15,
                          transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
                        }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono mt-0.5"
                          style={{ background: isVisible ? config.color : '#2a2d3a', color: '#fff' }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: config.color }}>{config.icon}</span>
                            <p className="text-sm font-medium truncate" style={{ color: '#e8eaf0' }}>{step.nodeTitle}</p>
                            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: '#22c55e22', color: '#22c55e' }}>success</span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{step.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2d3a] flex gap-3">
          {state !== 'loading' && (
            <button onClick={state === 'done' ? handleReset : handleSimulate}
              disabled={nodes.length === 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: nodes.length === 0 ? '#2a2d3a' : '#f97316', color: nodes.length === 0 ? '#4b5563' : '#fff', cursor: nodes.length === 0 ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (nodes.length > 0) e.currentTarget.style.background = '#ea6c0e' }}
              onMouseLeave={(e) => { if (nodes.length > 0) e.currentTarget.style.background = '#f97316' }}>
              {state === 'done' ? '↺ Run Again' : '▶ Run Simulation'}
            </button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#1c1f2a', color: '#9ca3af', border: '1px solid #2a2d3a' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4b5563' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2d3a' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
