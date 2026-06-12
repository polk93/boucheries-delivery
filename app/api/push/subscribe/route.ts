import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase non configuré')
  return createClient(url, key)
}

// GET /api/push/subscribe?email=xxx — récupérer les subscriptions
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const email = new URL(req.url).searchParams.get('email')
    if (!email) return NextResponse.json([])
    const { data } = await supabase.from('push_subscriptions')
      .select('*').eq('email', email)
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/push/subscribe — sauvegarder une subscription
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { email, subscription, role } = await req.json()
    if (!email || !subscription) {
      return NextResponse.json({ error: 'email et subscription requis' }, { status: 400 })
    }
    const { data, error } = await supabase.from('push_subscriptions')
      .upsert({
        email,
        role: role || 'client',
        endpoint:    subscription.endpoint,
        p256dh:      subscription.keys?.p256dh,
        auth:        subscription.keys?.auth,
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'endpoint' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/push/subscribe — supprimer une subscription
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'endpoint requis' }, { status: 400 })
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
