import { NextRequest, NextResponse } from 'next/server'

function normalize(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[a.length][b.length]
}

function nomCorrespond(formNom: string, officielNom: string): boolean {
  const a = normalize(formNom)
  const b = normalize(officielNom)
  if (!a || !b) return false
  if (a === b) return true
  if (b.includes(a) || a.includes(b)) return true
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  const score = (longer.length - levenshtein(longer, shorter)) / longer.length
  return score > 0.75
}

function extractNom(entity: any): string {
  // Entreprises : dénomination sociale
  if (entity.siege?.denomination_usuelle) return entity.siege.denomination_usuelle
  if (entity.denomination) return entity.denomination
  if (entity.nom_complet) return entity.nom_complet
  // Auto-entrepreneurs / personnes physiques
  const prenom = entity.prenom_usuel || entity.prenom || ''
  const nom = entity.nom_usage || entity.nom || ''
  if (prenom || nom) return `${prenom} ${nom}`.trim()
  return ''
}

export async function POST(req: NextRequest) {
  const { siret, nom_boutique } = await req.json()

  const siretClean = (siret ?? '').replace(/\s/g, '')
  if (!/^\d{14}$/.test(siretClean)) {
    return NextResponse.json({ error: 'SIRET invalide (14 chiffres requis)' }, { status: 400 })
  }
  if (!nom_boutique?.trim()) {
    return NextResponse.json({ error: 'Nom de la boucherie manquant' }, { status: 400 })
  }

  let data: any
  try {
    const apiRes = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siretClean}&mtf=true`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 0 } }
    )
    data = await apiRes.json()
  } catch {
    return NextResponse.json({ error: 'Impossible de joindre le registre des entreprises. Réessayez.' }, { status: 503 })
  }

  if (!data.results?.length) {
    return NextResponse.json({
      verified: false,
      siretExiste: false,
      error: 'SIRET introuvable dans le registre officiel des entreprises françaises.',
    })
  }

  // Trouver l'établissement dont le SIRET correspond exactement
  const entity = data.results.find((r: any) => r.siege?.siret === siretClean) ?? data.results[0]
  const officialName = extractNom(entity)

  if (!officialName) {
    return NextResponse.json({
      verified: false,
      siretExiste: true,
      error: 'Impossible d\'extraire le nom officiel de cette entreprise.',
    })
  }

  const nomMatch = nomCorrespond(nom_boutique.trim(), officialName)

  return NextResponse.json({
    verified: nomMatch,
    siretExiste: true,
    nomMatch,
    officialName,
    error: nomMatch
      ? null
      : `Le nom officiel enregistré est "${officialName}". Votre saisie "${nom_boutique}" ne correspond pas.`,
  })
}
