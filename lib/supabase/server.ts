import { createClient } from '@supabase/supabase-js'

// Client avec droits admin — uniquement côté serveur (API routes)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
