import { Field, Input, Textarea, Select, Toggle, KVEditor } from './FormFields'
import { useAutomations } from '../../hooks/useAutomations'
import type { StartNodeData, TaskNodeData, ApprovalNodeData, AutomatedNodeData, EndNodeData } from '../../types/workflow'

export function StartForm({ data, onChange }: { data: StartNodeData; onChange: (d: Partial<StartNodeData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Start Title">
        <Input value={data.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Employee Onboarding" />
      </Field>
      <KVEditor pairs={data.metadata} onChange={(metadata) => onChange({ metadata })} label="Metadata" />
    </div>
  )
}

export function TaskForm({ data, onChange }: { data: TaskNodeData; onChange: (d: Partial<TaskNodeData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Title *">
        <Input value={data.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Task title" required />
      </Field>
      <Field label="Description">
        <Textarea value={data.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="What needs to be done?" />
      </Field>
      <Field label="Assignee">
        <Input value={data.assignee} onChange={(e) => onChange({ assignee: e.target.value })} placeholder="e.g. john@company.com" />
      </Field>
      <Field label="Due Date">
        <Input type="date" value={data.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} />
      </Field>
      <KVEditor pairs={data.customFields} onChange={(customFields) => onChange({ customFields })} />
    </div>
  )
}

export function ApprovalForm({ data, onChange }: { data: ApprovalNodeData; onChange: (d: Partial<ApprovalNodeData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Title">
        <Input value={data.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Manager Approval" />
      </Field>
      <Field label="Approver Role">
        <Select value={data.approverRole} onChange={(e) => onChange({ approverRole: e.target.value as ApprovalNodeData['approverRole'] })}>
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
        </Select>
      </Field>
      <Field label="Auto-Approve Threshold (days)">
        <Input type="number" value={data.autoApproveThreshold} min={0}
          onChange={(e) => onChange({ autoApproveThreshold: Number(e.target.value) })} placeholder="0 = disabled" />
      </Field>
      {data.autoApproveThreshold > 0 && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#f59e0b11', color: '#f59e0b', border: '1px solid #f59e0b33' }}>
          Auto-approves after {data.autoApproveThreshold} day(s) if no response
        </p>
      )}
    </div>
  )
}

export function AutomatedForm({ data, onChange }: { data: AutomatedNodeData; onChange: (d: Partial<AutomatedNodeData>) => void }) {
  const { automations, loading } = useAutomations()
  const selectedAction = automations.find((a) => a.id === data.actionId)

  return (
    <div className="flex flex-col gap-4">
      <Field label="Title">
        <Input value={data.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Send Welcome Email" />
      </Field>
      <Field label="Action">
        {loading ? <p className="text-xs" style={{ color: '#4b5563' }}>Loading...</p> : (
          <Select value={data.actionId} onChange={(e) => onChange({ actionId: e.target.value, actionParams: {} })}>
            <option value="">Select an action...</option>
            {automations.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </Select>
        )}
      </Field>
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>Parameters</p>
          {selectedAction.params.map((param) => (
            <Field key={param} label={param}>
              <Input value={data.actionParams[param] || ''} placeholder={`Enter ${param}`}
                onChange={(e) => onChange({ actionParams: { ...data.actionParams, [param]: e.target.value } })} />
            </Field>
          ))}
        </div>
      )}
    </div>
  )
}

export function EndForm({ data, onChange }: { data: EndNodeData; onChange: (d: Partial<EndNodeData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="End Message">
        <Input value={data.endMessage} onChange={(e) => onChange({ endMessage: e.target.value })} placeholder="e.g. Onboarding Complete!" />
      </Field>
      <Toggle checked={data.summaryFlag} onChange={(summaryFlag) => onChange({ summaryFlag })} label="Generate execution summary report" />
    </div>
  )
}
