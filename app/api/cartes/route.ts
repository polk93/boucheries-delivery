import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/cartes?email=xxx — liste les cartes enregistrées de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const email = new URL(req.url).searchParams.get('email')
    if (!email) return NextResponse.json([])

    const { data } = await supabase
      .from('cartes_paiement')
      .select('*')
      .eq('client_email', email)
      .order('created_at', { ascending: true })

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}

// POST /api/cartes — sauvegarde les métadonnées masquées après confirmation Stripe
// Body: { email, stripe_pm_id }
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { email, stripe_pm_id } = await req.json()

    if (!email || !stripe_pm_id) {
      return NextResponse.json({ error: 'email et stripe_pm_id requis' }, { status: 400 })
    }

    // Récupérer les métadonnées masquées depuis Stripe (jamais le numéro complet)
    const pm = await stripe.paymentMethods.retrieve(stripe_pm_id)
    if (!pm.card) {
      return NextResponse.json({ error: 'PaymentMethod invalide' }, { status: 400 })
    }

    const { last4, brand, exp_month, exp_year } = pm.card

    // Première carte → par défaut
    const { count } = await supabase
      .from('cartes_paiement')
      .select('*', { count: 'exact', head: true })
      .eq('client_email', email)

    const is_default = (count ?? 0) === 0

    const { data, error } = await supabase
      .from('cartes_paiement')
      .insert({ client_email: email, stripe_pm_id, last4, brand, exp_month, exp_year, is_default })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
