import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Adresse {
  id: string
  label: string
  rue: string
  cp: string
  ville: string
  complement: string
  defaut: boolean
}

export interface Carte {
  id: string
  last4: string
  expiry: string
  type: string
  defaut: boolean
}

export interface ProfilData {
  prenom: string
  nom: string
  email: string
  tel: string
}

export interface NotifsPrefs {
  livraison: boolean
  promos: boolean
  nouveaux: boolean
  rappels: boolean
  rapport: boolean
}

export interface UserData {
  profil: ProfilData
  adresses: Adresse[]
  cartes: Carte[]
  notifs: NotifsPrefs
  favoris: number[]
}

// Données par défaut
function defaultUserData(email = '', nom = ''): UserData {
  const parts = nom.trim().split(' ')
  return {
    profil: {
      prenom: parts[0] || '',
      nom: parts.slice(1).join(' ') || '',
      email,
      tel: '',
    },
    adresses: [],
    cartes: [],
    notifs: { livraison: true, promos: true, nouveaux: false, rappels: true, rapport: false },
    favoris: [],
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────
// Clé = email utilisateur → données isolées par compte
interface UserStore {
  users: Record<string, UserData>

  // Getters
  getData: (email: string, nom?: string) => UserData

  // Setters
  setProfil:   (email: string, profil: ProfilData) => void
  setAdresses: (email: string, adresses: Adresse[]) => void
  setCartes:   (email: string, cartes: Carte[]) => void
  setNotifs:   (email: string, notifs: NotifsPrefs) => void
  setFavoris:  (email: string, favoris: number[]) => void

  // Helpers
  addAdresse:     (email: string, a: Adresse) => void
  updateAdresse:  (email: string, id: string, updates: Partial<Adresse>) => void
  removeAdresse:  (email: string, id: string) => void
  addCarte:       (email: string, c: Carte) => void
  removeCarte:    (email: string, id: string) => void
  toggleFavori:   (email: string, boucherieId: number) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: {},

      getData: (email, nom = '') => {
        return get().users[email] || defaultUserData(email, nom)
      },

      setProfil: (email, profil) => set(s => ({
        users: { ...s.users, [email]: { ...get().getData(email), profil } }
      })),

      setAdresses: (email, adresses) => set(s => ({
        users: { ...s.users, [email]: { ...get().getData(email), adresses } }
      })),

      setCartes: (email, cartes) => set(s => ({
        users: { ...s.users, [email]: { ...get().getData(email), cartes } }
      })),

      setNotifs: (email, notifs) => set(s => ({
        users: { ...s.users, [email]: { ...get().getData(email), notifs } }
      })),

      setFavoris: (email, favoris) => set(s => ({
        users: { ...s.users, [email]: { ...get().getData(email), favoris } }
      })),

      addAdresse: (email, a) => {
        const data = get().getData(email)
        const adresses = [...data.adresses, a]
        set(s => ({ users: { ...s.users, [email]: { ...data, adresses } } }))
      },

      updateAdresse: (email, id, updates) => {
        const data = get().getData(email)
        const adresses = data.adresses.map(a => a.id === id ? { ...a, ...updates } : a)
        set(s => ({ users: { ...s.users, [email]: { ...data, adresses } } }))
      },

      removeAdresse: (email, id) => {
        const data = get().getData(email)
        let adresses = data.adresses.filter(a => a.id !== id)
        if (adresses.length > 0 && !adresses.some(a => a.defaut)) adresses[0].defaut = true
        set(s => ({ users: { ...s.users, [email]: { ...data, adresses } } }))
      },

      addCarte: (email, c) => {
        const data = get().getData(email)
        const cartes = [...data.cartes, c]
        set(s => ({ users: { ...s.users, [email]: { ...data, cartes } } }))
      },

      removeCarte: (email, id) => {
        const data = get().getData(email)
        const cartes = data.cartes.filter(c => c.id !== id)
        set(s => ({ users: { ...s.users, [email]: { ...data, cartes } } }))
      },

      toggleFavori: (email, boucherieId) => {
        const data = get().getData(email)
        const favoris = data.favoris.includes(boucherieId)
          ? data.favoris.filter(id => id !== boucherieId)
          : [...data.favoris, boucherieId]
        set(s => ({ users: { ...s.users, [email]: { ...data, favoris } } }))
      },
    }),
    {
      name: 'boucherie-user-data',
      version: 1,
    }
  )
)
