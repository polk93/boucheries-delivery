'use client'
import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'

interface LivreurPos {
  lat: number; lng: number; etaMin: number
  status: string; livreurNom: string; updatedAt: number; demo?: boolean
}

const GPS_BOUCHERIES: Record<number, { lat: number; lng: number; nom: string; adresse: string }> = {
  1: { lat: 48.8534, lng: 2.3813, nom: 'Maison Dupont',           adresse: '12 rue de la Roquette, 75011' },
  2: { lat: 48.8643, lng: 2.3699, nom: 'Boucherie Le Gall',       adresse: '34 rue Oberkampf, 75011' },
  3: { lat: 48.8462, lng: 2.2933, nom: 'Comptoir du Veau',        adresse: '8 rue du Commerce, 75015' },
  4: { lat: 48.8632, lng: 2.3731, nom: "L'Agneau d'Or",           adresse: '22 av de la République, 75011' },
  5: { lat: 48.8619, lng: 2.3596, nom: 'Bœuf & Tradition',        adresse: '5 rue de Bretagne, 75003' },
  6: { lat: 48.8866, lng: 2.3371, nom: 'Ferme & Boucherie Morel', adresse: '18 rue Lepic, 75018' },
}

const STATUTS = [
  { id: 'pending',     label: 'Commande confirmée',   ico: '✅' },
  { id: 'preparing',  label: 'En préparation',        ico: '🔪' },
  { id: 'ready',      label: 'Prête pour livraison',  ico: '📦' },
  { id: 'in_progress',label: 'Livreur en route',      ico: '🛵' },
  { id: 'delivered',  label: 'Livrée !',              ico: '🎉' },
]

function formatEta(min: number): string {
  if (min <= 0) return 'À tout moment'
  if (min === 1) return '~1 minute'
  return `~${min} minutes`
}

