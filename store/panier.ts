import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PanierItem {
  produit_id: string
  boucherie_id: number
  boucherie_nom: string
  nom: string
  prix: number
  icon: string
  quantite: number
  decoupe?: string
  preparation?: string
  note_boucher?: string
  cart_key: string
}

interface PanierStore {
  items: PanierItem[]
  adresse_id: string | null
  creneau: string
  addItem: (item: Omit<PanierItem, 'cart_key'>) => void
  removeItem: (cart_key: string) => void
  updateQuantite: (cart_key: string, delta: number) => void
  updateItem: (cart_key: string, changes: Partial<Pick<PanierItem, 'decoupe' | 'preparation' | 'note_boucher' | 'quantite'>>) => void
  setCreneau: (c: string) => void
  clear: () => void
  totalItems: () => number
  sousTotal: () => number
}

export const usePanier = create<PanierStore>()(
  persist(
    (set, get) => ({
      items: [],
      adresse_id: null,
      creneau: 'now',

      addItem: (item) => set(state => {
        const cart_key = `${item.produit_id}_${item.decoupe ?? ''}_${item.preparation ?? ''}`
        const ex = state.items.find(i => i.cart_key === cart_key)
        if (ex) return { items: state.items.map(i => i.cart_key === cart_key ? { ...i, quantite: i.quantite + 1 } : i) }
        return { items: [...state.items, { ...item, cart_key }] }
      }),

      removeItem: (cart_key) => set(s => ({ items: s.items.filter(i => i.cart_key !== cart_key) })),

      updateQuantite: (cart_key, delta) => set(s => ({
        items: s.items
          .map(i => i.cart_key === cart_key ? { ...i, quantite: Math.max(0, i.quantite + delta) } : i)
          .filter(i => i.quantite > 0),
      })),

      // Modifier découpe / préparation / note d'un article déjà dans le panier
      updateItem: (cart_key, changes) => set(s => ({
        items: s.items.map(i => {
          if (i.cart_key !== cart_key) return i
          const updated = { ...i, ...changes }
          // Recalcule la cart_key si découpe ou préparation change
          updated.cart_key = `${updated.produit_id}_${updated.decoupe ?? ''}_${updated.preparation ?? ''}`
          return updated
        })
      })),

      setCreneau: (c) => set({ creneau: c }),
      clear: () => set({ items: [], adresse_id: null, creneau: 'now' }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantite, 0),
      sousTotal: () => get().items.reduce((s, i) => s + i.prix * i.quantite, 0),
    }),
    { name: 'boucherie-panier' }
  )
)
