import { NextRequest, NextResponse } from 'next/server'

// Codes promo (en prod → Supabase)
const PROMOS: Record<string, {
  reduction: number      // % de réduction
  type: 'percent' | 'fixed'
  minCommande: number    // minimum de commande
  maxUtilisations: number
  utilisations: number
  expiresAt: string
  description: string
}> = {
  'BIENVENUE10': { reduction: 10, type: 'percent',  minCommande: 20,  maxUtilisations: 1000, utilisations: 0,  expiresAt: '2026-12-31', description: '10% sur votre première commande' },
  'LIVRAISON':   { reduction: 0,  type: 'fixed',    minCommande: 30,  maxUtilisations: 500,  utilisations: 0,  expiresAt: '2026-12-31', description: 'Livraison offerte dès 30€' },
  'ETE2026':     { reduction: 15, type: 'percent',  minCommande: 40,  maxUtilisations: 200,  utilisations: 0,  expiresAt: '2026-08-31', description: '-15% été 2026' },
  'ARTISAN5':    { reduction: 5,  type: 'fixed',    minCommande: 25,  maxUtilisations: 9999, utilisations: 0,  expiresAt: '2026-12-31', description: '5€ offerts dès 25€' },
}

export async function POST(req: NextRequest) {
  try {
    const { code, montant } = await req.json()
    if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 })

    const promo = PROMOS[code.toUpperCase().trim()]
    if (!promo) return NextResponse.json({ error: 'Code invalide ou expiré', valid: false }, { status: 400 })

    if (new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Ce code a expiré', valid: false }, { status: 400 })
    }
    if (promo.utilisations >= promo.maxUtilisations) {
      return NextResponse.json({ error: 'Ce code n\'est plus disponible', valid: false }, { status: 400 })
    }
    if (montant < promo.minCommande) {
      return NextResponse.json({
        error: `Commande minimum ${promo.minCommande}€ requise (vous avez ${montant.toFixed(2)}€)`,
        valid: false,
      }, { status: 400 })
    }

    // Calculer la réduction
    let reduction = 0
    if (promo.type === 'percent') {
      reduction = Math.round(montant * promo.reduction) / 100
    } else {
      reduction = promo.reduction
    }

    // Incrémenter (en prod → update Supabase)
    promo.utilisations++

    return NextResponse.json({
      valid: true,
      code: code.toUpperCase().trim(),
      reduction: parseFloat(reduction.toFixed(2)),
      type: promo.type,
      valeur: promo.reduction,
      description: promo.description,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
