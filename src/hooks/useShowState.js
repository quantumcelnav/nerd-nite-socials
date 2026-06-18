import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { MODULE_ACTIONS } from '../data/nnStates'

export function useShowState(editionSlug) {
  const [frozen, setFrozen]                   = useState(false)
  const [dashboardEnabled, setDashboardEnabled] = useState(false)
  const [currentState, setCurrentState]       = useState('pre_show')
  const [wiredModules, setWiredModules]       = useState({})
  const [showNonce, setShowNonce]             = useState(null)

  useEffect(() => {
    if (!supabaseReady || !editionSlug) return

    supabase
      .from('show_state')
      .select('frozen, dashboard_enabled, current_state, wired_modules, show_nonce')
      .eq('edition', editionSlug)
      .single()
      .then(({ data }) => {
        if (!data) return
        setFrozen(data.frozen ?? false)
        setDashboardEnabled(data.dashboard_enabled ?? false)
        setCurrentState(data.current_state ?? 'pre_show')
        setWiredModules(data.wired_modules ?? {})
        setShowNonce(data.show_nonce ?? null)
      })

    const channel = supabase
      .channel(`show-state-${editionSlug}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'show_state', filter: `edition=eq.${editionSlug}` },
        ({ new: row }) => {
          setFrozen(row.frozen ?? false)
          setDashboardEnabled(row.dashboard_enabled ?? false)
          if (row.current_state) setCurrentState(row.current_state)
          if (row.wired_modules) setWiredModules(row.wired_modules)
          if (row.show_nonce)    setShowNonce(row.show_nonce)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [editionSlug])

  // When trivia is wired to cockpit, derive frozen from the state machine.
  // When standalone, use the manual frozen field from DB.
  const triviaWired = !!wiredModules?.trivia
  const effectiveFrozen = triviaWired
    ? MODULE_ACTIONS[currentState]?.trivia !== 'unlock'
    : frozen

  async function toggleFrozen() {
    if (triviaWired) return  // cockpit owns this when wired
    const next = !frozen
    setFrozen(next)
    if (supabaseReady) {
      await supabase.from('show_state')
        .upsert({ edition: editionSlug, frozen: next }, { onConflict: 'edition' })
    }
  }

  async function setDashboard(enabled) {
    setDashboardEnabled(enabled)
    if (supabaseReady) {
      await supabase.from('show_state')
        .upsert({ edition: editionSlug, dashboard_enabled: enabled }, { onConflict: 'edition' })
    }
  }

  async function saveNonce(nonce) {
    const val = nonce?.trim() || null
    setShowNonce(val)
    if (supabaseReady) {
      await supabase.from('show_state')
        .upsert({ edition: editionSlug, show_nonce: val }, { onConflict: 'edition' })
    }
  }

  return {
    frozen: effectiveFrozen,
    toggleFrozen,
    triviaWired,
    dashboardEnabled,
    setDashboard,
    showNonce,
    saveNonce,
  }
}
