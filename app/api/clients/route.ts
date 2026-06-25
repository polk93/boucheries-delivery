import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Variables Supabase manquantes')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })
    const { data, error } = await supabase.from('clients').select('*').eq('email', email).single()
    if (error) return NextResponse.json(null)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { email, nom, telephone, notifs_prefs, cookie_consent, cookie_consent_date } = body
    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const payload: any = { email, updated_at: new Date().toISOString() }
    if (nom                !== undefined) payload.nom                = nom
    if (telephone          !== undefined) payload.telephone          = telephone
    if (notifs_prefs       !== undefined) payload.notifs_prefs       = notifs_prefs
    if (cookie_consent     !== undefined) payload.cookie_consent     = cookie_consent
    if (cookie_consent_date !== undefined) payload.cookie_consent_date = cookie_consent_date

    const { data, error } = await supabase.from('clients')
      .upsert(payload, { onConflict: 'email' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
