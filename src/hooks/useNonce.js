import { useMemo } from 'react'
import edition from '../data/edition.json'

// Nonce lives in edition.json alongside the show info.
// Update it each show with: openssl rand -hex 3
// QR code URL: https://your-site.com/?n=<nonce>
export function useNonce() {
  return useMemo(() => {
    if (!edition.nonce) return false
    const params = new URLSearchParams(window.location.search)
    return params.get('n') === edition.nonce
  }, [])
}

export function getLiveUrl() {
  if (!edition.nonce) return null
  return `${window.location.origin}/?n=${edition.nonce}`
}
