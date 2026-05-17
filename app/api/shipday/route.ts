import { NextRequest, NextResponse } from 'next/server'

const SHIPDAY_API  = 'https://api.shipday.com'
const SHIPDAY_KEY  = process.env.SHIPDAY_API_KEY!

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${SHIPDAY_KEY}`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // ── Créer une commande et dispatcher un livreur ───────────────────────────
    if (action === 'create') {
      const {
        numeroCommande,
        nomClient,
        telClient,
        adresseClient,
        nomBoucherie,
        adresseBoucherie,
        telBoucherie,
        montantTotal,
        items,
        heurePickup,       // ex: "14:30"
        noteClient,
      } = body

      const res = await fetch(`${SHIPDAY_API}/orders`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          orderNumber: numeroCommande,
          customerName: nomClient,
          customerAddress: adresseClient,
          customerPhoneNumber: telClient,
          restaurantName: nomBoucherie,
          restaurantAddress: adresseBoucherie,
          restaurantPhoneNumber: telBoucherie,
          expectedPickupTime: heurePickup,
          expectedDeliveryDate: new Date().toISOString().split('T')[0],
          orderSource: 'BoucheriesDelivery',
          paymentMethod: 'PAID_ONLINE',
          totalOrderCost: montantTotal,
          tips: body.pourboire || 0,
          deliveryInstruction: noteClient || '',
          orderItem: (items || []).map((item: any) => ({
            name: item.nom,
            quantity: item.qty,
            unitPrice: item.prix,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('[Shipday create]', err)
        return NextResponse.json({ error: 'Erreur Shipday', details: err }, { status: 400 })
      }

      const data = await res.json()
      // Shipday retourne différents formats selon la version de l'API
      return NextResponse.json({
        orderId: data.orderId || data.id || data.order_id || data.orderNumber || null,
        status: data.orderStatus || data.status || null,
        trackingUrl: data.trackingLink || data.tracking_url || data.trackingUrl || null,
        raw: data, // pour debug
      })
    }

    // ── Statut d'une commande ─────────────────────────────────────────────────
    if (action === 'status') {
      const { orderId } = body
      const res = await fetch(`${SHIPDAY_API}/orders/${orderId}`, { headers: headers() })
      if (!res.ok) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
      const data = await res.json()
      return NextResponse.json({
        status: data.orderStatus,
        livreurNom: data.carrierName || null,
        livreurTel: data.carrierPhone || null,
        trackingUrl: data.trackingLink || null,
        etaMin: data.estimatedDeliveryTime || null,
      })
    }

    // ── Assigner manuellement un livreur ─────────────────────────────────────
    if (action === 'assign') {
      const { orderId, carrierId } = body
      const res = await fetch(`${SHIPDAY_API}/orders/${orderId}/assign/${carrierId}`, {
        method: 'POST',
        headers: headers(),
      })
      if (!res.ok) return NextResponse.json({ error: 'Assignation échouée' }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    // ── Lister les livreurs disponibles ──────────────────────────────────────
    if (action === 'carriers') {
      const res = await fetch(`${SHIPDAY_API}/carriers`, { headers: headers() })
      if (!res.ok) return NextResponse.json({ carriers: [] })
      const data = await res.json()
      return NextResponse.json({
        carriers: data.map((c: any) => ({
          id: c.id,
          nom: `${c.name}`,
          status: c.isOnline ? 'disponible' : 'hors ligne',
          telephone: c.phoneNumber,
        })),
      })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (err: any) {
    console.error('[shipday]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Lister toutes les commandes en cours
  try {
    const res = await fetch(`${SHIPDAY_API}/orders/active`, { headers: headers() })
    if (!res.ok) return NextResponse.json({ orders: [] })
    const data = await res.json()
    return NextResponse.json({ orders: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
