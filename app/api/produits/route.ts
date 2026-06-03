import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/produits?email=xxx — produits d'une boucherie
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email      = searchParams.get('email')
    const boucher_id = searchParams.get('boucher_id')

    if (!email && !boucher_id) {
      return NextResponse.json({ error: 'email ou boucher_id requis' }, { status: 400 })
    }

    let query = supabase.from('produits').select('*').eq('actif', true)

    if (boucher_id) {
      query = query.eq('boucher_id', boucher_id)
    } else if (email) {
      // Récupérer d'abord l'ID du boucher
      const { data: boucher } = await supabase
        .from('bouchers').select('id').eq('email', email).single()
      if (!boucher) return NextResponse.json([])
      query = query.eq('boucher_id', boucher.id)
    }

    const { data, error } = await query.order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/produits — créer un produit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, ...produit } = body

    if (!email) return NextResponse.json({ error: 'email boucher requis' }, { status: 400 })

    // Récupérer l'ID du boucher
    let { data: boucher } = await supabase
      .from('bouchers').select('id').eq('email', email).single()

    if (!boucher) return NextResponse.json({ error: 'Boucher introuvable' }, { status: 404 })

    const { data, error } = await supabase
      .from('produits')
      .insert({
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
      })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/produits — mettre à jour un produit
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, email, ...updates } = body

    if (!id) return NextResponse.json({ error: 'id produit requis' }, { status: 400 })

    const { data, error } = await supabase
      .from('produits')
      .update({
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
      })
      .eq('id', id)
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/produits?id=xxx — supprimer (désactiver) un produit
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const { error } = await supabase
      .from('produits')
      .update({ actif: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
