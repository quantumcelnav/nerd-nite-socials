import { useEffect, useState, useMemo } from 'react'
import { useEdition } from '../contexts/EditionContext'
import { supabase, supabaseReady } from '../lib/supabase'

export function useNonce() {
  const { edition } = useEdition()
  const [showNonce, setShowNonce] = useState(null)

  useEffect(() => {
    if (!supabaseReady || !edition?.edition) return

    supabase
      .from('show_state')
      .select('show_nonce')
      .eq('edition', edition.edition)
      .single()
      .then(({ data }) => { if (data?.show_nonce) setShowNonce(data.show_nonce) })

    const channel = supabase
      .channel(`nonce-watch-${edition.edition}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'show_state', filter: `edition=eq.${edition.edition}` },
        ({ new: row }) => { if (row.show_nonce) setShowNonce(row.show_nonce) }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [edition?.edition])

  return useMemo(() => {
    // Single source of truth: the live nonce generated in the cockpit (show_state).
    // No live nonce => nobody is in live mode => practice only. A URL nonce scores
    // only when it matches the current live nonce.
    const activeNonce = showNonce
    if (!activeNonce) return false
    const params = new URLSearchParams(window.location.search)
    return params.get('n')?.replace(/\W/g, '') === activeNonce
  }, [showNonce])
}

export function getLiveUrl(edition, showNonce) {
  const activeNonce = showNonce
  if (!activeNonce) return null
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?n=${activeNonce}`
}
