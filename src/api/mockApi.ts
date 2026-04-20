import type { AutomationAction, SimulatePayload, SimulationResult, SimulationStep, WorkflowNodeType } from '../types/workflow'

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field'] },
  { id: 'trigger_webhook', label: 'Trigger Webhook', params: ['url', 'payload'] },
]

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const mockApi = {
  getAutomations: async (): Promise<AutomationAction[]> => {
    await delay(300)
    return MOCK_AUTOMATIONS
  },

  simulate: async (payload: SimulatePayload): Promise<SimulationResult> => {
    await delay(600)
    const errors: string[] = []
    const nodeIds = new Set(payload.nodes.map((n) => n.id))
    const hasStart = payload.nodes.some((n) => n.type === 'start')
    const hasEnd = payload.nodes.some((n) => n.type === 'end')

    if (!hasStart) errors.push('Workflow must have a Start node')
    if (!hasEnd) errors.push('Workflow must have an End node')
    if (payload.nodes.length < 2) errors.push('Workflow must have at least 2 nodes')

    const connectedIds = new Set<string>()
    payload.edges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target) })
    payload.nodes.forEach((n) => {
      if (!connectedIds.has(n.id) && payload.nodes.length > 1) {
        errors.push(`Node "${(n.data as any).title || n.type}" is not connected`)
      }
    })

    if (!hasStart) return { success: false, steps: [], summary: 'Simulation failed', errors }

    // Topological sort
    const inDegree: Record<string, number> = {}
    const graph: Record<string, string[]> = {}
    payload.nodes.forEach((n) => { inDegree[n.id] = 0; graph[n.id] = [] })
    payload.edges.forEach((e) => {
      if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
        graph[e.source].push(e.target)
        inDegree[e.target] = (inDegree[e.target] || 0) + 1
      }
    })

    const queue = payload.nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id)
    const order: string[] = []
    while (queue.length > 0) {
      const curr = queue.shift()!
      order.push(curr)
      ;(graph[curr] || []).forEach((next) => {
        inDegree[next]--
        if (inDegree[next] === 0) queue.push(next)
      })
    }

    if (order.length !== payload.nodes.length) {
      errors.push('Cycle detected in workflow')
      return { success: false, steps: [], summary: 'Cycle detected', errors }
    }

    const messages: Record<WorkflowNodeType, string> = {
      start: 'Workflow initiated',
      task: 'Task assigned and queued',
      approval: 'Approval request dispatched',
      automated: 'Automation triggered and executed',
      end: 'Workflow completed — final state recorded',
    }

    let baseTime = Date.now()
    const steps: SimulationStep[] = order.map((nodeId) => {
      const node = payload.nodes.find((n) => n.id === nodeId)!
      const data = node.data as any
      baseTime += Math.floor(Math.random() * 200) + 100
      return {
        nodeId,
        nodeTitle: data.title || data.endMessage || node.type,
        nodeType: node.type,
        status: 'success',
        message: messages[node.type],
        timestamp: baseTime,
      }
    })

    const success = errors.length === 0
    return {
      success,
      steps,
      summary: success
        ? `Workflow executed successfully across ${steps.length} steps`
        : `Completed with ${errors.length} issue(s)`,
      errors,
    }
  },
}
