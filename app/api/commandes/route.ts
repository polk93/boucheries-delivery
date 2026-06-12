import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Variables Supabase manquantes')
  return createClient(url, key)
}

// GET /api/commandes?boucher_email=xxx&status=new,prep,ready,delivery&type=historique
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const boucher_email = searchParams.get('boucher_email')
    const client_email  = searchParams.get('client_email')
    const type          = searchParams.get('type') // 'actives' | 'historique'

    if (!boucher_email && !client_email) {
      return NextResponse.json({ error: 'boucher_email ou client_email requis' }, { status: 400 })
    }

    let query = supabase.from('commandes').select('*').order('created_at', { ascending: false })

    if (boucher_email) {
      // Récupérer l'ID du boucher
      const { data: b } = await supabase.from('bouchers').select('id').eq('email', boucher_email).single()
      if (!b) return NextResponse.json([])
      query = query.eq('boucher_id', b.id)
    }
    if (client_email) query = query.eq('client_email', client_email)
    if (type === 'actives')    query = query.in('status', ['new', 'prep', 'ready', 'delivery'])
    if (type === 'historique') query = query.eq('status', 'done')

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/commandes — créer ou mettre à jour une commande
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, boucher_email, ...commande } = body

    let boucher_id = commande.boucher_id
    if (!boucher_id && boucher_email) {
      const { data: b } = await supabase.from('bouchers').select('id').eq('email', boucher_email).single()
      boucher_id = b?.id
    }

    if (id) {
      // Mise à jour
      const { data, error } = await supabase.from('commandes')
        .update({ ...commande, boucher_id, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    } else {
      // Création
      const { data, error } = await supabase.from('commandes')
        .insert({ ...commande, boucher_id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/commandes — mettre à jour le status
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { id, status, ...rest } = await req.json()
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const { data, error } = await supabase.from('commandes')
      .update({ status, ...rest, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
