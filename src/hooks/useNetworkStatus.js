import { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

// Returns: 'online' | 'offline' | 'checking'
export function useNetworkStatus() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    if (!supabaseReady) { setStatus('offline'); return }

    async function ping() {
      try {
        const { error } = await supabase
          .from('show_state')
          .select('edition')
          .limit(1)
        setStatus(error ? 'offline' : 'online')
      } catch {
        setStatus('offline')
      }
    }

    ping()
    const id = setInterval(ping, 15000)
    return () => clearInterval(id)
  }, [])

  return status
}
