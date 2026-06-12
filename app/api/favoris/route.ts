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
    const { data } = await supabase.from('favoris')
      .select('*, bouchers(*)').eq('client_email', email)
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { client_email, boucher_id } = await req.json()
    const { data, error } = await supabase.from('favoris')
      .upsert({ client_email, boucher_id }, { onConflict: 'client_email,boucher_id' })
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { client_email, boucher_id } = await req.json()
    await supabase.from('favoris').delete()
      .eq('client_email', client_email).eq('boucher_id', boucher_id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
