import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/avis?client_email=xxx — avis laissés par un client
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const email = new URL(req.url).searchParams.get('client_email')
    if (!email) return NextResponse.json([])

    const { data } = await supabase
      .from('avis')
      .select('*, bouchers(nom_boutique)')
      .eq('client_email', email)
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}

// DELETE /api/avis?id=xxx — supprimer un avis
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const { error } = await supabase.from('avis').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
