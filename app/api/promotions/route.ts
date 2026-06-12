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
    const email = new URL(req.url).searchParams.get('email')
    if (!email) return NextResponse.json([])
    const { data: b } = await supabase.from('bouchers').select('id').eq('email', email).single()
    if (!b) return NextResponse.json([])
    const { data } = await supabase.from('promotions').select('*').eq('boucher_id', b.id)
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { email, ...promo } = await req.json()
    const { data: b } = await supabase.from('bouchers').select('id').eq('email', email).single()
    if (!b) return NextResponse.json({ error: 'Boucher introuvable' }, { status: 404 })
    if (promo.id && !promo.id.startsWith('new_')) {
      const { data, error } = await supabase.from('promotions').update(promo).eq('id', promo.id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }
    const { id, ...promoData } = promo
    const { data, error } = await supabase.from('promotions')
      .insert({ ...promoData, boucher_id: b.id }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
    await supabase.from('promotions').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
