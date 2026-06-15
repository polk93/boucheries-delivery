'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BOUCHERIES } from '@/lib/data'
import BottomNavClient from '@/components/ui/BottomNavClient'

// Index de tous les produits avec leur boucherie
const TOUS_PRODUITS = BOUCHERIES.flatMap(b =>
  b.produits.map(p => ({
    ...p,
    boucherieId: b.id,
    boucherieNom: b.nom,
    boucherieNote: b.note,
  }))
)

const CATS = ['Tout', 'Bœuf', 'Veau', 'Agneau', 'Volaille', 'Porc', 'Entrée']

export default function RecherchePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [cat, setCat]     = useState('Tout')

  const results = useMemo(() => {
    return TOUS_PRODUITS.filter(p => {
      const matchQ = !query || p.nom.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase())
      const matchC = cat === 'Tout' || String(p.cat) === cat
      return matchQ && matchC
    })
  }, [query, cat])

  // Grouper par boucherie
  const grouped = useMemo(() => {
    const map = new Map<number, typeof results>()
    results.forEach(p => {
      if (!map.has(p.boucherieId)) map.set(p.boucherieId, [])
      map.get(p.boucherieId)!.push(p)
    })
    return Array.from(map.entries())
  }, [results])

  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>
      <div className="bg-brun sticky top-0 z-10 px-4 py-3 space-y-2">
        <input
          autoFocus
          className="w-full bg-white/15 border border-white/25 rounded-xl px-3 py-2.5 text-white placeholder-white/50 text-sm font-sans outline-none"
          placeholder="🔍 Rechercher un produit, une viande…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {CATS.map(c => (
            <button key={c}
              className={'px-3 py-1.5 rounded-full text-base font-bold font-sans whitespace-nowrap flex-shrink-0 transition-all ' + (cat === c ? 'bg-or text-brun' : 'bg-white/15 text-white/70')}
              onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {query === '' && cat === 'Tout' ? (
          // Suggestions populaires
          <div className="space-y-3">
            <p className="text-base font-bold text-gray-400 uppercase tracking-wider">Recherches populaires</p>
            <div className="flex flex-wrap gap-2">
              {['Entrecôte', 'Wagyu', 'Agneau', 'Poulet fermier', 'Merguez', 'Côtes de veau', 'Faux-filet', 'Bavette'].map(s => (
                <button key={s}
                  className="bg-white border border-gris-bd text-brun text-base font-semibold px-3 py-1.5 rounded-full font-sans"
                  onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
            <p className="text-base font-bold text-gray-400 uppercase tracking-wider mt-4">Par catégorie</p>
            <div className="grid grid-cols-3 gap-2">
              {[['🐄','Bœuf'],['🐑','Agneau'],['🐓','Volaille'],['🐷','Porc'],['🐮','Veau'],['🌿','Entrée']].map(([ico,c]) => (
                <button key={c as string}
                  className="bg-white rounded-2xl p-3 text-center shadow-sm active:bg-creme"
                  onClick={() => setCat(c as string)}>
                  <span className="text-2xl block mb-1">{ico}</span>
                  <span className="text-base font-bold text-brun">{c}</span>
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm font-semibold">Aucun résultat pour "{query}"</p>
            <p className="text-base mt-1">Essayez avec un autre mot</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-base text-gray-400">{results.length} produit{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}</p>
            {grouped.map(([bid, prods]) => {
              const b = BOUCHERIES.find(x => x.id === bid)!
              return (
                <div key={bid} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-or-pale border-b border-gris-bd text-left"
                    onClick={() => router.push('/')}>
                    <span className="text-sm font-bold text-brun">{b.nom}</span>
                    <span className="text-base text-or">⭐ {b.note}</span>
                    <span className="text-base text-gray-400 ml-auto">Voir la boutique ›</span>
                  </button>
                  {prods.map((p, i) => (
                    <div key={p.id} className={'flex items-center gap-3 p-3 ' + (i < prods.length - 1 ? 'border-b border-gris-bd' : '')}>
                      <div className="w-12 h-12 rounded-xl bg-or-pale flex items-center justify-center text-2xl flex-shrink-0">
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brun text-sm truncate">{p.nom}</p>
                        <p className="text-base text-gray-400 truncate">{p.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-rouge-vif">{p.prix.toFixed(2)} €</p>
                        <button
                          className="text-[10px] bg-brun text-white px-2.5 py-1 rounded-lg font-bold font-sans mt-0.5"
                          onClick={() => router.push('/')}>
                          Commander
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNavClient currentPage="search" />
    </div>
  )
}

