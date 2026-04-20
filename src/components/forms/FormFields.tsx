import type { ReactNode } from 'react'
import type { KeyValuePair } from '../../types/workflow'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  background: '#13151c', border: '1px solid #2a2d3a',
  color: '#e8eaf0', fontFamily: 'DM Sans, sans-serif',
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
      style={{ ...inputStyle, ...(props.style || {}) }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#f97316'; props.onFocus?.(e) }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2d3a'; props.onBlur?.(e) }}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} rows={3}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-none"
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#f97316' }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2d3a' }}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#f97316' }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2d3a' }}
    />
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-3 w-full text-left">
      <div className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
        style={{ background: checked ? '#f97316' : '#2a2d3a' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{ background: '#e8eaf0', left: checked ? '22px' : '2px' }} />
      </div>
      <span className="text-sm" style={{ color: '#9ca3af' }}>{label}</span>
    </button>
  )
}

export function KVEditor({ pairs, onChange, label = 'Custom Fields' }: { pairs: KeyValuePair[]; onChange: (p: KeyValuePair[]) => void; label?: string }) {
  const add = () => onChange([...pairs, { id: `kv_${Date.now()}`, key: '', value: '' }])
  const update = (id: string, field: 'key' | 'value', val: string) =>
    onChange(pairs.map((p) => p.id === id ? { ...p, [field]: val } : p))
  const remove = (id: string) => onChange(pairs.filter((p) => p.id !== id))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>{label}</label>
        <button onClick={add} className="text-xs px-2 py-1 rounded-md transition-all"
          style={{ background: '#1c1f2a', color: '#f97316', border: '1px solid #f9731633' }}>
          + Add
        </button>
      </div>
      {pairs.map((pair) => (
        <div key={pair.id} className="flex gap-2 items-center">
          <Input placeholder="Key" value={pair.key} onChange={(e) => update(pair.id, 'key', e.target.value)} style={{ flex: 1 }} />
          <Input placeholder="Value" value={pair.value} onChange={(e) => update(pair.id, 'value', e.target.value)} style={{ flex: 1 }} />
          <button onClick={() => remove(pair.id)} className="text-xs px-2 py-2 rounded-md"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280' }}>✕</button>
        </div>
      ))}
      {pairs.length === 0 && <p className="text-xs italic" style={{ color: '#374151' }}>No fields added yet</p>}
    </div>
  )
}
