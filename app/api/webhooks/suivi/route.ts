import { NextRequest, NextResponse } from 'next/server'

// Stockage en mémoire (en production → Supabase)
// Clé = numeroCommande, valeur = dernière position connue
const positions = new Map<string, {
  lat: number
  lng: number
  etaMin: number
  status: string
  livreurNom: string
  updatedAt: number
}>()

// ── Webhook Stuart → met à jour la position du livreur ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Stuart envoie la position via webhook
    const {
      orderNumber,
      courierLatitude,
      courierLongitude,
      etaToDestination,
      orderStatus,
      courierName,
    } = body

    if (!orderNumber) return NextResponse.json({ ok: true })

    positions.set(orderNumber, {
      lat: parseFloat(courierLatitude) || 48.8566,
      lng: parseFloat(courierLongitude) || 2.3522,
      etaMin: parseInt(etaToDestination) || 0,
      status: orderStatus || 'in_progress',
      livreurNom: courierName || 'Votre livreur',
      updatedAt: Date.now(),
    })

    console.log('[suivi] Position mise à jour:', orderNumber, courierLatitude, courierLongitude)
    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Client → récupère la position du livreur ─────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const numero = searchParams.get('numero')

  if (!numero) return NextResponse.json({ error: 'numero requis' }, { status: 400 })

  const pos = positions.get(numero)

  // Si pas encore de position Stuart → simuler un livreur en mouvement (démo)
  if (!pos) {
    const now = Date.now()
    const t = (now % 60000) / 60000 // 0→1 sur 1 minute (boucle)
    return NextResponse.json({
      demo: true,
      lat: 48.8534 + (t * 0.01),
      lng: 2.3813 + (t * 0.008),
      etaMin: Math.max(1, Math.round(15 - t * 15)),
      status: 'in_progress',
      livreurNom: 'Thomas L.',
      updatedAt: now,
    })
  }

  return NextResponse.json({ ...pos, demo: false })
}
