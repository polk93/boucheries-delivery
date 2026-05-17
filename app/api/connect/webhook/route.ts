import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('[webhook] signature invalide:', err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  switch (event.type) {

    // ── Paiement réussi ───────────────────────────────────────────────────────
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.log('[webhook] Paiement réussi:', {
        id: pi.id,
        montant: pi.amount / 100 + ' €',
        boucher: pi.metadata.boucherieNom,
        commission: (parseInt(pi.metadata.commissionPlateforme || '0') / 100) + ' €',
        transferBoucher: (parseInt(pi.metadata.transferAuBoucher || '0') / 100) + ' €',
      })
      // TODO: mettre à jour la commande en base (Supabase)
      break
    }

    // ── Compte boucher activé ─────────────────────────────────────────────────
    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      if (account.charges_enabled && account.payouts_enabled) {
        console.log('[webhook] Compte boucher activé:', account.id, account.email)
        // TODO: mettre à jour le statut du boucher en base (Supabase)
      }
      break
    }

    // ── Virement vers le boucher effectué ────────────────────────────────────
    case 'transfer.created': {
      const transfer = event.data.object as Stripe.Transfer
      console.log('[webhook] Virement boucher:', {
        id: transfer.id,
        montant: transfer.amount / 100 + ' €',
        destination: transfer.destination,
      })
      break
    }

    // ── Paiement échoué ───────────────────────────────────────────────────────
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.error('[webhook] Paiement échoué:', pi.id, pi.last_payment_error?.message)
      break
    }

    default:
      console.log('[webhook] Event non géré:', event.type)
  }

  return NextResponse.json({ received: true })
}
