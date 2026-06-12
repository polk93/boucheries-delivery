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

    if (email) {
      const { data, error } = await supabase
        .from('bouchers').select('*, produits(*)').eq('email', email).single()
      if (error) {
        console.error('[bouchers GET email]', error)
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('bouchers').select('*, produits(*)')
      .eq('actif', true).order('created_at', { ascending: true })

    if (error) {
      console.error('[bouchers GET all]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('[bouchers GET catch]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const {
      email, nom, prenom, telephone, nom_boutique,
      adresse, ville, description, stripe_account_id,
      horaires, badge, cover_photo, frais, min_commande, ouvert,
    } = body

    if (!email || !nom_boutique) {
      return NextResponse.json({ error: 'email et nom_boutique requis' }, { status: 400 })
    }

    const updateData: any = {
      email,
      nom:               nom || nom_boutique,
      prenom:            prenom            ?? undefined,
      telephone:         telephone         ?? undefined,
      nom_boutique,
      adresse:           adresse           ?? undefined,
      ville:             ville             ?? undefined,
      description:       description       ?? undefined,
      stripe_account_id: stripe_account_id ?? undefined,
      horaires:          horaires          ?? undefined,
      badge:             badge             ?? undefined,
      cover_photo:       cover_photo       ?? undefined,
      frais:             frais             ?? undefined,
      min_commande:      min_commande      ?? undefined,
      ouvert:            ouvert            ?? undefined,
      updated_at:        new Date().toISOString(),
    }

    // Supprimer les undefined
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k])

    const { data, error } = await supabase
      .from('bouchers')
      .upsert(updateData, { onConflict: 'email' })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { email, ...updates } = body
    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const { data, error } = await supabase.from('bouchers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('email', email).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
