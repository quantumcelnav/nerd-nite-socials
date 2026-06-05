import { useMemo } from 'react'

// Nonce is set via VITE_SHOW_NONCE environment variable in Vercel dashboard.
// Never committed to the repo — the public source code cannot reveal the show code.
// Other Nerd Nites: fork repo, set VITE_SHOW_NONCE in your own Vercel project.
const SHOW_NONCE = import.meta.env.VITE_SHOW_NONCE

// Returns true when the URL contains ?n=<VITE_SHOW_NONCE>
export function useNonce() {
  return useMemo(() => {
    if (!SHOW_NONCE) return false
    const params = new URLSearchParams(window.location.search)
    return params.get('n') === SHOW_NONCE
  }, [])
}

// Exported for the QR slide — builds the full live audience URL
export function getLiveUrl() {
  if (!SHOW_NONCE) return null
  return `${window.location.origin}/?n=${SHOW_NONCE}`
}
