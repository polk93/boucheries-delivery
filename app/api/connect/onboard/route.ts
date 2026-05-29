import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  try {
    const { email, nom_boutique, ville, type = 'boucher', refresh, accountId } = await req.json()

    // Regénérer un lien si le précédent a expiré
    if (refresh && accountId) {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_URL}/connect/refresh?account=${accountId}`,
        return_url:  `${process.env.NEXT_PUBLIC_URL}/connect/return?account=${accountId}`,
        type: 'account_onboarding',
      })
      return NextResponse.json({ onboardingUrl: accountLink.url })
    }

    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const isBoucher = type === 'boucher'

    // Créer le compte Stripe Express
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: isBoucher ? 'individual' : 'individual',
      business_profile: {
        name: nom_boutique || email,
        url: `${process.env.NEXT_PUBLIC_URL}`,
        mcc: isBoucher ? '5411' : '4215', // Boucherie ou Livraison
        product_description: isBoucher
          ? `Boucherie artisanale — ${nom_boutique}, ${ville}`
          : `Livreur indépendant BoucheriesDelivery — ${ville}`,
      },
      metadata: {
        type,
        nom_boutique: nom_boutique || '',
        ville: ville || '',
        plateforme: 'BoucheriesDelivery',
        // Lié automatiquement à votre compte Stripe plateforme via les transfers
      },
      settings: {
        payouts: {
          // Virements automatiques chaque lundi vers le compte bancaire du boucher/livreur
          schedule: { interval: 'weekly', weekly_anchor: 'monday' },
          statement_descriptor: isBoucher
            ? (nom_boutique || 'BOUCHERIE').slice(0, 22).toUpperCase()
            : 'BOUCHERIES DELIVERY',
        },
      },
    })

    // Générer le lien d'onboarding Stripe
    // Stripe collecte lui-même : identité, IBAN, SIRET → plus besoin de ces champs dans le formulaire
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/connect/refresh?account=${account.id}`,
      return_url:  `${process.env.NEXT_PUBLIC_URL}/connect/return?account=${account.id}&type=${type}`,
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
