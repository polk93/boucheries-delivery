'use client'
import { useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'

export default function ProfilPage() {
  const router = useRouter()

  const rows = [
    { ico: '📦', label: 'Mes commandes', sub: '2 commandes passées', href: '/commandes' },
    { ico: '⭐', label: 'Mes avis', sub: '1 avis laissé', href: null },
    { ico: '📍', label: 'Mon adresse', sub: '12 rue de la Roquette, Paris 11e', href: null },
    { ico: '🔔', label: 'Notifications', sub: '2 non lues', href: null },
    { ico: '❤️', label: 'Boucheries favorites', sub: '2 boucheries', href: null },
  ]

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4">
        <h1 className="font-serif text-xl font-bold text-or">👤 Mon profil</h1>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Avatar */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-brun text-white text-4xl flex items-center justify-center mx-auto mb-3">👤</div>
            <p className="font-serif text-xl font-black text-brun">Jean Dupont</p>
            <p className="text-sm text-gray-400">jean@email.fr</p>
            <span className="inline-block mt-2 bg-gris-bd text-brun-clair text-xs font-semibold px-3 py-1 rounded-full">🛒 Client</span>
          </div>

          {/* Rows */}
          {rows.map(r => (
            <div key={r.label}
              className="flex items-center gap-4 py-4 border-b border-gris-bd cursor-pointer hover:bg-creme -mx-2 px-2 rounded-xl transition-colors"
              onClick={() => r.href && router.push(r.href)}>
              <span className="text-xl">{r.ico}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brun">{r.label}</p>
                <p className="text-xs text-gray-400">{r.sub}</p>
              </div>
              <span className="text-gray-300">›</span>
            </div>
          ))}

          <button className="w-full mt-5 bg-rouge-pale text-rouge-vif font-bold py-3 rounded-xl text-sm hover:bg-red-100 transition-colors font-sans">
            Se déconnecter
          </button>
        </div>
      </div>

      <BottomNavClient currentPage="profile" />
    </div>
  )
}
