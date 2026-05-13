import { NextRequest, NextResponse } from 'next/server'

// En production : remplacer par Supabase + Stripe réels
// import Stripe from 'stripe'
// import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, boucherie_id, lignes, frais_livraison, creneau_type } = body

    if (!user_id || !boucherie_id || !lignes?.length) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const sous_total = lignes.reduce((s: number, l: any) => s + l.prix * l.quantite, 0)
    const total = sous_total + frais_livraison
    const numero = '#' + Math.floor(1000 + Math.random() * 9000)

    // TODO: créer PaymentIntent Stripe + insérer en DB Supabase
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const pi = await stripe.paymentIntents.create({ amount: Math.round(total * 100), currency: 'eur' })

    return NextResponse.json({
      commande_id: crypto.randomUUID(),
      numero,
      client_secret: 'pi_demo_secret_demo', // Remplacer par pi.client_secret
      total,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // TODO: récupérer depuis Supabase
  return NextResponse.json([])
}
