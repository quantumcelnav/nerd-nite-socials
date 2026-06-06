import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Gracefully degrade when env vars aren't set (e.g. preview deploys without secrets)
export const supabase = (url && key)
  ? createClient(url, key)
  : null

export const supabaseReady = !!(url && key)
