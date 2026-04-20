import { useCallback, useRef, useState, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useWorkflow } from './hooks/useWorkflow'
import { useValidation } from './hooks/useValidation'
import { Sidebar } from './components/Sidebar'
import { NodeFormPanel } from './components/forms/NodeFormPanel'
import { SandboxPanel } from './components/SandboxPanel'
import {
  StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode,
  NodeMetaContext,
} from './components/nodes/NodeTypes'
import { NODE_CONFIG } from './components/nodes/nodeConfig'
import type { WorkflowNodeType, SimulationStep } from './types/workflow'
import type { ExecutionStatus } from './components/nodes/BaseNode'

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
}

export default function App() {
  const {
    nodes, edges, selectedNode, selectedNodeId, setSelectedNodeId,
    onNodesChange, onEdgesChange, onConnect, addNode, updateNodeData,
    deleteNode, clearCanvas, exportWorkflow, importWorkflow,
  } = useWorkflow()

  const [showSandbox, setShowSandbox] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<Record<string, ExecutionStatus>>({})
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<any>(null)

  const { errors: validationErrors, totalErrors, hasStart, hasEnd } = useValidation(nodes, edges)

  const validationErrorMessages = useMemo(() => {
    const map: Record<string, string[]> = {}
    Object.entries(validationErrors).forEach(([id, errs]) => {
      map[id] = errs.map((e) => e.message)
    })
    return map
  }, [validationErrors])

  const nodeMeta = useMemo(() => ({
    executionStatus,
    validationErrors: validationErrorMessages,
  }), [executionStatus, validationErrorMessages])

  const handleSimulationComplete = useCallback(async (steps: SimulationStep[]) => {
    if (steps.length === 0) { setExecutionStatus({}); return }
    const idle: Record<string, ExecutionStatus> = {}
    nodes.forEach((n) => { idle[n.id] = 'idle' })
    setExecutionStatus(idle)
    for (const step of steps) {
      setExecutionStatus((prev) => ({ ...prev, [step.nodeId]: 'running' }))
      await new Promise((r) => setTimeout(r, 800))
      setExecutionStatus((prev) => ({ ...prev, [step.nodeId]: step.status === 'success' ? 'success' : 'error' }))
      await new Promise((r) => setTimeout(r, 300))
    }
  }, [nodes])

  const handleSandboxClose = useCallback(() => {
    setShowSandbox(false)
    setTimeout(() => setExecutionStatus({}), 800)
  }, [])

  // ── Sidebar drag start — sets data for drop ──────────────────────────────
  const onDragStart = useCallback((e: React.DragEvent, type: WorkflowNodeType) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.setData('text/plain', type)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  // ── Canvas drop handlers — NO stopPropagation so ReactFlow internals work ─
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    const type = (
      e.dataTransfer.getData('application/reactflow') ||
      e.dataTransfer.getData('text/plain')
    ) as WorkflowNodeType

    // Only handle drops that come from our sidebar
    if (!type || !rfInstance) return
    if (!['start', 'task', 'approval', 'automated', 'end'].includes(type)) return

    const position = rfInstance.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    })

    addNode(type, position)
  }, [rfInstance, addNode])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => setSelectedNodeId(node.id), [setSelectedNodeId]
  )
  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId])

  const handleExport = useCallback(() => {
    const json = exportWorkflow()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'workflow.json'; a.click()
    URL.revokeObjectURL(url)
  }, [exportWorkflow])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => importWorkflow(ev.target?.result as string)
      reader.readAsText(file)
    }
    input.click()
  }, [importWorkflow])

  return (
    <NodeMetaContext.Provider value={nodeMeta}>
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0f1117', fontFamily: 'DM Sans, sans-serif' }}>
        <Sidebar
          onDragStart={onDragStart}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onClear={() => { clearCanvas(); setExecutionStatus({}) }}
          onExport={handleExport}
          onImport={handleImport}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
            style={{ background: '#13151c', borderColor: '#2a2d3a' }}>
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e8eaf0' }}>Canvas</h1>
              {nodes.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#f9731622', color: '#f97316' }}>
                  {nodes.length} nodes
                </span>
              )}
              {nodes.length > 0 && totalErrors > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#ef444422', color: '#ef4444' }}>
                  ⚠ {totalErrors} issue{totalErrors > 1 ? 's' : ''}
                </span>
              )}
              {nodes.length > 0 && totalErrors === 0 && hasStart && hasEnd && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#22c55e22', color: '#22c55e' }}>
                  ✓ Valid
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 mr-4">
                {(['start', 'task', 'approval', 'automated', 'end'] as WorkflowNodeType[]).map((type) => (
                  <div key={type} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: NODE_CONFIG[type].color }} />
                    <span className="text-xs" style={{ color: '#4b5563' }}>{NODE_CONFIG[type].label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowSandbox(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#f97316', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ea6c0e'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.transform = 'translateY(0)' }}>
                Simulate
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onInit={setRfInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode="Delete"
              nodesDraggable={true}
              panOnDrag={true}
              zoomOnScroll={true}
              style={{ background: '#0f1117' }}
              defaultEdgeOptions={{ style: { stroke: '#f97316', strokeWidth: 2 } }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e2130" />
              <Controls style={{ background: '#1c1f2a', border: '1px solid #2a2d3a', borderRadius: '12px', overflow: 'hidden' }} />
              <MiniMap
                style={{ background: '#13151c', border: '1px solid #2a2d3a', borderRadius: '12px' }}
                nodeColor={(n) => NODE_CONFIG[n.type as WorkflowNodeType]?.color ?? '#4b5563'}
                maskColor="rgba(15,17,23,0.8)"
              />
            </ReactFlow>

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-4xl mb-4 opacity-20">◈</p>
                  <p className="text-sm font-medium opacity-30" style={{ color: '#e8eaf0' }}>
                    Drag nodes from the sidebar to get started
                  </p>
                  <p className="text-xs mt-2 opacity-20" style={{ color: '#6b7280' }}>
                    Connect them, configure each node, then simulate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <NodeFormPanel
          node={selectedNode}
          onUpdate={updateNodeData}
          onDelete={deleteNode}
          onClose={() => setSelectedNodeId(null)}
        />

        {showSandbox && (
          <SandboxPanel
            nodes={nodes}
            edges={edges}
            onClose={handleSandboxClose}
            onSimulationComplete={handleSimulationComplete}
          />
        )}
      </div>
    </NodeMetaContext.Provider>
  )
}