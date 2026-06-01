import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProduitSave {
  id: string; nom: string; desc: string; prix: number; icon: string
  stock: number; photo: string | null; photoUrl: string | null
  decoupes: string[]; preparation: string[]
  boucherieId: number; boucherieNom: string; cat: string; venteType: string
}

export interface StripeAccountInfo {
  accountId: string; businessName: string
  chargesEnabled: boolean; payoutsEnabled: boolean
  email: string; linkedAt: string
}

export interface BoucherProfil {
  prenom: string; nom: string; email: string; tel: string; boutique: string
}

interface BoucherStore {
  produits:       Record<string, ProduitSave[]>
  stripeAccounts: Record<string, StripeAccountInfo>
  profils:        Record<string, BoucherProfil>
  orders:         Record<string, any[]>
  historique:     Record<string, any[]>
  boutiques:      Record<string, any>
  isOpen:         Record<string, boolean>

  // Produits
  getProduits:   (bid: number) => ProduitSave[]
  setProduits:   (bid: number, p: ProduitSave[]) => void
  addProduit:    (bid: number, p: ProduitSave) => void
  updateProduit: (bid: number, id: string, u: Partial<ProduitSave>) => void
  removeProduit: (bid: number, id: string) => void

  // Stripe
  getStripeAccount:   (email: string) => StripeAccountInfo | null
  setStripeAccount:   (email: string, info: StripeAccountInfo) => void
  clearStripeAccount: (email: string) => void

  // Profil
  getBoucherProfil: (email: string) => BoucherProfil | null
  setBoucherProfil: (email: string, profil: BoucherProfil) => void

  // Commandes en cours
  getOrders:  (bid: string) => any[]
  setOrders:  (bid: string, orders: any[]) => void

  // Historique commandes
  getHistorique:  (bid: string) => any[]
  setHistorique:  (bid: string, hist: any[]) => void

  // Boutique settings
  getBoutique: (bid: number) => any | null
  setBoutique: (bid: number, b: any) => void

  // Statut ouvert/fermé
  getIsOpen: (bid: string) => boolean | null
  setIsOpen: (bid: string, val: boolean) => void
}

export const useBoucherStore = create<BoucherStore>()(
  persist(
    (set, get) => ({
      produits: {}, stripeAccounts: {}, profils: {},
      orders: {}, historique: {}, boutiques: {}, isOpen: {},

      getProduits:   (bid) => get().produits[String(bid)] || [],
      setProduits:   (bid, p) => set(s => ({ produits: { ...s.produits, [String(bid)]: p } })),
      addProduit:    (bid, p) => { const cur = get().getProduits(bid); set(s => ({ produits: { ...s.produits, [String(bid)]: [...cur, p] } })) },
      updateProduit: (bid, id, u) => { const next = get().getProduits(bid).map(p => p.id === id ? { ...p, ...u } : p); set(s => ({ produits: { ...s.produits, [String(bid)]: next } })) },
      removeProduit: (bid, id) => { const next = get().getProduits(bid).filter(p => p.id !== id); set(s => ({ produits: { ...s.produits, [String(bid)]: next } })) },

      getStripeAccount:   (email) => get().stripeAccounts[email] || null,
      setStripeAccount:   (email, info) => set(s => ({ stripeAccounts: { ...s.stripeAccounts, [email]: info } })),
      clearStripeAccount: (email) => set(s => { const next = { ...s.stripeAccounts }; delete next[email]; return { stripeAccounts: next } }),

      getBoucherProfil: (email) => get().profils[email] || null,
      setBoucherProfil: (email, profil) => set(s => ({ profils: { ...s.profils, [email]: profil } })),

      getOrders:    (bid) => get().orders[bid] || [],
      setOrders:    (bid, orders) => set(s => ({ orders: { ...s.orders, [bid]: orders } })),

      getHistorique: (bid) => get().historique[bid] || [],
      setHistorique: (bid, hist) => set(s => ({ historique: { ...s.historique, [bid]: hist } })),

      getBoutique: (bid) => get().boutiques[String(bid)] || null,
      setBoutique: (bid, b) => set(s => ({ boutiques: { ...s.boutiques, [String(bid)]: b } })),

      getIsOpen: (bid) => get().isOpen[bid] ?? null,
      setIsOpen: (bid, val) => set(s => ({ isOpen: { ...s.isOpen, [bid]: val } })),
    }),
    { name: 'boucherie-boucher-data', version: 3 }
  )
)
