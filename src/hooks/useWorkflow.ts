import { useState, useCallback } from 'react'
import { addEdge, applyNodeChanges, applyEdgeChanges, type Node, type Edge, type OnConnect, type OnNodesChange, type OnEdgesChange } from 'reactflow'
import type { WorkflowNodeData, WorkflowNodeType } from '../types/workflow'

export type WorkflowNode = Node<WorkflowNodeData>

let nodeCounter = 0
const getId = () => `node_${++nodeCounter}_${Date.now()}`

function getDefaultData(type: WorkflowNodeType): WorkflowNodeData {
  switch (type) {
    case 'start': return { type: 'start', title: 'Start', metadata: [] }
    case 'task': return { type: 'task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] }
    case 'approval': return { type: 'approval', title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 }
    case 'automated': return { type: 'automated', title: 'Automated Step', actionId: '', actionParams: {} }
    case 'end': return { type: 'end', endMessage: 'Workflow Complete', summaryFlag: false }
  }
}

export function useWorkflow() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []
  )
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []
  )
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, style: { stroke: '#f97316', strokeWidth: 2 } }, eds)), []
  )

  const addNode = useCallback((type: WorkflowNodeType, position: { x: number; y: number }) => {
    const id = getId()
    setNodes((nds) => [...nds, { id, type, position, data: getDefaultData(type) }])
    setSelectedNodeId(id)
    return id
  }, [])

  const updateNodeData = useCallback((nodeId: string, data: Partial<WorkflowNodeData>) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n))
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
  }, [])

  const clearCanvas = useCallback(() => {
    setNodes([]); setEdges([]); setSelectedNodeId(null)
  }, [])

  const exportWorkflow = useCallback(() => JSON.stringify({ nodes, edges }, null, 2), [nodes, edges])

  const importWorkflow = useCallback((json: string) => {
    try {
      const { nodes: n, edges: e } = JSON.parse(json)
      setNodes(n); setEdges(e); setSelectedNodeId(null)
      return true
    } catch { return false }
  }, [])

  return {
    nodes, edges,
    selectedNode: nodes.find((n) => n.id === selectedNodeId) ?? null,
    selectedNodeId, setSelectedNodeId,
    onNodesChange, onEdgesChange, onConnect,
    addNode, updateNodeData, deleteNode, clearCanvas, exportWorkflow, importWorkflow,
  }
}
