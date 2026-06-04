import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback dummy strings só para o pre-render do build não quebrar quando
  // env vars não estão presentes (ex: build sem .env.local). Em runtime real,
  // as env vars sempre estarão disponíveis (validadas pelo middleware).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  return createBrowserClient(url, key)
}
