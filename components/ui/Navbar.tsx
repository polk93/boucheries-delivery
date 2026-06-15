'use client'
// components/ui/Navbar.tsx
import { RefObject } from 'react'

interface NavbarProps {
  searchRef: RefObject<HTMLDivElement>
  searchQuery: string
  setSearchQuery: (v: string) => void
  setSearchOpen: (v: boolean) => void
  setNotifOpen: (v: boolean) => void
  totalItems: number
  onCartClick: () => void
}

export default function Navbar({ searchRef, searchQuery, setSearchQuery, setSearchOpen, setNotifOpen, totalItems, onCartClick }: NavbarProps) {
  return (
    <header className="bg-brun sticky top-0 z-30 shadow-xl">
      <div className="max-w-5xl mx-auto px-5 flex items-center gap-3 h-16">
        <span className="font-serif text-xl font-black text-or cursor-pointer whitespace-nowrap">
          Bouche<span className="text-white">rie</span>
        </span>
        <button className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white text-base cursor-pointer whitespace-nowrap">
          📍 Paris 11e ▾
        </button>
        <div ref={searchRef} className="flex-1 flex items-center bg-white/12 border border-white/20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-or/50">
          <input
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/45 px-3 py-2 text-sm font-sans min-w-0"
            placeholder="Rechercher viande, boucherie, découpe…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
          />
          <button className="bg-or text-white px-3 py-2 text-base">🔍</button>
        </div>
        <button className="relative bg-white/15 border border-white/25 rounded-xl p-2 text-white text-base" onClick={() => setNotifOpen(true)}>
          🔔
        </button>
        <button className="flex items-center gap-1.5 bg-rouge-vif border-none rounded-xl px-3.5 py-2 text-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-red-700 transition-colors relative"
          onClick={onCartClick}>
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-or text-brun rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

