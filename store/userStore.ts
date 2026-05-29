import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ──────────────────────────────────────────────────────────────────────
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

export interface Avis {
  id: string
  boucherie: string
  produit: string
  note: number
  texte: string
  date: string
}

export interface NotifPrefs {
  livraison: boolean
  promos: boolean
  nouveaux: boolean
  rappels: boolean
  rapport: boolean
}

export interface ProfilClient {
  prenom: string
  nom: string
  email: string
  tel: string
}

// ── Store client persistant ───────────────────────────────────────────────────
interface ClientStore {
  // Profil
  profils: Record<string, ProfilClient>
  saveProfil: (email: string, profil: ProfilClient) => void
  getProfil: (email: string) => ProfilClient | null

  // Adresses
  adresses: Record<string, Adresse[]>
  saveAdresses: (email: string, adresses: Adresse[]) => void
  getAdresses: (email: string) => Adresse[]

  // Cartes bancaires
  cartes: Record<string, Carte[]>
  saveCartes: (email: string, cartes: Carte[]) => void
  getCartes: (email: string) => Carte[]

  // Avis
  avis: Record<string, Avis[]>
  saveAvis: (email: string, avis: Avis[]) => void
  getAvis: (email: string) => Avis[]

  // Notifs
  notifPrefs: Record<string, NotifPrefs>
  saveNotifPrefs: (email: string, prefs: NotifPrefs) => void
  getNotifPrefs: (email: string) => NotifPrefs

  // Favoris (IDs de boucheries)
  favoris: Record<string, number[]>
  saveFavoris: (email: string, ids: number[]) => void
  getFavoris: (email: string) => number[]
}

const DEFAULT_NOTIFS: NotifPrefs = { livraison: true, promos: true, nouveaux: false, rappels: true, rapport: false }

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      profils: {},
      saveProfil: (email, profil) => set(s => ({ profils: { ...s.profils, [email]: profil } })),
      getProfil: (email) => get().profils[email] || null,

      adresses: {},
      saveAdresses: (email, adresses) => set(s => ({ adresses: { ...s.adresses, [email]: adresses } })),
      getAdresses: (email) => get().adresses[email] || [],

      cartes: {},
      saveCartes: (email, cartes) => set(s => ({ cartes: { ...s.cartes, [email]: cartes } })),
      getCartes: (email) => get().cartes[email] || [],

      avis: {},
      saveAvis: (email, avis) => set(s => ({ avis: { ...s.avis, [email]: avis } })),
      getAvis: (email) => get().avis[email] || [],

      notifPrefs: {},
      saveNotifPrefs: (email, prefs) => set(s => ({ notifPrefs: { ...s.notifPrefs, [email]: prefs } })),
      getNotifPrefs: (email) => get().notifPrefs[email] || DEFAULT_NOTIFS,

      favoris: {},
      saveFavoris: (email, ids) => set(s => ({ favoris: { ...s.favoris, [email]: ids } })),
      getFavoris: (email) => get().favoris[email] || [],
    }),
    {
      name: 'boucherie-client-data',
      // Stockage par email — les données de chaque utilisateur sont isolées
    }
  )
)

// ── Store boucher persistant ───────────────────────────────────────────────────
export interface ProfilBoucher {
  prenom: string
  nom: string
  email: string
  tel: string
  boutique: string
}

export interface NotifBoucherPrefs {
  nouvelle_cmd: boolean
  stock_faible: boolean
  paiement: boolean
  rapport: boolean
}

export interface BoutiqueData {
  nom: string
  desc: string
  tel: string
  email: string
  adresse: string
  frais: string
  minCommande: string
  rayon: string
  promo: boolean
  promoTexte: string
  horaires: Record<string, any>
  promotions: any[]
}

interface BoucherStore {
  profils: Record<string, ProfilBoucher>
  saveProfil: (email: string, profil: ProfilBoucher) => void
  getProfil: (email: string) => ProfilBoucher | null

  notifPrefs: Record<string, NotifBoucherPrefs>
  saveNotifPrefs: (email: string, prefs: NotifBoucherPrefs) => void
  getNotifPrefs: (email: string) => NotifBoucherPrefs

  boutiques: Record<string, Partial<BoutiqueData>>
  saveBoutique: (email: string, data: Partial<BoutiqueData>) => void
  getBoutique: (email: string) => Partial<BoutiqueData>
}

const DEFAULT_NOTIFS_BOUCHER: NotifBoucherPrefs = { nouvelle_cmd: true, stock_faible: true, paiement: true, rapport: false }

export const useBoucherStore = create<BoucherStore>()(
  persist(
    (set, get) => ({
      profils: {},
      saveProfil: (email, profil) => set(s => ({ profils: { ...s.profils, [email]: profil } })),
      getProfil: (email) => get().profils[email] || null,

      notifPrefs: {},
      saveNotifPrefs: (email, prefs) => set(s => ({ notifPrefs: { ...s.notifPrefs, [email]: prefs } })),
      getNotifPrefs: (email) => get().notifPrefs[email] || DEFAULT_NOTIFS_BOUCHER,

      boutiques: {},
      saveBoutique: (email, data) => set(s => ({ boutiques: { ...s.boutiques, [email]: { ...s.boutiques[email], ...data } } })),
      getBoutique: (email) => get().boutiques[email] || {},
    }),
    { name: 'boucherie-boucher-data' }
  )
)
