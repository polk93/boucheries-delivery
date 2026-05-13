'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { usePanier } from '@/store/panier'
import Panier from '@/components/panier/Panier'
import ModalBoucherie from '@/components/boucherie/ModalBoucherie'
import ModalPersonnalisation from '@/components/boucherie/ModalPersonnalisation'
import BottomNav from '@/components/ui/BottomNav'
import NotifPanel from '@/components/ui/NotifPanel'
import ChatBot from '@/components/ui/ChatBot'
import { BOUCHERIES, CATS_NAV, type Boucherie, type Produit } from '@/lib/data'
import { useRouter } from 'next/navigation'

// ── Calcul distance km entre 2 coords ────────────────────────
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Coordonnées fictives pour chaque boucherie (en prod : récupérer depuis Supabase)
const BOUCHERIE_COORDS: Record<number, { lat: number; lng: number }> = {
  1: { lat: 48.8556, lng: 2.3752 }, // Paris 11e
  2: { lat: 48.8490, lng: 2.3514 }, // Paris 13e
  3: { lat: 48.8700, lng: 2.3320 }, // Paris 9e
  4: { lat: 48.8630, lng: 2.3880 }, // Paris 20e
  5: { lat: 48.8420, lng: 2.3210 }, // Paris 14e
  6: { lat: 48.8780, lng: 2.3590 }, // Paris 18e
}

