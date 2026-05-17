import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// Déclenché automatiquement quand Shipday confirme la livraison
export async function POST(req: NextRequest) {
  try {
    const {
      stripeAccountIdLivreur,  // compte Stripe Express du livreur
      fraisLivraison,          // en centimes (ex: 490 = 4,90€)
      pourboire,               // en centimes (100% livreur)
      numeroCommande,
      nomLivreur,
    } = await req.json()

    if (!stripeAccountIdLivreur) {
      return NextResponse.json({ error: 'stripeAccountIdLivreur requis' }, { status: 400 })
    }

    const montantLivreur = fraisLivraison + pourboire

    if (montantLivreur <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    // Transfer direct vers le compte Stripe Express du livreur
    const transfer = await stripe.transfers.create({
      amount: montantLivreur,
      currency: 'eur',
      destination: stripeAccountIdLivreur,
      description: `Livraison ${numeroCommande} — ${nomLivreur}`,
      metadata: {
        numeroCommande,
        nomLivreur,
        fraisLivraison: String(fraisLivraison),
        pourboire: String(pourboire),
        type: 'paiement_livreur',
      },
    })

    console.log('[payer-livreur] Transfer créé:', transfer.id, (montantLivreur / 100).toFixed(2) + '€ → ' + nomLivreur)

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      montant: (montantLivreur / 100).toFixed(2),
    })

  } catch (err: any) {
    console.error('[payer-livreur]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
