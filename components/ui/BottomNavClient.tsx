'use client'
import { useRouter } from 'next/navigation'
import { usePanier } from '@/store/panier'

export default function BottomNavClient({ currentPage }: { currentPage: string }) {
  const router = useRouter()
  const { totalItems } = usePanier()

  const tabs = [
    { id: 'home',      ico: '🏠', label: 'Accueil',    href: '/' },
    { id: 'commandes', ico: '📦', label: 'Commandes',  href: '/commandes' },
    { id: 'tracking',  ico: '🛵', label: 'Suivi',      href: '/suivi' },
    { id: 'settings',  ico: '⚙️', label: 'Paramètres', href: '/parametres' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gris-bd z-20 safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex max-w-2xl mx-auto">
        {tabs.map(t => (
          <button key={t.id}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${currentPage === t.id ? 'text-brun' : 'text-gray-400'}`}
            onClick={() => router.push(t.href)}>
            <span className="text-lg leading-none">{t.ico}</span>
            <span className="text-[9px] font-semibold">{t.label}</span>
            {currentPage === t.id && <span className="w-1 h-1 rounded-full bg-brun mt-0.5" />}
          </button>
        ))}
      </div>
    </div>
  )
}