export default function HomePage() {
  const router = useRouter()
  const [modal, setModal] = useState<Boucherie | null>(null)
  const [customProd, setCustomProd] = useState<{ prod: Produit; boucherie: Boucherie } | null>(null)
  const [catActive, setCatActive] = useState<string | null>(null)
  const [filterActive, setFilterActive] = useState('Tous')
  const [sortBy, setSortBy] = useState('note')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { totalItems } = usePanier()

  // ── Géolocalisation ────────────────────────────────────────
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle')
  const [cityName, setCityName] = useState<string>('Votre position')
  const [rayonKm, setRayonKm] = useState(5)

  useEffect(() => {
    requestGeo()
  }, [])

  function requestGeo() {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserPos({ lat, lng })
        setGeoStatus('ok')
        // Reverse geocoding via API publique
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Votre ville'
          const postcode = data.address?.postcode || ''
          setCityName(`${city}${postcode ? ' ' + postcode : ''}`)
        } catch {
          setCityName('Position détectée')
        }
        toast.success('📍 Position détectée — boucheries à proximité !')
      },
      (err) => {
        setGeoStatus('denied')
        toast.error('Géolocalisation refusée — affichage de toutes les boucheries.')
      },
      { timeout: 8000, maximumAge: 300000 }
    )
  }

  // ── Click outside search ───────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ── Recherche ──────────────────────────────────────────────
  const searchResults = useCallback(() => {
    if (!searchQuery.trim()) return { boucheries: [], produits: [] }
    const q = searchQuery.toLowerCase()
    return {
      boucheries: BOUCHERIES.filter(b =>
        b.nom.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 3),
      produits: BOUCHERIES.flatMap(b =>
        b.produits.filter(p => p.nom.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
          .map(p => ({ ...p, boucherie: b }))
      ).slice(0, 5),
    }
  }, [searchQuery])
  const { boucheries: srB, produits: srP } = searchResults()

  // ── Filtres + géolocalisation ──────────────────────────────
  const filtered = BOUCHERIES
    .filter(b => {
      // Filtre géo
      if (userPos) {
        const coords = BOUCHERIE_COORDS[b.id]
        if (coords) {
          const dist = distanceKm(userPos.lat, userPos.lng, coords.lat, coords.lng)
          if (dist > rayonKm) return false
        }
      }
      // Filtres catalogue
      if (catActive && b.cat !== catActive && !b.tags.includes(catActive)) return false
      if (filterActive === 'Livraison rapide') return parseInt(b.livraison) <= 35
      if (filterActive === 'Gratuit') return b.frais === 0
      if (filterActive === 'Bio') return b.tags.includes('Bio')
      if (filterActive === 'Halal') return b.tags.includes('Halal')
      if (filterActive === 'Premium') return b.tags.some(t => ['Wagyu', 'MOF', 'Label Rouge'].includes(t))
      return true
    })
    .map(b => {
      // Ajouter la distance si géoloc disponible
      if (userPos && BOUCHERIE_COORDS[b.id]) {
        const dist = distanceKm(userPos.lat, userPos.lng, BOUCHERIE_COORDS[b.id].lat, BOUCHERIE_COORDS[b.id].lng)
        return { ...b, distKm: dist }
      }
      return { ...b, distKm: null }
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm
      if (sortBy === 'note') return b.note - a.note
      if (sortBy === 'livraison') return parseInt(a.livraison) - parseInt(b.livraison)
      if (sortBy === 'frais') return a.frais - b.frais
      return 0
    })

  const filters = ['Tous', 'Livraison rapide', 'Gratuit', 'Bio', 'Halal', 'Premium']

  return (
    <div className="min-h-screen bg-creme pb-20">

      {/* Header */}
      <header className="bg-brun sticky top-0 z-30 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-3 h-16">
          <span className="font-serif text-xl font-black text-or whitespace-nowrap">Bouche<span className="text-white">rie</span></span>

          {/* Bouton localisation */}
          <button
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${geoStatus === 'ok' ? 'bg-green-500/20 border-green-400/40 text-green-300' : geoStatus === 'loading' ? 'bg-white/10 border-white/20 text-white/60 animate-pulse' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            onClick={geoStatus !== 'ok' ? requestGeo : undefined}
          >
            {geoStatus === 'loading' ? '⏳' : geoStatus === 'ok' ? '📍' : '📍'}
            <span className="max-w-[120px] truncate">{geoStatus === 'loading' ? 'Localisation…' : cityName}</span>
            {geoStatus === 'ok' && <span className="text-green-300">▾</span>}
          </button>

          {/* Search */}
          <div ref={searchRef} className="flex-1 flex items-center bg-white/12 border border-white/20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-or/50">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/45 px-3 py-2 text-sm font-sans min-w-0"
              placeholder="Entrecôte, merguez, boucherie…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
            />
            <button className="bg-or text-white px-3 py-2 text-base">🔍</button>
          </div>

          {/* Notif */}
          <button className="bg-white/15 border border-white/25 rounded-xl p-2 text-white text-base relative" onClick={() => setNotifOpen(true)}>
            🔔
          </button>

          {/* Panier */}
          <button
            className="flex items-center gap-1.5 bg-rouge-vif border-none rounded-xl px-3.5 py-2 text-white text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-red-700 transition-colors relative"
            onClick={() => router.push('/commande/paiement')}>
            🛒
            {totalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-or text-brun rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center">{totalItems()}</span>
            )}
          </button>
        </div>
      </header>

      {/* Search panel */}
      {searchOpen && searchQuery.trim() && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSearchOpen(false)} />
          <div className="fixed top-[64px] left-0 right-0 z-50 bg-white shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="max-w-5xl mx-auto p-4">
              {srB.length === 0 && srP.length === 0 ? (
                <p className="text-center py-8 text-gray-400">Aucun résultat pour « {searchQuery} »</p>
              ) : (<>
                {srB.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-creme cursor-pointer"
                    onClick={() => { setModal(b); setSearchOpen(false); setSearchQuery('') }}>
                    <img src={b.img} alt={b.nom} className="w-11 h-11 rounded-lg object-cover" />
                    <div><p className="font-semibold text-brun text-sm">{b.nom}</p><p className="text-xs text-gray-400">⭐ {b.note} · {b.livraison}</p></div>
                    <span className="ml-auto text-rouge-vif font-bold text-sm">{b.frais === 0 ? 'Gratuit' : `${b.frais.toFixed(2)} €`}</span>
                  </div>
                ))}
                {srP.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-creme cursor-pointer"
                    onClick={() => { setModal((p as any).boucherie); setSearchOpen(false); setSearchQuery('') }}>
                    <div className="w-11 h-11 rounded-lg bg-or-pale flex items-center justify-center text-2xl">{p.icon}</div>
                    <div><p className="font-semibold text-brun text-sm">{p.nom}</p><p className="text-xs text-gray-400">{(p as any).boucherie?.nom} · {p.desc}</p></div>
                    <span className="ml-auto text-rouge-vif font-bold text-sm">{p.prix.toFixed(2)} €</span>
                  </div>
                ))}
              </>)}
            </div>
          </div>
        </>
      )}

      {/* Bannière géoloc si refusée */}
      {geoStatus === 'denied' && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-orange-700">📍 Activez la géolocalisation pour voir les boucheries proches de vous.</p>
          <button className="text-xs font-bold text-orange-600 ml-3 whitespace-nowrap" onClick={requestGeo}>Activer</button>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-br from-brun via-brun-clair to-rouge px-5 py-10 relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-9xl opacity-10">🥩</div>
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-4xl font-black text-white leading-tight mb-3">
            La meilleure viande,<br /><span className="text-or">livrée chez vous</span>
          </h1>
          {userPos ? (
            <p className="text-white/75 text-base mb-5">
              📍 {filtered.length} boucherie{filtered.length > 1 ? 's' : ''} à moins de {rayonKm} km autour de {cityName}
            </p>
          ) : (
            <p className="text-white/75 text-base mb-5">Les boucheries artisanales de votre quartier, à portée de clic.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {['🏆 Artisans sélectionnés', '🚚 Livraison rapide', '❄️ Froid garanti', '✂️ Découpe sur mesure'].map(t => (
              <span key={t} className="bg-white/15 border border-or/50 text-or rounded-full px-3 py-1 text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="bg-white border-b border-gris-bd px-5 py-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-lg font-bold text-brun mb-3">Explorer par type</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATS_NAV.map(c => (
              <button key={c.label}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 min-w-[68px] transition-all ${catActive === c.label ? 'bg-rouge-pale border-rouge-vif' : 'bg-creme border-transparent hover:border-rouge-vif'}`}
                onClick={() => setCatActive(catActive === c.label ? null : c.label)}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[11px] font-semibold text-brun">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gris-bd px-5 py-2">
        <div className="max-w-5xl mx-auto flex gap-2 items-center flex-wrap">
          {filters.map(f => (
            <button key={f}
              className={`border rounded-full px-3 py-1 text-xs font-medium transition-all ${filterActive === f ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200 hover:border-brun'}`}
              onClick={() => setFilterActive(f)}>{f}</button>
          ))}
          <select
            className="ml-auto border border-gray-200 rounded-lg px-2 py-1 text-xs text-brun bg-white outline-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {userPos && <option value="distance">📍 Plus proches</option>}
            <option value="note">↓ Mieux notés</option>
            <option value="livraison">↓ Plus rapide</option>
            <option value="frais">↓ Frais réduits</option>
          </select>

          {/* Rayon si géoloc active */}
          {userPos && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-xs text-gray-400">Rayon :</span>
              {[2, 5, 10].map(r => (
                <button key={r}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-all ${rayonKm === r ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500 hover:border-brun'}`}
                  onClick={() => setRayonKm(r)}>{r} km</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-5 py-6 flex gap-7">
        <div className="flex-1 min-w-0">

          {/* Bandeau géo */}
          {userPos && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
              <p className="text-xs text-green-700 font-semibold">
                📍 {filtered.length} boucherie{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''} à moins de {rayonKm} km
              </p>
              <button className="text-xs text-green-600 font-bold" onClick={() => setRayonKm(r => Math.min(r + 5, 20))}>Élargir</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-3">🔍</span>
              <p className="font-semibold mb-2">Aucune boucherie trouvée</p>
              {userPos && <button className="text-sm text-or font-bold" onClick={() => setRayonKm(r => r + 5)}>Élargir le rayon à {rayonKm + 5} km</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map(b => (
                <div key={b.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setModal(b)}>
                  <div className="relative overflow-hidden">
                    <img src={b.img} alt={b.nom} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" />
                    {b.badge === 'Promo' && <span className="absolute top-2 left-2 bg-rouge-vif text-white text-[11px] font-bold px-2 py-1 rounded-lg">🏷️ Promo</span>}
                    {b.badge === 'Nouveau' && <span className="absolute top-2 left-2 bg-or text-brun text-[11px] font-bold px-2 py-1 rounded-lg">✨ Nouveau</span>}
                    {!b.ouvert && <span className="absolute top-2 right-2 bg-black/65 text-red-400 text-[11px] font-bold px-2 py-1 rounded-lg">⛔ Fermé</span>}
                    {b.frais === 0 && b.ouvert && <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[11px] font-bold px-2 py-1 rounded-lg">Livraison offerte</span>}
                    {/* Badge distance */}
                    {(b as any).distKm !== null && (
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-1 rounded-lg">
                        📍 {(b as any).distKm.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-serif text-base font-bold text-brun">{b.nom}</span>
                      <span className="text-xs font-semibold text-or">⭐ {b.note} <span className="text-gray-300 font-normal">({b.avis})</span></span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{b.desc.slice(0, 72)}…</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {b.tags.map(t => <span key={t} className="bg-gris-bd text-brun-clair text-[11px] font-medium px-2 py-0.5 rounded-md">{t}</span>)}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gris-bd">
                      <span className="text-[11px] text-gray-400">🕐 {b.livraison} · 🚚 {b.frais === 0 ? 'Gratuit' : `${b.frais.toFixed(2)} €`}</span>
                      <button
                        className="bg-brun text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rouge-vif transition-colors"
                        onClick={e => { e.stopPropagation(); setModal(b) }}>Voir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panier desktop */}
        <aside className="w-72 hidden lg:block">
          <Panier onCommander={() => router.push('/commande/paiement')} />
        </aside>
      </div>

      {/* Modals */}
      {modal && (
        <ModalBoucherie
          boucherie={modal}
          onClose={() => setModal(null)}
          onAddProduit={prod => setCustomProd({ prod, boucherie: modal })}
        />
      )}
      {customProd && (
        <ModalPersonnalisation
          produit={customProd.prod}
          boucherie={customProd.boucherie}
          onClose={() => setCustomProd(null)}
        />
      )}

      {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
      {chatOpen && <ChatBot boucheries={BOUCHERIES} onClose={() => setChatOpen(false)} />}

      {/* Chatbot FAB */}
      <button
        className="fixed bottom-20 right-5 z-30 rounded-full bg-brun text-white text-2xl shadow-xl flex items-center justify-center hover:bg-rouge-vif transition-all hover:scale-105"
        style={{ width: 52, height: 52 }}
        onClick={() => setChatOpen(o => !o)}>
        {chatOpen ? '✕' : '🤖'}
      </button>

      <BottomNav currentPage="home" />
    </div>
  )
}
