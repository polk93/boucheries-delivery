import { useEffect, useState, useCallback } from 'react'

export interface ProduitDB {
  id: string
  boucher_id: string
  nom: string
  description: string
  prix: number
  icon: string
  stock: number
  photo_url: string | null
  cat: string
  vente_type: string
  decoupes: string[]
  preparation: string[]
  allergenes: string
  actif: boolean
  created_at: string
}

export interface BoucherDB {
  id: string
  email: string
  nom: string
  prenom: string
  telephone: string
  nom_boutique: string
  adresse: string
  ville: string
  description: string
  ouvert: boolean
  actif: boolean
  stripe_account_id: string | null
  produits: ProduitDB[]
}

// ── Hook principal ────────────────────────────────────────────────────────────
export function useSupabaseBouchers() {
  const [bouchers, setBouchers] = useState<BoucherDB[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetchBouchers = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || ''
      const res = await fetch(`${baseUrl}/api/bouchers`)
      if (!res.ok) throw new Error('Erreur chargement bouchers')
      const data = await res.json()
      setBouchers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBouchers()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchBouchers, 30000)
    return () => clearInterval(interval)
  }, [fetchBouchers])

  return { bouchers, loading, error, refetch: fetchBouchers }
}

// ── Hook pour un boucher spécifique ───────────────────────────────────────────
export function useSupabaseProduits(email: string | null) {
  const [produits, setProduits] = useState<ProduitDB[]>([])
  const [boucherId, setBoucherId] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const fetchProduits = useCallback(async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch(`/api/bouchers?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        setBoucherId(data.id || null)
        setProduits(data.produits || [])
      }
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => { fetchProduits() }, [fetchProduits])

  // Ajouter un produit
  async function addProduit(produit: any) {
    const res = await fetch('/api/produits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...produit }),
    })
    if (res.ok) {
      const data = await res.json()
      setProduits(prev => [...prev, data])
      return data
    }
    throw new Error('Erreur ajout produit')
  }

  // Modifier un produit
  async function updateProduit(id: string, updates: any) {
    const res = await fetch('/api/produits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, ...updates }),
    })
    if (res.ok) {
      const data = await res.json()
      setProduits(prev => prev.map(p => p.id === id ? data : p))
      return data
    }
    throw new Error('Erreur mise à jour produit')
  }

  // Supprimer un produit
  async function deleteProduit(id: string) {
    const res = await fetch(`/api/produits?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProduits(prev => prev.filter(p => p.id !== id))
    }
  }

  // Mettre à jour le statut ouvert/fermé
  async function updateIsOpen(isOpen: boolean) {
    if (!email) return
    await fetch('/api/bouchers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ouvert: isOpen }),
    })
  }

  // Mettre à jour le profil boucher
  async function updateProfil(profil: any) {
    if (!email) return
    await fetch('/api/bouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...profil }),
    })
  }

  return {
    produits,
    boucherId,
    loading,
    refetch:       fetchProduits,
    addProduit,
    updateProduit,
    deleteProduit,
    updateIsOpen,
    updateProfil,
  }
}

// ── Convertir ProduitDB → ProduitEtendu (format panel) ───────────────────────
export function dbToEtendu(p: ProduitDB, boucherNom: string, boucherId: number): any {
  return {
    id:           p.id,
    nom:          p.nom,
    desc:         p.description,
    prix:         p.prix,
    icon:         p.icon,
    stock:        p.stock,
    photo:        p.photo_url,
    photoUrl:     p.photo_url,
    cat:          p.cat,
    venteType:    p.vente_type,
    decoupes:     p.decoupes || [],
    preparation:  p.preparation || [],
    allergenes:   p.allergenes || '',
    boucherieId:  boucherId,
    boucherieNom: boucherNom,
  }
}
