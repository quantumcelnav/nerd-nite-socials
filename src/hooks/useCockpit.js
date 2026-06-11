import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'
import { NN_STATES, getState, getNextState } from '../data/nnStates'

export function useCockpit(editionSlug) {
  const [currentStateId, setCurrentStateId] = useState('pre_show')
  const [stateEnteredAt, setStateEnteredAt] = useState(null)
  const [checklist, setChecklist] = useState({})
  const [comms, setComms] = useState([])

  useEffect(() => {
    if (!supabaseReady || !editionSlug) return

    supabase
      .from('show_state')
      .select('current_state, state_entered_at')
      .eq('edition', editionSlug)
      .single()
      .then(({ data }) => {
        if (data?.current_state) setCurrentStateId(data.current_state)
        if (data?.state_entered_at) setStateEnteredAt(new Date(data.state_entered_at))
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
          if (row.current_state) setCurrentStateId(row.current_state)
          if (row.state_entered_at) setStateEnteredAt(new Date(row.state_entered_at))
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
    if (!next || !supabaseReady) return
    const now = new Date().toISOString()

    const autoUpserts = next.checklist
      .filter(item => item.owner === 'auto')
      .map(item => ({
        edition: editionSlug,
        state_id: next.id,
        item_key: item.key,
        completed: true,
        updated_at: now,
      }))
    if (autoUpserts.length) {
      await supabase
        .from('show_checklist')
        .upsert(autoUpserts, { onConflict: 'edition,state_id,item_key' })
    }

    await supabase
      .from('show_state')
      .upsert({ edition: editionSlug, current_state: next.id, state_entered_at: now },
               { onConflict: 'edition' })
  }

  async function toggleCheckItem(stateId, itemKey) {
    const key = `${stateId}:${itemKey}`
    const next = !checklist[key]
    // optimistic update first so canAdvance recalculates immediately
    setChecklist(prev => ({ ...prev, [key]: next }))
    if (!supabaseReady) return
    await supabase
      .from('show_checklist')
      .upsert(
        { edition: editionSlug, state_id: stateId, item_key: itemKey, completed: next, updated_at: new Date().toISOString() },
        { onConflict: 'edition,state_id,item_key' }
      )
  }

  async function sendMessage(sender, message) {
    if (!supabaseReady || !message.trim() || !sender.trim()) return
    await supabase.from('show_comms').insert({
      edition: editionSlug,
      sender: sender.trim(),
      message: message.trim(),
    })
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
    advanceState,
    toggleCheckItem,
    sendMessage,
    canAdvance: blockingItems.length === 0 && nextState !== null,
    blockingItems,
  }
}
