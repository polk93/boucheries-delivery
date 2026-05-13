import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await req.json()
    const {
      user_id, boucherie_id, adresse_id,
      lignes, frais_livraison, creneau_type,
      creneau_debut, creneau_fin,
    } = body

    if (!user_id || !boucherie_id || !lignes?.length)
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

    // Vérifier les stocks
    for (const ligne of lignes) {
      const { data: prod } = await supabase
        .from('produits')
        .select('stock, nom')
        .eq('id', ligne.produit_id)
        .single()
      if (!prod || prod.stock < ligne.quantite)
        return NextResponse.json({ error: `Stock insuffisant : ${prod?.nom ?? ligne.nom}` }, { status: 409 })
    }

    // Calcul totaux
    const sous_total = lignes.reduce((s: number, l: any) => s + l.prix * l.quantite, 0)
    const total = sous_total + frais_livraison

    // Créer PaymentIntent Stripe
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { user_id, boucherie_id },
    })

    // Insérer la commande en base
    const { data: commande, error } = await supabase
      .from('commandes')
      .insert({
        user_id,
        boucherie_id,
        adresse_id: adresse_id ?? null,
        sous_total: Math.round(sous_total * 100) / 100,
        frais_livraison,
        total: Math.round(total * 100) / 100,
        stripe_payment_intent_id: pi.id,
        stripe_payment_status: 'pending',
        creneau_type,
        creneau_debut: creneau_debut ?? null,
        creneau_fin: creneau_fin ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Insérer les lignes de commande
    await supabase.from('lignes_commande').insert(
      lignes.map((l: any) => ({
        commande_id: commande.id,
        produit_id: l.produit_id,
        produit_nom: l.nom,
        produit_prix: l.prix,
        quantite: l.quantite,
        decoupe: l.decoupe ?? null,
        preparation: l.preparation ?? null,
        note_boucher: l.note_boucher ?? null,
        sous_total: Math.round(l.prix * l.quantite * 100) / 100,
      }))
    )

    // Notification client
    await supabase.from('notifications').insert({
      user_id,
      icon: '📋',
      titre: 'Commande reçue !',
      message: `Votre commande ${commande.numero} a été transmise à la boucherie.`,
      lien: `/suivi/${commande.id}`,
    })

    return NextResponse.json({
      commande_id: commande.id,
      numero: commande.numero,
      client_secret: pi.client_secret,
      total,
    })
  } catch (err: any) {
    console.error('POST /api/commandes:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  const boucherie_id = searchParams.get('boucherie_id')

  if (!user_id && !boucherie_id)
    return NextResponse.json({ error: 'Paramètre requis' }, { status: 400 })

  let q = supabase
    .from('commandes')
    .select('*, lignes_commande(*), boucheries(nom, img_url)')
    .order('created_at', { ascending: false })

  if (user_id) q = q.eq('user_id', user_id)
  if (boucherie_id) q = q.eq('boucherie_id', boucherie_id)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
