import { NextRequest, NextResponse } from 'next/server'

// ── Config Stuart ─────────────────────────────────────────────────────────────
// Sandbox : comptes démo
const SANDBOX_BASE   = 'https://api.sandbox.stuart.com'
const SANDBOX_ID     = process.env.STUART_CLIENT_ID!
const SANDBOX_SECRET = process.env.STUART_CLIENT_SECRET!

// Production : vrais comptes
const PROD_BASE      = 'https://api.stuart.com'
const PROD_ID        = process.env.STUART_PROD_CLIENT_ID!
const PROD_SECRET    = process.env.STUART_PROD_CLIENT_SECRET!

// ── Adresses boucheries ───────────────────────────────────────────────────────
const ADRESSES_BOUCHERIES: Record<number, { adresse: string; nom: string; tel: string }> = {
  1: { adresse: '12 rue de la Roquette, 75011 Paris', nom: 'Maison Dupont',           tel: '0123456789' },
  2: { adresse: '34 rue Oberkampf, 75011 Paris',       nom: 'Boucherie Le Gall',       tel: '0123456790' },
  3: { adresse: '8 rue du Commerce, 75015 Paris',      nom: 'Comptoir du Veau',        tel: '0123456791' },
  4: { adresse: '22 avenue de la République, 75011 Paris', nom: "L'Agneau d'Or",       tel: '0123456792' },
  5: { adresse: '5 rue de Bretagne, 75003 Paris',      nom: 'Bœuf & Tradition',        tel: '0123456793' },
  6: { adresse: '18 rue Lepic, 75018 Paris',           nom: 'Ferme & Boucherie Morel', tel: '0123456794' },
}

// ── Obtenir un token OAuth Stuart ─────────────────────────────────────────────
async function getStuartToken(isDemo: boolean): Promise<{ token: string; base: string }> {
  const base   = isDemo ? SANDBOX_BASE : PROD_BASE
  const id     = isDemo ? SANDBOX_ID   : PROD_ID
  const secret = isDemo ? SANDBOX_SECRET : PROD_SECRET

  const res = await fetch(`${base}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: id,
      client_secret: secret,
      grant_type: 'client_credentials',
      scope: 'api',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Stuart auth failed (${isDemo ? 'sandbox' : 'production'}): ${err}`)
  }

  const data = await res.json()
  return { token: data.access_token, base }
}

// ── Route principale ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, isDemo = false } = body

    const { token, base } = await getStuartToken(isDemo)
    console.log(`[Stuart] Environnement: ${isDemo ? 'SANDBOX (démo)' : 'PRODUCTION'}`)

    // ── Action : estimer le prix et la durée ─────────────────────────────────
    if (action === 'quote') {
      const { boucherieId, adresseClient } = body

      const boucherie = ADRESSES_BOUCHERIES[boucherieId]
      if (!boucherie) return NextResponse.json({ error: 'Boucherie inconnue' }, { status: 400 })

      const res = await fetch(`${base}/v2/jobs/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          job: {
            pickup_address: boucherie.adresse,
            dropoff_address: adresseClient,
            package_type: 'small', // boîte isotherme boucherie
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        return NextResponse.json({ error: err.error || 'Erreur Stuart', details: err }, { status: 400 })
      }

      const data = await res.json()
      return NextResponse.json({
        prixStuart: data.amount,           // prix facturé par Stuart (€)
        dureeMin: data.duration,           // durée estimée en minutes
        distanceKm: (data.distance / 1000).toFixed(1),
      })
    }

    // ── Action : créer une course ─────────────────────────────────────────────
    if (action === 'create') {
      const {
        boucherieId,
        adresseClient,
        nomClient,
        telClient,
        commentaire,
        numeroCommande,
        heurePickup,      // ISO string
      } = body

      const boucherie = ADRESSES_BOUCHERIES[boucherieId]
      if (!boucherie) return NextResponse.json({ error: 'Boucherie inconnue' }, { status: 400 })

      const isSandbox = process.env.STUART_ENV !== 'production'

      const res = await fetch(`${base}/v2/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          job: {
            ...(isSandbox && { simulation: true }),
            pickups: [{
              address: boucherie.adresse,
              comment: `Commande ${numeroCommande} — Merci de récupérer la commande à la boucherie.`,
              contact: {
                firstname: boucherie.nom,
                phone: boucherie.tel,
                company: boucherie.nom,
              },
              pickup_at: heurePickup,
            }],
            dropoffs: [{
              address: adresseClient,
              comment: commentaire || 'Commande de boucherie artisanale — Produits frais.',
              contact: {
                firstname: nomClient.split(' ')[0] || nomClient,
                lastname:  nomClient.split(' ')[1] || '',
                phone: telClient,
              },
              package_type: 'small',
              package_description: `Commande boucherie ${numeroCommande}`,
            }],
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('[Stuart create]', err)
        return NextResponse.json({ error: err.error || 'Erreur Stuart', details: err }, { status: 400 })
      }

      const data = await res.json()
      return NextResponse.json({
        jobId: data.id,
        status: data.status,
        livreurNom: data.deliveries?.[0]?.courier?.firstname || null,
        livreurTel: data.deliveries?.[0]?.courier?.phone_number || null,
        etaMin: data.deliveries?.[0]?.eta_to_destination || null,
        trackingUrl: data.deliveries?.[0]?.tracking_url || null,
      })
    }

    // ── Action : statut d'une course ─────────────────────────────────────────
    if (action === 'status') {
      const { jobId } = body
      const res = await fetch(`${base}/v2/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) return NextResponse.json({ error: 'Impossible de récupérer le statut' }, { status: 400 })
      const data = await res.json()
      return NextResponse.json({
        status: data.status,
        livreurNom: data.deliveries?.[0]?.courier?.firstname || null,
        etaMin: data.deliveries?.[0]?.eta_to_destination || null,
        trackingUrl: data.deliveries?.[0]?.tracking_url || null,
      })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (err: any) {
    console.error('[stuart]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
