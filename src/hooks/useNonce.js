import { useMemo } from 'react'
import { useEdition } from '../contexts/EditionContext'

export function useNonce() {
  const { edition } = useEdition()
  return useMemo(() => {
    if (!edition?.nonce) return false
    const params = new URLSearchParams(window.location.search)
    return params.get('n')?.replace(/\W/g, '') === edition.nonce
  }, [edition])
}

// Pass edition from useEdition() — builds the live URL for the current edition path
export function getLiveUrl(edition) {
  if (!edition?.nonce) return null
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?n=${edition.nonce}`
}
