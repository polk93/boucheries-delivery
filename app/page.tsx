'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth, DEMO_CLIENT, DEMO_BOUCHER } from '@/store/auth'
import { usePanier } from '@/store/panier'
import AuthModal from '@/components/ui/AuthModal'
import BottomNavClient from '@/components/ui/BottomNavClient'
import NotifPanel from '@/components/ui/NotifPanel'
import PanierMobile from '@/components/panier/PanierMobile'
import ModalBoucherie from '@/components/boucherie/ModalBoucherie'
import ModalPersonnalisation from '@/components/boucherie/ModalPersonnalisation'
import { BOUCHERIES, CATS_NAV, type Boucherie, type Produit } from '@/lib/data'
import { haversine, calculerFrais, GPS_BOUCHERIES, TARIF_MIN } from '@/lib/livraison'
import { useBoucherStore } from '@/store/boucherStore'
import { useSupabaseBouchers, type BoucherDB } from '@/lib/useSupabase'
import { useAutoPushSubscription } from '@/lib/usePush'

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const COORDS: Record<number, { lat: number; lng: number }> = {
  1: { lat: 48.8556, lng: 2.3752 },
  2: { lat: 48.8490, lng: 2.3514 },
  3: { lat: 48.8700, lng: 2.3320 },
  4: { lat: 48.8630, lng: 2.3880 },
  5: { lat: 48.8420, lng: 2.3210 },
  6: { lat: 48.8780, lng: 2.3590 },
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE D'ACCUEIL — NON CONNECTÉ
// ══════════════════════════════════════════════════════════════════════════════
function PageNonConnecte() {
  const { login } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="min-h-screen bg-creme flex flex-col" style={{ paddingBottom: 72 }}>

      {/* Header minimal */}
      <header className="bg-brun px-4 flex items-center justify-between h-14 flex-shrink-0">
        <span className="font-serif text-lg font-black text-or">
          <span className="text-or">Boucheries</span><span className="text-white"> Delivery</span>
        </span>
        <button
          className="bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 text-white text-base font-semibold"
          onClick={() => setAuthOpen(true)}>
          Se connecter
        </button>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brun via-brun-clair to-rouge px-5 py-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-8xl opacity-10 pointer-events-none">🥩</div>
        <h1 className="font-serif font-black text-white leading-tight mb-3" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}>
          La meilleure viande,<br /><span className="text-or">livrée chez vous</span>
        </h1>
        <p className="text-white/70 text-sm mb-4">
          Les boucheries artisanales de votre quartier, à portée de clic.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['🏆 Artisans sélectionnés', '🚚 Livraison rapide', '❄️ Froid garanti', '✂️ Découpe sur mesure'].map(t => (
            <span key={t} className="bg-white/15 border border-or/40 text-or rounded-full px-2.5 py-0.5 text-base font-medium">{t}</span>
          ))}
        </div>
      </section>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm w-full max-w-sm">

          {/* Invitation */}
          <div className="text-center mb-5">
            <span className="text-4xl block mb-3">🥩</span>
            <h2 className="font-serif text-lg font-black text-brun mb-1">
              Découvrez les boucheries<br />près de chez vous
            </h2>
            <p className="text-base text-gray-400 leading-relaxed">
              Connectez-vous pour accéder au catalogue, personnaliser vos découpes et passer commande.
            </p>
          </div>

          {/* Bouton principal */}
          <button
            className="w-full bg-rouge-vif text-white font-bold py-3.5 rounded-xl text-sm font-sans mb-3"
            onClick={() => setAuthOpen(true)}>
            🔐 Se connecter / Créer un compte
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-300">ou essayer sans compte</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Boutons démo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="flex flex-col items-center gap-1 py-3 bg-or-pale border border-or/30 rounded-xl text-base font-bold text-brun-clair font-sans hover:bg-or hover:text-white transition-all active:scale-95"
              onClick={() => login(DEMO_CLIENT)}>
              <span className="text-lg">🛒</span>
              Démo Client
            </button>
            <button
              className="flex flex-col items-center gap-1 py-3 bg-brun/5 border border-brun/20 rounded-xl text-base font-bold text-brun font-sans hover:bg-brun hover:text-white transition-all active:scale-95"
              onClick={() => login(DEMO_BOUCHER)}>
              <span className="text-lg">🔪</span>
              Démo Boucher
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-2">Les comptes démo affichent des données fictives.</p>
        </div>

        {/* Avantages */}
        <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-sm">
          {[
            { ico: '🥩', titre: 'Viande artisanale', desc: 'Boucheries sélectionnées' },
            { ico: '✂️', titre: 'Sur mesure', desc: 'Découpe personnalisée' },
            { ico: '🚚', titre: 'Livraison rapide', desc: 'En moins de 45 min' },
            { ico: '❄️', titre: 'Froid garanti', desc: 'Chaîne du froid assurée' },
          ].map(a => (
            <div key={a.titre} className="bg-white rounded-2xl p-3 shadow-sm">
              <span className="text-xl block mb-1">{a.ico}</span>
              <p className="font-bold text-brun text-base">{a.titre}</p>
              <p className="text-gray-400 text-[10px]">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <BottomNavClient currentPage="home" />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE D'ACCUEIL — CONNECTÉ (client ou démo)
// ══════════════════════════════════════════════════════════════════════════════
function PageCatalogue({ showBoutiques }: { showBoutiques: boolean }) {
  const router = useRouter()
  const { user } = useAuth()
  const { totalItems } = usePanier()

  const [modal, setModal] = useState<Boucherie | null>(null)
  const [customProd, setCustomProd] = useState<{ prod: Produit; boucherie: Boucherie } | null>(null)
  const [catActive, setCatActive] = useState<string | null>(null)
  const { bouchers: bouchersDB, loading: loadingDB } = useSupabaseBouchers()
  console.log('bouchersDB:', bouchersDB, 'loading:', loadingDB)
 const boutiquesReelles = useMemo(() =>
  bouchersDB
    .filter(b => b.produits && b.produits.filter((p: any) => p.actif !== false).length > 0)
    .map(b => ({
      id:           b.id,           // UUID string (pas number)
      nom:          b.nom_boutique,
      note:         5.0,
      frais:        2.9,
      minCommande:  15,
      livraison:    true,
      clickCollect: true,
      adresse:      b.adresse || '',
      desc:         b.description || `${b.produits.length} produit${b.produits.length > 1 ? 's' : ''} disponible${b.produits.length > 1 ? 's' : ''}`,
      tags:         ['Artisan'] as string[],
      photo:        null,
      produits:     b.produits.filter((p: any) => p.actif !== false).map(p => ({
        id:          p.id,
        nom:         p.nom,
        desc:        p.description,
        prix:        p.prix,
        icon:        p.icon,
        stock:       p.stock,
        photo:       p.photo_url,
        photoUrl:    p.photo_url,
        cat:         p.cat,
        venteType:   p.vente_type,
        decoupes:    p.decoupes || [],
        preparation: p.preparation || [],
        allergenes:  p.allergenes || '',
      })) as any,
      ouvert:  b.ouvert,
      avis:    [],
      img:     '',
      cat:     'Artisan',
      badge: (b as any).badge || null,
    } as any))
, [bouchersDB])
  const [filterActive, setFilterActive] = useState('Tous')
  const [sortBy, setSortBy] = useState('note')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [panierOpen, setPanierOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
 const boucheriesToShow = showBoutiques ? BOUCHERIES : boutiquesReelles

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle')
  const [cityName, setCityName] = useState('Ma position')
  const [rayonKm, setRayonKm] = useState(5)

  // Calcul des frais de livraison en temps réel par boucherie
  function getFrais(b: Boucherie): number {
    if (!userPos) return b.frais
    const gps = GPS_BOUCHERIES[b.id]
    if (!gps) return b.frais
    const km = haversine(gps.lat, gps.lng, userPos.lat, userPos.lng)
    return calculerFrais(km)
  }

  function getDistance(b: Boucherie): number {
    if (!userPos) return 0
    const gps = GPS_BOUCHERIES[b.id]
    if (!gps) return 0
    return Math.round(haversine(gps.lat, gps.lng, userPos.lat, userPos.lng) * 10) / 10
  }

  useEffect(() => { requestGeo() }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function requestGeo() {
    if (!navigator.geolocation) { setGeoStatus('denied'); return }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setUserPos({ lat, lng })
        setGeoStatus('ok')
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const d = await res.json()
          const city = d.address?.city || d.address?.town || d.address?.suburb || 'Ma ville'
          setCityName(`${city}${d.address?.postcode ? ' ' + d.address.postcode : ''}`)
        } catch { setCityName('Position détectée') }
        toast.success('📍 Boucheries à proximité chargées !')
      },
      () => setGeoStatus('denied'),
      { timeout: 8000, maximumAge: 300000 }
    )
  }

  const searchResults = useCallback(() => {
    if (!searchQuery.trim()) return { boucheries: [], produits: [] }
    const q = searchQuery.toLowerCase()
    return {
      boucheries: boucheriesToShow.filter(b => b.nom.toLowerCase().includes(q) || b.tags.some((t: string) => t.toLowerCase().includes(q))).slice(0, 3),
      produits: BOUCHERIES.flatMap(b => b.produits.filter(p => p.nom.toLowerCase().includes(q)).map(p => ({ ...p, boucherie: b }))).slice(0, 5),
    }
  }, [searchQuery])
  const { boucheries: srB, produits: srP } = searchResults()

 function isBoutiqueOuverte(b: any): boolean {
  if (!b.ouvert) return false
  if (!b.horaires) return true
  const jours = ['dim','lun','mar','mer','jeu','ven','sam']
  const now = new Date()
  const h = b.horaires[jours[now.getDay()]]
  if (!h || !h.ouvert) return false
  const heure = now.getHours() * 60 + now.getMinutes()
  const toMin = (s: string) => { const [hh,mm] = s.split(':').map(Number); return hh*60+mm }
  return (h.matin && heure >= toMin(h.matinDebut) && heure < toMin(h.matinFin)) ||
         (h.am    && heure >= toMin(h.amDebut)    && heure < toMin(h.amFin))
}
const filtered = boucheriesToShow.filter((b: any) => isBoutiqueOuverte(b))
    .filter(b => {
      if (userPos && COORDS[b.id]) {
        if (distanceKm(userPos.lat, userPos.lng, COORDS[b.id].lat, COORDS[b.id].lng) > rayonKm) return false
      }
      if (catActive && b.cat !== catActive && !b.tags.includes(catActive)) return false
      if (filterActive === 'Livraison rapide') return parseInt(b.livraison) <= 35
      if (filterActive === 'Gratuit') return b.frais === 0
      if (filterActive === 'Bio') return b.tags.includes('Bio')
      if (filterActive === 'Halal') return b.tags.includes('Halal')
      if (filterActive === 'Premium') return b.tags.some((t: string) => ['Wagyu', 'MOF', 'Label Rouge'].includes(t))
      return true
    })
    .map(b => ({ ...b, distKm: userPos && COORDS[b.id] ? distanceKm(userPos.lat, userPos.lng, COORDS[b.id].lat, COORDS[b.id].lng) : null }))
    .sort((a, b) => {
      if (sortBy === 'distance' && a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm
      if (sortBy === 'note') return b.note - a.note
      if (sortBy === 'livraison') return parseInt(a.livraison) - parseInt(b.livraison)
      if (sortBy === 'frais') return a.frais - b.frais
      return 0
    })

  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>

      {/* ── HEADER ── */}
      <header className="bg-brun sticky top-0 z-30 shadow-xl">
        <div className="w-full max-w-2xl mx-auto px-4 flex items-center gap-2 h-14">

          {/* Logo SVG */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="96" cy="96" r="90" fill="#3D2012"/>
              <circle cx="96" cy="96" r="86" stroke="#C8953A" strokeWidth="4" fill="none"/>
              <rect x="58" y="52" width="46" height="10" rx="4" fill="#FAF7F2" transform="rotate(-20 58 52)"/>
              <rect x="72" y="58" width="58" height="32" rx="6" fill="#FAF7F2" transform="rotate(-20 72 58)"/>
              <rect x="44" y="82" width="36" height="28" rx="5" fill="#C8953A" transform="rotate(-20 44 82)"/>
              <circle cx="52" cy="92" r="4" fill="#FAF7F2" transform="rotate(-20 52 92)"/>
              <circle cx="64" cy="88" r="4" fill="#FAF7F2" transform="rotate(-20 64 88)"/>
              <ellipse cx="108" cy="138" rx="22" ry="12" fill="#C0392B"/>
              <ellipse cx="102" cy="135" rx="10" ry="6" fill="#E74C3C"/>
            </svg>
            <span className="font-serif text-sm font-black text-or leading-tight hidden xs:block">
              Boucheries<br/><span className="text-white text-base font-bold">Delivery</span>
            </span>
          </div>

          {/* Recherche */}
          <div ref={searchRef} className="flex-1 flex items-center bg-white/12 border border-white/20 rounded-xl overflow-hidden min-w-0">
            <input
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 px-2.5 py-1.5 text-sm font-sans min-w-0"
              placeholder="Rechercher une boucherie…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
            />
            <button className="bg-or text-white px-2.5 py-1.5 text-sm flex-shrink-0">🔍</button>
          </div>

          {/* Notif */}
          <button className="bg-white/15 border border-white/25 rounded-xl p-1.5 text-white text-base flex-shrink-0"
            onClick={() => setNotifOpen(true)}>🔔</button>

          {/* Panier */}
          <button
            className="relative bg-rouge-vif rounded-xl px-2.5 py-1.5 text-white text-sm font-semibold flex-shrink-0 transition-colors active:scale-95"
            onClick={() => totalItems() > 0 ? setPanierOpen(true) : router.push('/commande/paiement')}>
            🛒
            {totalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-or text-brun rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── SEARCH PANEL ── */}
      {searchOpen && searchQuery.trim() && (<>
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSearchOpen(false)} />
        <div className="fixed top-14 left-0 right-0 z-50 bg-white shadow-xl max-h-[70vh] overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4">
            {srB.length === 0 && srP.length === 0
              ? <p className="text-center py-8 text-gray-400 text-sm">Aucun résultat pour « {searchQuery} »</p>
              : (<>
                  {srB.map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl active:bg-creme cursor-pointer"
                      onClick={() => { setModal(b); setSearchOpen(false); setSearchQuery('') }}>
                      <img src={b.img} alt={b.nom} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brun text-sm truncate">{b.nom}</p>
                        <p className="text-base text-gray-400">⭐ {b.note} · {b.livraison}</p>
                      </div>
                      <span className="text-rouge-vif font-bold text-sm flex-shrink-0">{userPos ? `${getFrais(b).toFixed(2)} €` : (b.frais === 0 ? 'Gratuit' : `${b.frais.toFixed(2)} €`)}</span>
                    </div>
                  ))}
                  {srP.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl active:bg-creme cursor-pointer"
                      onClick={() => { setModal((p as any).boucherie); setSearchOpen(false); setSearchQuery('') }}>
                      <div className="w-10 h-10 rounded-lg bg-or-pale flex items-center justify-center text-xl flex-shrink-0">{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brun text-sm truncate">{p.nom}</p>
                        <p className="text-base text-gray-400 truncate">{(p as any).boucherie?.nom}</p>
                      </div>
                      <span className="text-rouge-vif font-bold text-sm flex-shrink-0">{p.prix.toFixed(2)} €</span>
                    </div>
                  ))}
                </>)}
          </div>
        </div>
      </>)}

      {/* Géoloc refusée */}
      {geoStatus === 'denied' && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
          <p className="text-base text-orange-700">📍 Activez la géolocalisation pour trouver les boucheries proches.</p>
          <button className="text-base font-bold text-orange-600 ml-3 flex-shrink-0" onClick={requestGeo}>Activer</button>
        </div>
      )}

      {/* ── BANDEAU PRÉSENTATION (non connectés uniquement) ── */}
      {!user && (
        <div className="bg-gradient-to-br from-brun via-brun-clair to-rouge px-4 py-6 relative overflow-hidden">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-8xl opacity-10 pointer-events-none select-none">🥩</div>
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif font-black text-white leading-tight mb-2" style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)' }}>
              La meilleure viande,<br /><span className="text-or">livrée chez vous</span>
            </h1>
            <p className="text-white/70 text-sm mb-3">Les boucheries artisanales de votre quartier, livrées en moins de 45 min.</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['🏆 Artisans', '🚚 Livraison rapide', '❄️ Froid garanti', '✂️ Sur mesure'].map(t => (
                <span key={t} className="bg-white/15 border border-or/40 text-or rounded-full px-2.5 py-0.5 text-base font-medium">{t}</span>
              ))}
            </div>
            <button
              className="bg-or text-brun font-bold text-sm px-5 py-2.5 rounded-xl font-sans"
              onClick={() => setAuthOpen(true)}>
              Créer un compte gratuit →
            </button>
          </div>
        </div>
      )}

      {/* ── CATÉGORIES ── */}
      <div className="bg-white border-b border-gris-bd px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATS_NAV.map(c => (
            <button key={c.label}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border-2 min-w-[54px] flex-shrink-0 transition-all ${catActive === c.label ? 'bg-rouge-pale border-rouge-vif' : 'bg-creme border-transparent'}`}
              onClick={() => setCatActive(catActive === c.label ? null : c.label)}>
              <span className="text-xl">{c.icon}</span>
              <span className="text-[10px] font-semibold text-brun">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTRES ── */}
      <div className="bg-white border-b border-gris-bd px-4 py-2">
        <div className="max-w-2xl mx-auto flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 items-center">
          {['Tous', 'Livraison rapide', 'Gratuit', 'Bio', 'Halal', 'Premium'].map(f => (
            <button key={f}
              className={`border rounded-full px-3 py-1 text-base font-medium whitespace-nowrap flex-shrink-0 transition-all ${filterActive === f ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200'}`}
              onClick={() => setFilterActive(f)}>{f}</button>
          ))}
          <select className="ml-1 border border-gray-200 rounded-lg px-2 py-1 text-base text-brun bg-white outline-none flex-shrink-0"
            value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {userPos && <option value="distance">📍 Proches</option>}
            <option value="note">⭐ Notés</option>
            <option value="livraison">🕐 Rapides</option>
            <option value="frais">💶 Frais</option>
          </select>
          {userPos && (
            <div className="flex gap-1 ml-1 flex-shrink-0">
              {[2, 5, 10].map(r => (
                <button key={r}
                  className={`text-base px-2 py-0.5 rounded-full border whitespace-nowrap transition-all ${rayonKm === r ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                  onClick={() => setRayonKm(r)}>{r}km</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CATALOGUE ── */}
      <div className="max-w-2xl mx-auto w-full px-4 py-4">

        {/* Vrai compte — pas encore de boucheries réelles */}
       {boutiquesReelles.length === 0 && !showBoutiques ? (
  <div className="text-center py-16 text-gray-400">
    <span className="text-5xl block mb-4">🔪</span>
    <h2 className="font-serif text-lg font-bold text-brun mb-2">Bientôt disponible</h2>
    <p className="text-sm leading-relaxed mb-2">
      Les boucheries de votre quartier arrivent bientôt sur BoucherieDelivery.
    </p>
    <p className="text-base text-gray-300">
      Vous serez notifié dès qu'une boucherie partenaire ouvre près de chez vous.
    </p>
  </div>
) : (<>

        {userPos && filtered.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3 flex justify-between items-center">
            <p className="text-base text-green-700 font-semibold">📍 {filtered.length} boucherie{filtered.length > 1 ? 's' : ''} à moins de {rayonKm} km</p>
            <button className="text-base text-green-600 font-bold ml-2" onClick={() => setRayonKm(r => Math.min(r + 5, 20))}>Élargir</button>
          </div>
        )}

        {filtered.length === 0
          ? <div className="text-center py-14 text-gray-400">
              <span className="text-5xl block mb-3">🔍</span>
              <p className="font-semibold text-sm mb-2">Aucune boucherie trouvée</p>
              {userPos && <button className="text-sm text-or font-bold" onClick={() => setRayonKm(r => r + 5)}>Élargir le rayon</button>}
            </div>
          : <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
              {filtered.map(b => (
                <div key={b.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[.98] transition-transform cursor-pointer"
                  onClick={() => setModal(b)}>
                  <div className="relative overflow-hidden">
                    <img src={b.img} alt={b.nom} className="w-full object-cover" style={{ height: 'clamp(130px, 35vw, 175px)' }} />
                   {b.badge && (
  <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-lg"
    style={{ background: b.badge === 'Promo' ? '#C0392B' : b.badge === 'Nouveau' ? '#C9A84C' : b.badge === 'Halal' ? '#27AE60' : b.badge === 'Bio' ? '#2ECC71' : b.badge === 'Premium' ? '#8E44AD' : b.badge === 'Populaire' ? '#E67E22' : '#3D2012', color: 'white' }}>
    {b.badge === 'Promo' ? '🏷️' : b.badge === 'Nouveau' ? '✨' : b.badge === 'Halal' ? '☪️' : b.badge === 'Bio' ? '🌿' : b.badge === 'Premium' ? '⭐' : b.badge === 'Populaire' ? '🔥' : ''} {b.badge}
  </span>
)}
                    {b.badge === 'Nouveau' && <span className="absolute top-2 left-2 bg-or text-brun text-[11px] font-bold px-2 py-0.5 rounded-lg">✨ Nouveau</span>}
                    {!b.ouvert && <span className="absolute top-2 right-2 bg-black/65 text-red-400 text-[11px] font-bold px-2 py-0.5 rounded-lg">⛔ Fermé</span>}
                    {b.frais === 0 && b.ouvert && <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">Offerte</span>}
                    {b.distKm !== null && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-lg">📍 {b.distKm.toFixed(1)} km</span>}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-serif text-sm font-bold text-brun flex-1 mr-2 leading-tight">{b.nom}</span>
                      <span className="text-base font-semibold text-or flex-shrink-0">⭐ {b.note}</span>
                    </div>
                    <p className="text-base text-gray-400 mb-2 line-clamp-2">{b.desc}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {b.tags.slice(0, 3).map((t: string) => <span key={t} className="bg-gris-bd text-brun-clair text-[10px] font-medium px-1.5 py-0.5 rounded">{t}</span>)}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gris-bd">
                      <span className="text-[11px] text-gray-400">🕐 {b.livraison} · {userPos ? `🚚 ${getFrais(b).toFixed(2)} € · 📍 ${getDistance(b)} km` : (b.frais === 0 ? '🚚 Gratuit' : `🚚 ${b.frais.toFixed(2)} €`)}</span>
                      <button className="bg-brun text-white text-[11px] font-semibold px-3 py-1 rounded-lg active:bg-rouge-vif transition-colors"
                        onClick={e => { e.stopPropagation(); setModal(b) }}>Voir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
        </>)}
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <ModalBoucherie boucherie={modal} onClose={() => setModal(null)}
          onAddProduit={prod => setCustomProd({ prod, boucherie: modal })} />
      )}
      {customProd && (
        <ModalPersonnalisation produit={customProd.prod} boucherie={customProd.boucherie}
          onClose={() => setCustomProd(null)} />
      )}
      {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {/* Panier mobile */}
      {panierOpen && (
        <PanierMobile
          onClose={() => setPanierOpen(false)}
          onCommander={() => { setPanierOpen(false); router.push('/commande/paiement') }}
        />
      )}

      <BottomNavClient currentPage="home" />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT — Router selon l'état de connexion
// ══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const router = useRouter()
  const { user, isBoucher, isDemo } = useAuth()

  useEffect(() => {
    if (isBoucher()) router.replace('/panel')
  }, [user])

  if (isBoucher()) return null

  // Tous les visiteurs voient le catalogue — connectés ou non
  // Non connecté → boutiques visibles en démo, panier désactivé
  // Compte démo / vrai compte → catalogue complet
  return <PageCatalogue showBoutiques={isDemo()} />
}

