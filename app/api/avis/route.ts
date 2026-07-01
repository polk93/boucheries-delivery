import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizeName(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim().replace(/\s+/g, ' ')
}

// "Jean-Pierre Dupont" → "Jean-Pierre D."
function anonymize(nom: string): string {
  const parts = nom.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

// Accepte si le nom soumis est contenu dans le nom stocké ou vice-versa
// "Marie" → match "Marie Dupont" ; "Dupont" → match "Jean Dupont"
function nameMatches(stored: string, submitted: string): boolean {
  if (!stored) return true
  const a = normalizeName(stored)
  const b = normalizeName(submitted)
  return a.includes(b) || b.includes(a)
}

// GET /api/avis?client_email=xxx        → avis laissés par un client
// GET /api/avis?boucher_id=xxx          → tous les avis d'un boucher
// GET /api/avis?boucher_id=xxx&produit= → avis filtrés par produit
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const email      = searchParams.get('client_email')
    const boucher_id = searchParams.get('boucher_id')
    const produit    = searchParams.get('produit')

    if (email) {
      const { data } = await supabase
        .from('avis')
        .select('*, bouchers(nom_boutique)')
        .eq('client_email', email)
        .order('created_at', { ascending: false })
      return NextResponse.json(data || [])
    }

    if (boucher_id) {
      let query = supabase
        .from('avis')
        .select('id, auteur, note, texte, produit, created_at, commande_numero')
        .eq('boucher_id', boucher_id)
        .order('created_at', { ascending: false })
      if (produit) query = query.eq('produit', decodeURIComponent(produit))
      const { data } = await query
      return NextResponse.json(data || [])
    }

    return NextResponse.json([])
  } catch {
    return NextResponse.json([])
  }
}

// POST /api/avis — soumettre un avis avec vérification commande
// Body: { commande_numero, client_nom, boucher_id, produit, note, texte }
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { commande_numero, client_nom, boucher_id, produit, note, texte } = await req.json()

    if (!commande_numero?.trim() || !client_nom?.trim() || !boucher_id || !note || !texte?.trim()) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
    }
    if (note < 1 || note > 5) {
      return NextResponse.json({ error: 'Note invalide.' }, { status: 400 })
    }

    // 1. Trouver la commande (par numero ou par id UUID)
    const { data: commande } = await supabase
      .from('commandes')
      .select('id, client_email, numero, status, boucher_id')
      .or(`numero.eq.${commande_numero.trim()},id.eq.${commande_numero.trim()}`)
      .eq('boucher_id', boucher_id)
      .maybeSingle()

    if (!commande) {
      return NextResponse.json(
        { error: 'Commande introuvable. Vérifiez le numéro et la boucherie sélectionnée.' },
        { status: 404 }
      )
    }

    if (!['done', 'livree'].includes(commande.status || '')) {
      return NextResponse.json(
        { error: 'Votre commande doit être livrée pour pouvoir laisser un avis.' },
        { status: 400 }
      )
    }

    // 2. Vérifier le nom du client
    const { data: client } = await supabase
      .from('clients')
      .select('nom')
      .eq('email', commande.client_email)
      .maybeSingle()

    if (client?.nom && !nameMatches(client.nom, client_nom)) {
      return NextResponse.json(
        { error: 'Le nom ne correspond pas à cette commande. Entrez votre nom tel qu\'il apparaît dans votre profil.' },
        { status: 400 }
      )
    }

    // 3. Vérifier l'absence de doublon (contrainte UNIQUE boucher_id + commande_numero + produit)
    const numero_ref = commande.numero || commande_numero.trim()
    const { data: existing } = await supabase
      .from('avis')
      .select('id')
      .eq('boucher_id', boucher_id)
      .eq('commande_numero', numero_ref)
      .eq('produit', produit || '')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis pour ce produit avec cette commande.' },
        { status: 409 }
      )
    }

    // 4. Insérer l'avis
    const { data: nouvelAvis, error: insertError } = await supabase
      .from('avis')
      .insert({
        boucher_id,
        client_email: commande.client_email,
        commande_id:      commande.id,
        commande_numero:  numero_ref,
        produit:          produit || '',
        auteur:           anonymize(client_nom),
        note,
        texte:            texte.trim(),
        created_at:       new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      // Contrainte UNIQUE en base (double-vérification)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Vous avez déjà laissé un avis pour ce produit avec cette commande.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, avis: nouvelAvis })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/avis?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
    const { error } = await supabase.from('avis').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