function SuiviContent() {
  const params    = useSearchParams()
  const router    = useRouter()
  const numero    = params.get('numero') || '#1042'
  const bid       = parseInt(params.get('bid') || '1')
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapboxRef = useRef<any>(null)
  const markersRef = useRef<{ livreur?: any; client?: any; boucherie?: any }>({})

  const [pos,        setPos]        = useState<LivreurPos | null>(null)
  const [clientPos,  setClientPos]  = useState<{ lat: number; lng: number } | null>(null)
  const [mapReady,   setMapReady]   = useState(false)
  const [statutIdx,  setStatutIdx]  = useState(3)
  const [lastUpdate, setLastUpdate] = useState('')

  const boucherie = GPS_BOUCHERIES[bid] || GPS_BOUCHERIES[1]

  // GPS client
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setClientPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setClientPos({ lat: 48.8590, lng: 2.3750 }),
      { timeout: 5000 }
    )
  }, [])

  // Charger Mapbox
  useEffect(() => {
    if (!mapRef.current || mapboxRef.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js'
    script.onload = () => {
      const mapboxgl = (window as any).mapboxgl
      mapboxgl.accessToken = token
      const map = new mapboxgl.Map({
        container: mapRef.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [boucherie.lng, boucherie.lat],
        zoom: 14,
      })
      map.on('load', () => {
        mapboxRef.current = map
        setMapReady(true)
        const elB = document.createElement('div')
        elB.innerHTML = '🔪'
        elB.style.cssText = 'font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))'
        markersRef.current.boucherie = new mapboxgl.Marker({ element: elB })
          .setLngLat([boucherie.lng, boucherie.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(boucherie.nom))
          .addTo(map)
      })
    }
    document.head.appendChild(script)
    return () => { mapboxRef.current?.remove(); mapboxRef.current = null }
  }, [boucherie.lat, boucherie.lng, boucherie.nom])

  // Marker client
  useEffect(() => {
    if (!mapReady || !clientPos || !mapboxRef.current) return
    const mapboxgl = (window as any).mapboxgl
    if (!mapboxgl) return
    markersRef.current.client?.remove()
    const elC = document.createElement('div')
    elC.innerHTML = '🏠'
    elC.style.cssText = 'font-size:26px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))'
    markersRef.current.client = new mapboxgl.Marker({ element: elC })
      .setLngLat([clientPos.lng, clientPos.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Votre adresse'))
      .addTo(mapboxRef.current)
  }, [mapReady, clientPos])

  // Dessiner l'itinéraire sur la carte
  const drawRoute = useCallback(async (livreurLat: number, livreurLng: number, clientLat: number, clientLng: number) => {
    if (!mapboxRef.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      // Itinéraire : livreur → client
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${livreurLng},${livreurLat};${clientLng},${clientLat}?geometries=geojson&access_token=${token}`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      const route = data.routes?.[0]?.geometry
      if (!route) return

      const map = mapboxRef.current
      // Supprimer l'ancien itinéraire si existant
      if (map.getLayer('route')) map.removeLayer('route')
      if (map.getSource('route')) map.removeSource('route')

      map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: route, properties: {} } })
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#C0392B',
          'line-width': 4,
          'line-opacity': 0.85,
          'line-dasharray': [2, 1],
        },
      })
    } catch {}
  }, [])

  // Polling livreur toutes les 5s
  const pollPosition = useCallback(async () => {
    try {
      const res = await fetch(`/api/suivi?numero=${encodeURIComponent(numero)}`)
      if (!res.ok) return
      const data: LivreurPos = await res.json()
      setPos(data)
      setLastUpdate(new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
      const idx = STATUTS.findIndex(s => s.id === data.status)
      if (idx >= 0) setStatutIdx(idx)
      if (mapReady && mapboxRef.current) {
        const mapboxgl = (window as any).mapboxgl
        if (!mapboxgl) return
        if (!markersRef.current.livreur) {
          const elL = document.createElement('div')
          elL.innerHTML = '🛵'
          elL.style.cssText = 'font-size:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4));transition:all 0.5s ease'
          markersRef.current.livreur = new mapboxgl.Marker({ element: elL })
            .setLngLat([data.lng, data.lat])
            .setPopup(new mapboxgl.Popup({ offset: 32 }).setText(data.livreurNom))
            .addTo(mapboxRef.current)
        } else {
          markersRef.current.livreur.setLngLat([data.lng, data.lat])
        }
        mapboxRef.current.easeTo({ center: [data.lng, data.lat], duration: 1000 })
        // Dessiner l'itinéraire livreur → client
        if (clientPos) {
          drawRoute(data.lat, data.lng, clientPos.lat, clientPos.lng)
        }
      }
    } catch {}
  }, [numero, mapReady, clientPos, drawRoute])

  useEffect(() => {
    pollPosition()
    const id = setInterval(pollPosition, 5000)
    return () => clearInterval(id)
  }, [pollPosition])

  const statut = STATUTS[statutIdx]
  const livré  = statutIdx >= 4

  return (
    <div className="min-h-screen bg-creme flex flex-col" style={{ paddingBottom: 72 }}>

      {/* Header */}
      <div className="bg-brun px-4 py-3.5 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <div className="flex-1">
          <h1 className="font-serif text-base font-bold text-or">🛵 Suivi de commande</h1>
          <p className="text-white/60 text-xs">{numero} · {boucherie.nom}</p>
        </div>
        {pos?.demo && <span className="bg-or/20 border border-or/40 text-or text-[9px] font-bold px-2 py-0.5 rounded-full">DÉMO</span>}
      </div>

      {/* ETA banner */}
      <div className={'px-4 py-3 flex items-center gap-3 ' + (livré ? 'bg-green-500' : 'bg-rouge-vif')}>
        <span className="text-2xl">{statut?.ico}</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">{statut?.label}</p>
          {!livré && pos && <p className="text-white/80 text-xs">Arrivée estimée : {formatEta(pos.etaMin)}</p>}
          {livré  && <p className="text-white/80 text-xs">Merci de votre confiance !</p>}
        </div>
        {!livré && pos && pos.etaMin > 0 && (
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[52px]">
            <p className="text-white font-black text-2xl leading-none">{pos.etaMin}</p>
            <p className="text-white/70 text-[10px]">min</p>
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="relative flex-shrink-0" style={{ height: 310 }}>
        <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />

        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl block mb-2">🗺️</span>
              <p className="text-brun text-sm font-semibold">Chargement de la carte…</p>
            </div>
          </div>
        )}

        {/* Légende */}
        {mapReady && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-2 shadow-sm">
            {[['🛵','Livreur'],['🏠','Vous'],['🔪','Boucherie']].map(([ico,label]) => (
              <p key={label} className="text-[10px] text-gray-600 flex items-center gap-1.5 leading-5">{ico} {label}</p>
            ))}
          </div>
        )}

        {/* Bouton recentrer */}
        {mapReady && pos && (
          <button
            className="absolute bottom-3 right-3 bg-white rounded-xl shadow-lg px-3 py-2 text-xs font-bold text-brun font-sans"
            onClick={() => mapboxRef.current?.flyTo({ center: [pos.lng, pos.lat], zoom: 15, duration: 800 })}>
            🛵 Centrer
          </button>
        )}
      </div>

      {/* Infos */}
      <div className="px-4 py-4 space-y-3 flex-1">

        {/* Livreur card */}
        {pos && statutIdx === 3 && (
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-brun rounded-full flex items-center justify-center text-xl flex-shrink-0">🛵</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-brun truncate">{pos.livreurNom}</p>
              <p className="text-xs text-gray-400">Votre livreur · {formatEta(pos.etaMin)}</p>
            </div>
            <a href="tel:+33600000000"
              className="bg-brun text-white text-xs font-bold px-3 py-2 rounded-xl font-sans flex-shrink-0"
              style={{ textDecoration: 'none' }}>
              📞
            </a>
          </div>
        )}

        {/* Progression */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Progression</p>
          <div className="space-y-3">
            {STATUTS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ' + (
                  i < statutIdx  ? 'bg-green-100 text-green-600' :
                  i === statutIdx ? 'bg-rouge-vif text-white shadow-md' :
                  'bg-gris-bd text-gray-300'
                )}>
                  {i < statutIdx ? '✓' : s.ico}
                </div>
                <p className={'text-sm font-semibold flex-1 ' + (
                  i === statutIdx ? 'text-brun' :
                  i < statutIdx   ? 'text-green-600' : 'text-gray-300'
                )}>
                  {s.label}
                </p>
                {i === statutIdx && (
                  <span className="w-2 h-2 rounded-full bg-rouge-vif animate-pulse flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Boucherie */}
        <div className="bg-white rounded-2xl p-3 flex items-start gap-3 shadow-sm">
          <span className="text-xl flex-shrink-0 mt-0.5">🔪</span>
          <div>
            <p className="text-sm font-bold text-brun">{boucherie.nom}</p>
            <p className="text-xs text-gray-400">{boucherie.adresse}</p>
          </div>
        </div>

        {lastUpdate && (
          <p className="text-center text-[10px] text-gray-300">Mis à jour à {lastUpdate}</p>
        )}
      </div>

      <BottomNavClient currentPage="tracking" />
    </div>
  )
}

export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <div className="text-center"><span className="text-4xl block mb-3">🛵</span><p className="text-brun font-semibold">Chargement…</p></div>
      </div>
    }>
      <SuiviGate />
    </Suspense>
  )
}

function SuiviGate() {
  const params = useSearchParams()
  const router = useRouter()
  const numero = params.get('numero')

  // Pas connecté → écran d'invitation
  // Pas de numéro de commande → pas de livraison en cours
  if (!numero) {
    return (
      <div className="min-h-screen bg-creme flex flex-col" style={{ paddingBottom: 72 }}>
        <div className="bg-brun px-4 py-3.5">
          <h1 className="font-serif text-base font-bold text-or">🛵 Suivi de livraison</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <span className="text-6xl">📦</span>
          <h2 className="font-serif text-xl font-black text-brun">Aucune livraison en cours</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Le suivi en temps réel s'active automatiquement dès qu'une commande en livraison est en cours.
          </p>
          <button
            className="bg-brun text-white font-bold px-6 py-3 rounded-xl text-sm font-sans"
            onClick={() => router.push('/')}>
            Commander maintenant →
          </button>
        </div>
        <BottomNavClient currentPage="tracking" />
      </div>
    )
  }

  return <SuiviContent />
}
