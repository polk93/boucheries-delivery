import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/bouchers — liste toutes les boucheries actives avec leurs produits
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (email) {
      // Récupérer UNE boucherie par email
      const { data, error } = await supabase
        .from('bouchers')
        .select('*, produits(*)')
        .eq('email', email)
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 404 })
      return NextResponse.json(data)
    }

    // Toutes les boucheries actives avec leurs produits actifs
    const { data, error } = await supabase
      .from('bouchers')
      .select('*, produits(*)')
      .eq('actif', true)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/bouchers — créer ou mettre à jour une boucherie
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, nom, prenom, telephone, nom_boutique, adresse, ville, description, stripe_account_id } = body

    if (!email || !nom_boutique) {
      return NextResponse.json({ error: 'email et nom_boutique requis' }, { status: 400 })
    }

    // Upsert (créer ou mettre à jour)
    const { data, error } = await supabase
      .from('bouchers')
      .upsert({
        email,
        nom: nom || nom_boutique,
        prenom: prenom || '',
        telephone: telephone || '',
        nom_boutique,
        adresse: adresse || '',
        ville: ville || '',
        description: description || '',
        stripe_account_id: stripe_account_id || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/bouchers — mettre à jour statut ouvert/fermé ou autres champs
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, ...updates } = body

    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const { data, error } = await supabase
      .from('bouchers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
