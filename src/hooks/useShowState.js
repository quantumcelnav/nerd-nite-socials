import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

// Returns { frozen, setFrozen } for a given edition slug.
// Subscribes to real-time changes so freeze/unfreeze propagates to all
// connected clients immediately.
export function useShowState(editionSlug) {
  const [frozen, setFrozen] = useState(false)

  useEffect(() => {
    if (!supabaseReady || !editionSlug) return

    supabase
      .from('show_state')
      .select('frozen')
      .eq('edition', editionSlug)
      .single()
      .then(({ data }) => setFrozen(data?.frozen ?? false))

    const channel = supabase
      .channel(`show-state-${editionSlug}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'show_state',
          filter: `edition=eq.${editionSlug}` },
        (payload) => setFrozen(payload.new.frozen)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [editionSlug])

  async function toggleFrozen() {
    const next = !frozen
    setFrozen(next) // optimistic
    if (supabaseReady) {
      await supabase
        .from('show_state')
        .upsert({ edition: editionSlug, frozen: next })
    }
  }

  return { frozen, toggleFrozen }
}
