'use client'

interface BottomNavBoucherProps {
  currentTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavBoucher({ currentTab, onTabChange }: BottomNavBoucherProps) {
  const tabs = [
    { id: 'commandes',   ico: '📋', label: 'Commandes'  },
    { id: 'produits',    ico: '🥩', label: 'Produits'   },
    { id: 'boutique',    ico: '🏪', label: 'Boutique'   },
    { id: 'parametres',  ico: '⚙️', label: 'Paramètres' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gris-bd z-20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex max-w-2xl mx-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors font-sans ${
              currentTab === t.id ? 'text-brun' : 'text-gray-400'
            }`}
            onClick={() => onTabChange(t.id)}>
            <span className="text-lg leading-none">{t.ico}</span>
            <span className="text-[9px] font-semibold">{t.label}</span>
            {currentTab === t.id && (
              <span className="w-1 h-1 rounded-full bg-brun mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
