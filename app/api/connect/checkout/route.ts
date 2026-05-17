import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// Commission plateforme 15% + frais fixes de traitement
const COMMISSION_RATE = 0.15

export async function POST(req: NextRequest) {
  try {
    const {
      montantProduits,  // en centimes
      fraisLivraison,   // en centimes
      pourboire,        // en centimes
      stripeAccountId,  // compte Express du boucher
      boucherieNom,
      boucherieId,
      items,
    } = await req.json()

    const totalCents = montantProduits + fraisLivraison + pourboire

    if (!stripeAccountId) {
      // Boucher pas encore inscrit sur Connect → paiement sur compte principal
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          boucherieId: String(boucherieId),
          boucherieNom,
          mode: 'sans_connect',
          montantProduits: String(montantProduits),
          fraisLivraison: String(fraisLivraison),
          pourboire: String(pourboire),
        },
        description: `Commande BoucheriesDelivery — ${boucherieNom}`,
      })
      return NextResponse.json({ clientSecret: paymentIntent.client_secret, mode: 'direct' })
    }

    // Calcul de la répartition
    // Commission plateforme = 15% des produits uniquement (pas de la livraison ni du pourboire)
    const commissionPlateforme = Math.round(montantProduits * COMMISSION_RATE)
    // Le boucher reçoit : produits - commission
    // Les frais de livraison vont au livreur (géré séparément)
    // Le pourboire va intégralement au livreur

    // Destination charge : le montant total est capturé, la commission reste sur le compte plateforme
    // Le reste (montant - commission) est transféré au boucher
    const transferAuBoucher = montantProduits - commissionPlateforme

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      // Destination charge : transfer automatique vers le boucher
      transfer_data: {
        amount: transferAuBoucher,
        destination: stripeAccountId,
      },
      metadata: {
        boucherieId: String(boucherieId),
        boucherieNom,
        stripeAccountId,
        montantProduits: String(montantProduits),
        fraisLivraison: String(fraisLivraison),
        pourboire: String(pourboire),
        commissionPlateforme: String(commissionPlateforme),
        transferAuBoucher: String(transferAuBoucher),
        items: JSON.stringify(items),
      },
      description: `Commande BoucheriesDelivery — ${boucherieNom}`,
      statement_descriptor_suffix: 'BOUCHERIES',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      mode: 'connect',
      repartition: {
        totalCents,
        transferAuBoucher,
        commissionPlateforme,
        fraisLivraison,
        pourboire,
      },
    })

  } catch (err: any) {
    console.error('[connect/checkout]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
