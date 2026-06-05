import { useMemo } from 'react'
import edition from '../data/edition.json'

// Returns true when the URL contains ?n=<edition.nonce>
// Live audience scans a QR code with that param — everyone else is in practice mode.
export function useNonce() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('n') === edition.nonce
  }, [])
}
