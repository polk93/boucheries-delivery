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

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const supabase = getSupabase()

    // Récupérer ou créer le Stripe Customer lié à cet email
    let stripeCustomerId: string
    const { data: existing } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('email', email)
      .single()

    if (existing?.stripe_customer_id) {
      stripeCustomerId = existing.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({ email })
      stripeCustomerId = customer.id
      await supabase
        .from('stripe_customers')
        .insert({ email, stripe_customer_id: stripeCustomerId })
    }

    // Créer un SetupIntent pour tokeniser la carte via Stripe Elements
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
