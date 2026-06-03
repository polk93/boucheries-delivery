import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const email      = searchParams.get('email')
    const boucher_id = searchParams.get('boucher_id')
    if (!email && !boucher_id) return NextResponse.json({ error: 'email ou boucher_id requis' }, { status: 400 })

    let bid = boucher_id
    if (!bid && email) {
      const { data: b } = await supabase.from('bouchers').select('id').eq('email', email).single()
      if (!b) return NextResponse.json([])
      bid = b.id
    }

    const { data, error } = await supabase.from('produits')
      .select('*').eq('boucher_id', bid!).eq('actif', true)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { email, ...produit } = body
    if (!email) return NextResponse.json({ error: 'email boucher requis' }, { status: 400 })

    const { data: boucher } = await supabase.from('bouchers').select('id').eq('email', email).single()
    if (!boucher) return NextResponse.json({ error: "Boucher introuvable — créez la boutique d'abord" }, { status: 404 })

    const { data, error } = await supabase.from('produits').insert({
      boucher_id:  boucher.id,
      nom:         produit.nom,
      description: produit.desc || '',
      prix:        parseFloat(produit.prix) || 0,
      icon:        produit.icon || '🥩',
      stock:       parseInt(produit.stock) || 0,
      photo_url:   produit.photoUrl || null,
      cat:         produit.cat || 'Bœuf',
      vente_type:  produit.venteType || 'pièce',
      decoupes:    produit.decoupes ? produit.decoupes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      preparation: produit.preparation ? produit.preparation.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      allergenes:  produit.allergenes || '',
      actif:       true,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id produit requis' }, { status: 400 })

    const { data, error } = await supabase.from('produits').update({
      nom:         updates.nom,
      description: updates.desc || updates.description,
      prix:        parseFloat(updates.prix) || 0,
      icon:        updates.icon,
      stock:       parseInt(updates.stock) || 0,
      photo_url:   updates.photoUrl || updates.photo_url,
      cat:         updates.cat,
      vente_type:  updates.venteType || updates.vente_type,
      decoupes:    updates.decoupes ? updates.decoupes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      preparation: updates.preparation ? updates.preparation.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      allergenes:  updates.allergenes || '',
      updated_at:  new Date().toISOString(),
    }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
    const { error } = await supabase.from('produits')
      .update({ actif: false, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
