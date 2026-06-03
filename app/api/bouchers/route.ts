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
    const email = searchParams.get('email')

    if (email) {
      const { data, error } = await supabase
        .from('bouchers').select('*, produits(*)').eq('email', email).single()
      if (error) {
        console.error('[bouchers GET email]', error)
        return NextResponse.json({ error: error.message, details: error }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('bouchers').select('*, produits(*)')
      .eq('actif', true).order('created_at', { ascending: true })

    if (error) {
      console.error('[bouchers GET all]', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('[bouchers GET catch]', err)
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { email, nom, prenom, telephone, nom_boutique, adresse, ville, description, stripe_account_id } = body
    if (!email || !nom_boutique) return NextResponse.json({ error: 'email et nom_boutique requis' }, { status: 400 })

    const { data, error } = await supabase.from('bouchers').upsert({
      email, nom: nom || nom_boutique, prenom: prenom || '',
      telephone: telephone || '', nom_boutique,
      adresse: adresse || '', ville: ville || '',
      description: description || '',
      stripe_account_id: stripe_account_id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' }).select().single()

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
