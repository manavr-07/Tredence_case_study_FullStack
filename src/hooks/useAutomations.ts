import { useState, useEffect } from 'react'
import { mockApi } from '../api/mockApi'
import type { AutomationAction } from '../types/workflow'

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mockApi.getAutomations().then(setAutomations).finally(() => setLoading(false))
  }, [])

  return { automations, loading }
}
