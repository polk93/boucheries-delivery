import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  nom: string
  email: string
  role: 'client' | 'boucher'
  isDemo: boolean
  boucherieId?: number
  boucherieNom?: string
}

interface AuthStore {
  user: User | null
  login:      (user: User) => void
  logout:     () => void
  updateUser: (updates: Partial<User>) => void
  isClient:   () => boolean
  isBoucher:  () => boolean
  isDemo:     () => boolean
}

export const DEMO_CLIENT: User = {
  id: 'demo_client',
  nom: 'Client Démo',
  email: 'client@demo.fr',
  role: 'client',
  isDemo: true,
}

export const DEMO_BOUCHER: User = {
  id: 'demo_boucher',
  nom: 'Jean Dupont',
  email: 'boucher@demo.fr',
  role: 'boucher',
  isDemo: true,
  boucherieId: 1,
  boucherieNom: 'Maison Dupont',
}

export function isDemoEmail(email: string) {
  return email === DEMO_CLIENT.email || email === DEMO_BOUCHER.email
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      login:      (user) => set({ user }),
      logout:     () => set({ user: null }),
      // Met à jour les champs du user connecté sans déconnecter
      updateUser: (updates) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...updates } })
      },
      isClient:   () => get().user?.role === 'client',
      isBoucher:  () => get().user?.role === 'boucher',
      isDemo:     () => get().user?.isDemo === true,
    }),
    { name: 'boucherie-auth' }
  )
)
