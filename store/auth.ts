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

export type NotifPrefs = Record<string, boolean>

interface AuthStore {
  user: User | null
  notifPrefs: NotifPrefs
  login:          (user: User) => void
  logout:         () => void
  updateUser:     (updates: Partial<User>) => void
  setNotifPrefs:  (prefs: NotifPrefs) => void
  isClient:       () => boolean
  isBoucher:      () => boolean
  isDemo:         () => boolean
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
      notifPrefs: {},
      login:         (user) => set({ user }),
      logout:        () => set({ user: null, notifPrefs: {} }),
      updateUser:    (updates) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...updates } })
      },
      setNotifPrefs: (prefs) => set({ notifPrefs: prefs }),
      isClient:      () => get().user?.role === 'client',
      isBoucher:     () => get().user?.role === 'boucher',
      isDemo:        () => get().user?.isDemo === true,
    }),
    { name: 'boucherie-auth' }
  )
)
