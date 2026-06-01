import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProduitSave {
  id: string; nom: string; desc: string; prix: number; icon: string
  stock: number; photo: string | null; photoUrl: string | null
  decoupes: string[]; preparation: string[]
  boucherieId: number; boucherieNom: string; cat: string; venteType: string
}

export interface StripeAccountInfo {
  accountId: string
  businessName: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  email: string
  linkedAt: string
}

interface BoucherStore {
  produits:       Record<string, ProduitSave[]>
  stripeAccounts: Record<string, StripeAccountInfo> // clé = email du boucher

  // Produits
  getProduits:   (bid: number) => ProduitSave[]
  setProduits:   (bid: number, p: ProduitSave[]) => void
  addProduit:    (bid: number, p: ProduitSave) => void
  updateProduit: (bid: number, id: string, u: Partial<ProduitSave>) => void
  removeProduit: (bid: number, id: string) => void

  // Stripe Connect
  getStripeAccount:   (email: string) => StripeAccountInfo | null
  setStripeAccount:   (email: string, info: StripeAccountInfo) => void
  clearStripeAccount: (email: string) => void
}

export const useBoucherStore = create<BoucherStore>()(
  persist(
    (set, get) => ({
      produits:       {},
      stripeAccounts: {},

      getProduits: (bid) => get().produits[String(bid)] || [],
      setProduits: (bid, p) => set(s => ({ produits: { ...s.produits, [String(bid)]: p } })),
      addProduit: (bid, p) => {
        const cur = get().getProduits(bid)
        set(s => ({ produits: { ...s.produits, [String(bid)]: [...cur, p] } }))
      },
      updateProduit: (bid, id, u) => {
        const next = get().getProduits(bid).map(p => p.id === id ? { ...p, ...u } : p)
        set(s => ({ produits: { ...s.produits, [String(bid)]: next } }))
      },
      removeProduit: (bid, id) => {
        const next = get().getProduits(bid).filter(p => p.id !== id)
        set(s => ({ produits: { ...s.produits, [String(bid)]: next } }))
      },

      getStripeAccount: (email) => get().stripeAccounts[email] || null,
      setStripeAccount: (email, info) =>
        set(s => ({ stripeAccounts: { ...s.stripeAccounts, [email]: info } })),
      clearStripeAccount: (email) =>
        set(s => {
          const next = { ...s.stripeAccounts }
          delete next[email]
          return { stripeAccounts: next }
        }),
    }),
    { name: 'boucherie-boucher-data', version: 1 }
  )
)
