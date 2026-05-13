import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature invalide:', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {

    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const { data: cmd } = await supabase
        .from('commandes')
        .select('id, numero, user_id, boucheries(nom)')
        .eq('stripe_payment_intent_id', pi.id)
        .single()

      if (cmd) {
        await supabase.from('commandes').update({
          stripe_payment_status: 'succeeded',
          statut: 'nouvelle',
        }).eq('id', cmd.id)

        await supabase.from('notifications').insert({
          user_id: cmd.user_id,
          icon: '✅',
          titre: 'Paiement confirmé !',
          message: `Commande ${cmd.numero} — La boucherie prépare votre commande !`,
          lien: `/suivi/${cmd.id}`,
        })
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await supabase.from('commandes').update({
        stripe_payment_status: 'failed',
        statut: 'annulee',
      }).eq('stripe_payment_intent_id', pi.id)
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await supabase.from('commandes').update({
          statut: 'annulee',
          stripe_payment_status: 'refunded',
        }).eq('stripe_payment_intent_id', charge.payment_intent)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
