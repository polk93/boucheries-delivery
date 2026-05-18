import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BoucherAccount {
  id: string
  nom: string
  email: string
  password: string
  nom_boutique: string
  ville: string
  createdAt: string
}

interface AccountsStore {
  bouchers: BoucherAccount[]
  addBoucher: (b: BoucherAccount) => void
  updatePassword: (email: string, newPassword: string) => void
  findBoucher: (email: string) => BoucherAccount | undefined
}

export const useAccounts = create<AccountsStore>()(
  persist(
    (set, get) => ({
      bouchers: [],
      addBoucher: (b) => set(s => ({ bouchers: [...s.bouchers, b] })),
      updatePassword: (email, newPassword) => set(s => ({
        bouchers: s.bouchers.map(b =>
          b.email.toLowerCase() === email.toLowerCase()
            ? { ...b, password: newPassword }
            : b
        ),
      })),
      findBoucher: (email) =>
        get().bouchers.find(b => b.email.toLowerCase() === email.toLowerCase()),
    }),
    { name: 'boucherie-accounts' }
  )
)

// Générateur de mot de passe aléatoire sécurisé
export function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
