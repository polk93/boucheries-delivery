import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// Commission plateforme : 15% du montant produits (hors livraison)
const COMMISSION_RATE = 0.15

export async function POST(req: NextRequest) {
  try {
    const { email, nom_boutique, ville } = await req.json()

    if (!email || !nom_boutique) {
      return NextResponse.json({ error: 'email et nom_boutique requis' }, { status: 400 })
    }

    // Créer le compte Stripe Express pour le boucher
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        name: nom_boutique,
        url: `https://boucheries-delivery.vercel.app`,
        mcc: '5411', // Épiceries / boucheries
        product_description: `Boucherie artisanale — ${nom_boutique}, ${ville}`,
      },
      metadata: {
        nom_boutique,
        ville,
        plateforme: 'BoucheriesDelivery',
      },
      settings: {
        payouts: {
          schedule: { interval: 'weekly', weekly_anchor: 'monday' },
          statement_descriptor: nom_boutique.slice(0, 22).toUpperCase(),
        },
      },
    })

    // Générer le lien d'onboarding Stripe
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/connect/refresh?account=${account.id}`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/connect/return?account=${account.id}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    })

  } catch (err: any) {
    console.error('[connect/onboard]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET : vérifier le statut d'un compte Connect
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')
    if (!accountId) return NextResponse.json({ error: 'accountId requis' }, { status: 400 })

    const account = await stripe.accounts.retrieve(accountId)
    return NextResponse.json({
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      email: account.email,
      businessName: account.business_profile?.name,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
