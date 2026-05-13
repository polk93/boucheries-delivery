'use client'
import { useRouter } from 'next/navigation'
import { usePanier } from '@/store/panier'

export default function BottomNav({ currentPage }: { currentPage: string }) {
  const router = useRouter()
  const { totalItems } = usePanier()

  const tabs = [
    { id: 'home',      ico: '🏠', label: 'Accueil',    href: '/' },
    { id: 'commandes', ico: '📦', label: 'Commandes',  href: '/commandes' },
    { id: 'tracking',  ico: '🛵', label: 'Suivi',      href: '/suivi' },
    { id: 'settings',  ico: '⚙️', label: 'Paramètres', href: '/parametres' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gris-bd flex z-20 shadow-[0_-4px_20px_rgba(61,32,18,.1)]">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 border-none bg-transparent cursor-pointer transition-colors relative ${currentPage === t.id ? 'text-rouge-vif' : 'text-gray-400'}`}
          onClick={() => router.push(t.href)}
        >
          {t.id === 'home' && totalItems() > 0 && (
            <span className="absolute top-1.5 right-[calc(50%-18px)] bg-rouge-vif text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
              {totalItems()}
            </span>
          )}
          <span className="text-xl">{t.ico}</span>
          <span className="text-[10px] font-semibold">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
