import { useMemo } from 'react'
import type { Edge } from 'reactflow'
import type { WorkflowNode } from './useWorkflow'
import type { TaskNodeData, AutomatedNodeData, ValidationError } from '../types/workflow'

export function useValidation(nodes: WorkflowNode[], edges: Edge[]) {
  const errors = useMemo(() => {
    const errorMap: Record<string, ValidationError[]> = {}

    const addError = (nodeId: string, message: string) => {
      if (!errorMap[nodeId]) errorMap[nodeId] = []
      errorMap[nodeId].push({ nodeId, message, severity: 'error' })
    }

    const connectedIds = new Set<string>()
    edges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target) })

    nodes.forEach((node) => {
      const data = node.data
      if (nodes.length > 1 && !connectedIds.has(node.id)) {
        addError(node.id, 'Node is not connected')
      }
      switch (data.type) {
        case 'task': {
          const t = data as TaskNodeData
          if (!t.title || t.title.trim() === '' || t.title === 'New Task') {
            addError(node.id, 'Title is required')
          }
          break
        }
        case 'automated': {
          const a = data as AutomatedNodeData
          if (!a.actionId) addError(node.id, 'No action selected')
          break
        }
        case 'start': {
          if (nodes.length > 1 && !edges.some((e) => e.source === node.id)) {
            addError(node.id, 'No outgoing connection')
          }
          break
        }
        case 'end': {
          if (nodes.length > 1 && !edges.some((e) => e.target === node.id)) {
            addError(node.id, 'No incoming connection')
          }
          break
        }
      }
    })
    return errorMap
  }, [nodes, edges])

  return {
    errors,
    totalErrors: Object.values(errors).flat().length,
    hasStart: nodes.some((n) => n.data.type === 'start'),
    hasEnd: nodes.some((n) => n.data.type === 'end'),
  }
}
