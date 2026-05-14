import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'client' | 'boucher'

export interface AuthUser {
  id: string
  nom: string
  email: string
  role: UserRole
  isDemo?: boolean       // compte démo — affiche les données fictives
  boucherieId?: number
  boucherieNom?: string
}

// ── Comptes démo prédéfinis ──────────────────────────────────────────────────
export const DEMO_CLIENT: AuthUser = {
  id: 'demo_client',
  nom: 'Marie Dupont (Démo)',
  email: 'demo@boucheriedelivery.fr',
  role: 'client',
  isDemo: true,
}

export const DEMO_BOUCHER: AuthUser = {
  id: 'demo_boucher',
  nom: 'Jean Martin (Démo)',
  email: 'demo.boucher@boucheriedelivery.fr',
  role: 'boucher',
  isDemo: true,
  boucherieId: 1,
  boucherieNom: 'Maison Dupont',
}

// ── Détection démo par email ─────────────────────────────────────────────────
export const DEMO_EMAILS = [DEMO_CLIENT.email, DEMO_BOUCHER.email]
export function isDemoEmail(email: string) {
  return DEMO_EMAILS.includes(email.toLowerCase().trim())
}

interface AuthStore {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isClient: () => boolean
  isBoucher: () => boolean
  isDemo: () => boolean
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      isClient: () => get().user?.role === 'client',
      isBoucher: () => get().user?.role === 'boucher',
      isDemo: () => get().user?.isDemo === true,
    }),
    { name: 'boucherie-auth' }
  )
)
