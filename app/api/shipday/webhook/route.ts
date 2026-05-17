import { NextRequest, NextResponse } from 'next/server'

// Shipday envoie un POST quand le statut d'une commande change
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[shipday/webhook]', JSON.stringify(body, null, 2))

    const { orderStatus, orderNumber, carrierName, carrierPhone } = body

    // ── Livraison confirmée → payer le livreur automatiquement ───────────────
    if (orderStatus === 'DELIVERED') {

      // Récupérer les infos de paiement depuis les metadata de la commande
      // En production ces données viennent de Supabase
      // Pour la démo on lit depuis les metadata Shipday
      const fraisLivraison = parseInt(body.deliveryFee || '0') * 100  // en centimes
      const pourboire      = parseInt(body.tips || '0') * 100          // en centimes
      const stripeAccountIdLivreur = body.carrierStripeAccountId || null

      if (stripeAccountIdLivreur && (fraisLivraison + pourboire) > 0) {
        // Déclencher le paiement Stripe vers le livreur
        const payRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/connect/payer-livreur`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripeAccountIdLivreur,
            fraisLivraison,
            pourboire,
            numeroCommande: orderNumber,
            nomLivreur: carrierName || 'Livreur',
          }),
        })

        if (payRes.ok) {
          const payData = await payRes.json()
          console.log(`[shipday/webhook] ✅ Livreur ${carrierName} payé : ${payData.montant}€`)
        } else {
          console.error('[shipday/webhook] ❌ Échec paiement livreur')
        }
      } else {
        console.log('[shipday/webhook] Paiement livreur ignoré (pas de compte Stripe ou montant nul)')
      }
    }

    // ── Livreur en route → notification (future) ─────────────────────────────
    if (orderStatus === 'ON_THE_WAY') {
      console.log(`[shipday/webhook] 🛵 Livreur ${carrierName} en route pour ${orderNumber}`)
    }

    // ── Livreur assigné ───────────────────────────────────────────────────────
    if (orderStatus === 'ASSIGNED') {
      console.log(`[shipday/webhook] 👤 ${carrierName} assigné à ${orderNumber}`)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('[shipday/webhook]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
