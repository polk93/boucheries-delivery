'use client'

export default function BottomNavBoucher({ currentTab, onTabChange }: {
  currentTab: string
  onTabChange: (tab: string) => void
}) {
  const tabs = [
    { id: 'commandes',  ico: '📋', label: 'Commandes' },
    { id: 'produits',   ico: '🛍️', label: 'Produits'  },
    { id: 'boutique',   ico: '🏪', label: 'Boutique'  },
    { id: 'parametres', ico: '⚙️', label: 'Paramètres'},
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-or z-20 shadow-[0_-4px_20px_rgba(61,32,18,.15)]">
      <div className="bg-brun py-0.5 text-center">
        <span className="text-[10px] font-bold text-or tracking-wider">🔪 ESPACE BOUCHER</span>
      </div>
      <div className="flex">
        {tabs.map(t => (
          <button key={t.id}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 border-none bg-transparent cursor-pointer transition-colors ${currentTab === t.id ? 'text-or' : 'text-gray-400'}`}
            onClick={() => onTabChange(t.id)}>
            <span className="text-lg">{t.ico}</span>
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
