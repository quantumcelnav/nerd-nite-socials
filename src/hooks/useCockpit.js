import { useEffect, useState, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { NN_STATES, getState, getNextState } from '../data/nnStates'

const DEFAULT_MODULES = { trivia: false }

function lsKey(slug, suffix) { return `cockpit_${slug}_${suffix}` }

function lsGet(slug, suffix, fallback) {
  try { return JSON.parse(localStorage.getItem(lsKey(slug, suffix))) ?? fallback }
  catch { return fallback }
}

function lsSet(slug, suffix, value) {
  try { localStorage.setItem(lsKey(slug, suffix), JSON.stringify(value)) }
  catch {}
}

export function useCockpit(editionSlug) {
  const [currentStateId, setCurrentStateId]   = useState(() => lsGet(editionSlug, 'state', 'pre_show'))
  const [stateEnteredAt, setStateEnteredAt]   = useState(null)
  const [checklist, setChecklist]             = useState({})
  const [comms, setComms]                     = useState([])
  const [wiredModules, setWiredModules]       = useState(() => lsGet(editionSlug, 'modules', DEFAULT_MODULES))
  const [offlinePending, setOfflinePending]   = useState(false)

  // Mirror state to localStorage on every change so paper fallback is always current
  useEffect(() => { lsSet(editionSlug, 'state', currentStateId) }, [editionSlug, currentStateId])
  useEffect(() => { lsSet(editionSlug, 'modules', wiredModules) }, [editionSlug, wiredModules])

  useEffect(() => {
    if (!supabaseReady || !editionSlug) return

    supabase
      .from('show_state')
      .select('current_state, state_entered_at, wired_modules')
      .eq('edition', editionSlug)
      .single()
      .then(({ data }) => {
        if (data?.current_state)    setCurrentStateId(data.current_state)
        if (data?.state_entered_at) setStateEnteredAt(new Date(data.state_entered_at))
        if (data?.wired_modules)    setWiredModules(data.wired_modules)
      })

    supabase
      .from('show_checklist')
      .select('state_id, item_key, completed')
      .eq('edition', editionSlug)
      .then(({ data }) => {
        const map = {}
        for (const row of data ?? []) map[`${row.state_id}:${row.item_key}`] = row.completed
        setChecklist(map)
      })

    supabase
      .from('show_comms')
      .select('id, sender, message, created_at')
      .eq('edition', editionSlug)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComms(data ?? []))

    const stateChannel = supabase
      .channel(`cockpit-state-${editionSlug}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'show_state', filter: `edition=eq.${editionSlug}` },
        ({ new: row }) => {
          if (row.current_state)    setCurrentStateId(row.current_state)
          if (row.state_entered_at) setStateEnteredAt(new Date(row.state_entered_at))
          if (row.wired_modules)    setWiredModules(row.wired_modules)
        }
      )
      .subscribe()

    const checklistChannel = supabase
      .channel(`cockpit-checklist-${editionSlug}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'show_checklist', filter: `edition=eq.${editionSlug}` },
        ({ new: row }) => {
          setChecklist(prev => ({ ...prev, [`${row.state_id}:${row.item_key}`]: row.completed }))
        }
      )
      .subscribe()

    const commsChannel = supabase
      .channel(`cockpit-comms-${editionSlug}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'show_comms', filter: `edition=eq.${editionSlug}` },
        ({ new: row }) => setComms(prev => [...prev, row])
      )
      .subscribe()

    return () => {
      supabase.removeChannel(stateChannel)
      supabase.removeChannel(checklistChannel)
      supabase.removeChannel(commsChannel)
    }
  }, [editionSlug])

  async function advanceState() {
    const next = getNextState(currentStateId)
    if (!next) return
    const now = new Date().toISOString()

    // Always update locally first — show continues even if Supabase is down
    setCurrentStateId(next.id)
    setStateEnteredAt(new Date(now))

    if (!supabaseReady) { setOfflinePending(true); return }

    try {
      const autoUpserts = next.checklist
        .filter(item => item.owner === 'auto')
        .map(item => ({ edition: editionSlug, state_id: next.id, item_key: item.key, completed: true, updated_at: now }))
      if (autoUpserts.length) {
        await supabase.from('show_checklist').upsert(autoUpserts, { onConflict: 'edition,state_id,item_key' })
      }

      // Fire module actions for next state
      const actions = next.moduleActions ?? {}
      if (wiredModules.trivia && actions.trivia) {
        const frozen = actions.trivia === 'freeze'
        await supabase.from('show_state')
          .upsert({ edition: editionSlug, frozen }, { onConflict: 'edition' })
      }

      await supabase.from('show_state')
        .upsert({ edition: editionSlug, current_state: next.id, state_entered_at: now }, { onConflict: 'edition' })

      setOfflinePending(false)
    } catch {
      setOfflinePending(true)
    }
  }

  async function syncPending() {
    if (!offlinePending || !supabaseReady) return
    try {
      await supabase.from('show_state')
        .upsert({ edition: editionSlug, current_state: currentStateId }, { onConflict: 'edition' })
      setOfflinePending(false)
    } catch {}
  }

  async function toggleCheckItem(stateId, itemKey) {
    const key  = `${stateId}:${itemKey}`
    const next = !checklist[key]
    setChecklist(prev => ({ ...prev, [key]: next }))
    if (!supabaseReady) return
    await supabase.from('show_checklist').upsert(
      { edition: editionSlug, state_id: stateId, item_key: itemKey, completed: next, updated_at: new Date().toISOString() },
      { onConflict: 'edition,state_id,item_key' }
    )
  }

  async function sendMessage(sender, message) {
    if (!supabaseReady || !message.trim() || !sender.trim()) return
    await supabase.from('show_comms').insert({
      edition: editionSlug, sender: sender.trim(), message: message.trim(),
    })
  }

  async function toggleModule(moduleName) {
    const next = { ...wiredModules, [moduleName]: !wiredModules[moduleName] }
    setWiredModules(next)
    if (!supabaseReady) return
    await supabase.from('show_state')
      .upsert({ edition: editionSlug, wired_modules: next }, { onConflict: 'edition' })
  }

  const currentState    = getState(currentStateId)
  const currentStateIdx = NN_STATES.findIndex(s => s.id === currentStateId)
  const nextState       = getNextState(currentStateId)

  const blockingItems = currentState.checklist.filter(item =>
    item.owner !== 'auto' && !checklist[`${currentStateId}:${item.key}`]
  )

  return {
    allStates: NN_STATES,
    currentState,
    currentStateId,
    currentStateIdx,
    nextState,
    stateEnteredAt,
    checklist,
    comms,
    wiredModules,
    offlinePending,
    advanceState,
    toggleCheckItem,
    sendMessage,
    toggleModule,
    syncPending,
    canAdvance: blockingItems.length === 0 && nextState !== null,
    blockingItems,
  }
}
