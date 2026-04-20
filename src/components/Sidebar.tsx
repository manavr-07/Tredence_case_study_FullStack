import { useState } from 'react'
import type { WorkflowNodeType } from '../types/workflow'
import { NODE_CONFIG } from './nodes/nodeConfig'

interface SidebarProps {
  onDragStart: (e: React.DragEvent, type: WorkflowNodeType) => void
  nodeCount: number
  edgeCount: number
  onClear: () => void
  onExport: () => void
  onImport: () => void
}

const NODE_ORDER: WorkflowNodeType[] = ['start', 'task', 'approval', 'automated', 'end']

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { icon: '▦', label: 'Dashboard', active: true },
      { icon: '◎', label: 'Workflows' },
      { icon: '◈', label: 'Templates' },
      { icon: '↗', label: 'Analytics' },
    ],
  },
  {
    label: 'Automation',
    items: [
      { icon: '⟳', label: 'Integrations' },
      { icon: '▤', label: 'Repository' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { icon: '◉', label: 'Members' },
      { icon: '☰', label: 'Inbox', badge: '13' },
      { icon: '✉', label: 'Messages' },
    ],
  },
]

export function Sidebar({ onDragStart, nodeCount, edgeCount, onClear, onExport, onImport }: SidebarProps) {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [nodesOpen, setNodesOpen] = useState(true)

  return (
    <aside className="w-64 flex flex-col h-full" style={{ background: '#1e2130', borderRight: '1px solid #2e3347' }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#2e3347] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f97316' }}>
            <span className="text-white text-xs font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>FC</span>
          </div>
          <span className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>FlowCraft</span>
        </div>
        <div className="flex items-center gap-1.5">
          {['⟳', '↗'].map((icon) => (
            <button key={icon} className="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#e2e8f0' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b' }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Nav + palette */}
      <div className="flex-1 overflow-y-auto py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-5 mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = activeNav === item.label
              return (
                <button key={item.label} onClick={() => setActiveNav(item.label)}
                  className="w-full flex items-center gap-3 px-5 py-2 text-left transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid #f97316' : '2px solid transparent',
                    color: isActive ? '#f97316' : '#94a3b8',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#e2e8f0' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#94a3b8' }}>
                  <span className="text-sm w-4">{item.icon}</span>
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#2e3347', color: '#94a3b8' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        <div className="mx-5 my-3 border-t border-[#2e3347]" />

        {/* Stats */}
        <div className="px-5 mb-4 flex gap-3">
          <div className="flex-1 px-3 py-2 rounded-lg" style={{ background: '#252a3a' }}>
            <p className="text-xs" style={{ color: '#475569' }}>Nodes</p>
            <p className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f97316' }}>{nodeCount}</p>
          </div>
          <div className="flex-1 px-3 py-2 rounded-lg" style={{ background: '#252a3a' }}>
            <p className="text-xs" style={{ color: '#475569' }}>Edges</p>
            <p className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#a855f7' }}>{edgeCount}</p>
          </div>
        </div>

        {/* Node palette */}
        <div className="px-5">
          <button onClick={() => setNodesOpen(!nodesOpen)}
            className="w-full flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Node Types</p>
            <span className="text-xs" style={{ color: '#475569', display: 'inline-block', transform: nodesOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>▾</span>
          </button>

          {nodesOpen && (
            <div className="flex flex-col gap-1.5">
              {NODE_ORDER.map((type) => {
                const config = NODE_CONFIG[type]
                return (
                  <div key={type} draggable onDragStart={(e) => onDragStart(e, type)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 group"
                    style={{ background: config.bg, border: `1px solid ${config.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = config.color; e.currentTarget.style.transform = 'translateX(3px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = config.border; e.currentTarget.style.transform = 'translateX(0)' }}>
                    <span className="text-sm" style={{ color: config.color }}>{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{config.label}</p>
                      <p className="text-xs truncate" style={{ color: '#475569' }}>{config.description}</p>
                    </div>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: config.color }}>⋮⋮</span>
                  </div>
                )
              })}
              <p className="text-xs mt-1 italic" style={{ color: '#334155' }}>Drag onto canvas to add</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-5 py-4 border-t border-[#2e3347] flex flex-col gap-2">
        <div className="flex gap-2">
          <button onClick={onExport} className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: '#252a3a', color: '#94a3b8', border: '1px solid #2e3347' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e3347'; e.currentTarget.style.color = '#94a3b8' }}>
            ↑ Export
          </button>
          <button onClick={onImport} className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: '#252a3a', color: '#94a3b8', border: '1px solid #2e3347' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.color = '#a855f7' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e3347'; e.currentTarget.style.color = '#94a3b8' }}>
            ↓ Import
          </button>
        </div>
        <button onClick={onClear} className="w-full py-2 rounded-lg text-xs font-medium transition-all"
          style={{ background: '#252a3a', color: '#64748b', border: '1px solid #2e3347' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e3347'; e.currentTarget.style.color = '#64748b' }}>
          ✕ Clear Canvas
        </button>

        <div className="flex items-center gap-2 mt-1 pt-3 border-t border-[#2e3347]">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#f97316', color: '#fff' }}>HR</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#e2e8f0' }}>HR Admin</p>
            <p className="text-xs truncate" style={{ color: '#475569' }}>admin@company.com</p>
          </div>
          <button className="text-xs flex-shrink-0 transition-colors" style={{ color: '#475569' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e2e8f0' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569' }}>⚙</button>
        </div>
      </div>
    </aside>
  )
}
