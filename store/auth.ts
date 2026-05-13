import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'client' | 'boucher'

export interface AuthUser {
  id: string
  nom: string
  email: string
  role: UserRole
  boucherieId?: number // pour les bouchers
  boucherieNom?: string
}

interface AuthStore {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isClient: () => boolean
  isBoucher: () => boolean
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      isClient: () => get().user?.role === 'client',
      isBoucher: () => get().user?.role === 'boucher',
    }),
    { name: 'boucherie-auth' }
  )
)
