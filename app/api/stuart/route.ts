import { NextRequest, NextResponse } from 'next/server'

// ── Config Stuart ─────────────────────────────────────────────────────────────
const STUART_BASE = process.env.STUART_ENV === 'production'
  ? 'https://api.stuart.com'
  : 'https://api.sandbox.stuart.com'

const CLIENT_ID     = process.env.STUART_CLIENT_ID!
const CLIENT_SECRET = process.env.STUART_CLIENT_SECRET!

// ── Adresses boucheries (à remplacer par Supabase en V2) ──────────────────────
const ADRESSES_BOUCHERIES: Record<number, { adresse: string; nom: string; tel: string }> = {
  1: { adresse: '12 rue de la Roquette, 75011 Paris', nom: 'Maison Dupont',          tel: '0123456789' },
  2: { adresse: '34 rue Oberkampf, 75011 Paris',       nom: 'Boucherie Le Gall',      tel: '0123456790' },
  3: { adresse: '8 rue du Commerce, 75015 Paris',      nom: 'Comptoir du Veau',       tel: '0123456791' },
  4: { adresse: '22 avenue de la République, 75011 Paris', nom: "L'Agneau d'Or",      tel: '0123456792' },
  5: { adresse: '5 rue de Bretagne, 75003 Paris',      nom: 'Bœuf & Tradition',       tel: '0123456793' },
  6: { adresse: '18 rue Lepic, 75018 Paris',           nom: 'Ferme & Boucherie Morel', tel: '0123456794' },
}

// ── Obtenir un token OAuth Stuart ────────────────────────────────────────────
async function getStuartToken(): Promise<string> {
  const res = await fetch(`${STUART_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'api',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Stuart auth failed: ${err}`)
  }
  const data = await res.json()
  return data.access_token
}

// ── Route principale ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    const token = await getStuartToken()

    // ── Action : estimer le prix et la durée ─────────────────────────────────
    if (action === 'quote') {
      const { boucherieId, adresseClient } = body

      const boucherie = ADRESSES_BOUCHERIES[boucherieId]
      if (!boucherie) return NextResponse.json({ error: 'Boucherie inconnue' }, { status: 400 })

      const res = await fetch(`${STUART_BASE}/v2/jobs/pricing`, {
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

      const res = await fetch(`${STUART_BASE}/v2/jobs`, {
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
      const res = await fetch(`${STUART_BASE}/v2/jobs/${jobId}`, {
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
