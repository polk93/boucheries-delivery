'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BOUCHERIES } from '@/lib/data'

const ADRESSES: Record<number, { adresse: string; maps: string; waze: string }> = {
  1: {
    adresse: '12 rue de la Roquette, 75011 Paris',
    maps: 'https://maps.google.com/?q=12+rue+de+la+Roquette+75011+Paris',
    waze: 'https://waze.com/ul?q=12+rue+de+la+Roquette+75011+Paris',
  },
  2: {
    adresse: '34 rue Oberkampf, 75011 Paris',
    maps: 'https://maps.google.com/?q=34+rue+Oberkampf+75011+Paris',
    waze: 'https://waze.com/ul?q=34+rue+Oberkampf+75011+Paris',
  },
  3: {
    adresse: '8 rue du Commerce, 75015 Paris',
    maps: 'https://maps.google.com/?q=8+rue+du+Commerce+75015+Paris',
    waze: 'https://waze.com/ul?q=8+rue+du+Commerce+75015+Paris',
  },
  4: {
    adresse: '22 avenue de la République, 75011 Paris',
    maps: 'https://maps.google.com/?q=22+avenue+de+la+Republique+75011+Paris',
    waze: 'https://waze.com/ul?q=22+avenue+de+la+Republique+75011+Paris',
  },
  5: {
    adresse: '5 rue de Bretagne, 75003 Paris',
    maps: 'https://maps.google.com/?q=5+rue+de+Bretagne+75003+Paris',
    waze: 'https://waze.com/ul?q=5+rue+de+Bretagne+75003+Paris',
  },
  6: {
    adresse: '18 rue Lepic, 75018 Paris',
    maps: 'https://maps.google.com/?q=18+rue+Lepic+75018+Paris',
    waze: 'https://waze.com/ul?q=18+rue+Lepic+75018+Paris',
  },
}

function ConfirmationContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const numero  = params.get('numero') || '#????'
  const heure   = params.get('heure')  || ''
  const bid     = parseInt(params.get('bid') || '1')
  const modeLiv = params.get('mode') || 'click_collect'

  const boucherie = BOUCHERIES.find(b => b.id === bid)
  const infos     = ADRESSES[bid] || ADRESSES[1]
  const isLivraison = modeLiv === 'livraison'

  return (
    <div className="min-h-screen bg-creme flex flex-col" style={{ paddingBottom: 40 }}>

      <div className="bg-brun px-4 py-4">
        <h1 className="font-serif text-lg font-bold text-or text-center">Commande confirmée</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 w-full">

        {/* Succès */}
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="font-serif text-xl font-black text-brun mb-1">
            {isLivraison ? 'Livraison en route !' : 'Merci pour votre commande !'}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {isLivraison ? 'Un livreur Stuart prend en charge votre commande.' : 'Votre boucherie prépare tout pour vous.'}
          </p>
          <div className="bg-creme rounded-2xl px-4 py-3 inline-block">
            <p className="text-xs text-gray-400 mb-0.5">Numéro de commande</p>
            <p className="font-serif text-2xl font-black text-brun">{numero}</p>
            <p className="text-xs text-gray-400 mt-0.5">À présenter en caisse</p>
          </div>
        </div>

        {/* Infos retrait */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isLivraison ? 'Détails de livraison' : 'Détails du retrait'}
          </p>

          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 bg-brun rounded-xl flex items-center justify-center text-lg flex-shrink-0">
              {isLivraison ? '🛵' : '🔪'}
            </div>
            <div>
              <p className="text-sm font-bold text-brun">
                {isLivraison ? 'Livraison Stuart' : boucherie?.nom || 'Votre boucherie'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isLivraison ? 'Un livreur professionnel prend en charge votre commande' : infos.adresse}
              </p>
            </div>
          </div>

          {isLivraison && (
            <div className="flex gap-3 items-center bg-blue-50 border border-blue-200 rounded-xl p-3">
              <span className="text-2xl flex-shrink-0">📱</span>
              <div>
                <p className="text-sm font-bold text-blue-700">Suivi en temps réel</p>
                <p className="text-xs text-gray-400 mt-0.5">Vous recevrez un SMS avec le lien de suivi Stuart dès qu'un livreur est assigné.</p>
              </div>
            </div>
          )}

          {!isLivraison && heure && (
            <div className="flex gap-3 items-center bg-or-pale rounded-xl p-3">
              <span className="text-2xl flex-shrink-0">🕐</span>
              <div>
                <p className="text-sm font-bold text-brun">Prête à {heure}</p>
                <p className="text-xs text-gray-500 mt-0.5">Vous recevrez une notification dès que c'est prêt</p>
              </div>
            </div>
          )}
        </div>

          {!isLivraison && (
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">S'y rendre</p>
              <a href={infos.maps} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-blue-600 text-white rounded-xl px-4 py-4 font-bold text-sm active:bg-blue-700 transition-colors"
                style={{ textDecoration: 'none' }}>
                <span className="text-2xl">🗺️</span>
                <div className="text-left">
                  <p className="font-bold text-sm">Ouvrir dans Google Maps</p>
                  <p className="text-xs opacity-75 mt-0.5">{infos.adresse}</p>
                </div>
              </a>
              <a href={infos.waze} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 w-full text-white rounded-xl px-4 py-4 font-bold text-sm active:opacity-80 transition-colors"
                style={{ textDecoration: 'none', backgroundColor: '#33CCFF' }}>
                <span className="text-2xl">🚗</span>
                <div className="text-left">
                  <p className="font-bold text-sm">Naviguer avec Waze</p>
                  <p className="text-xs opacity-75 mt-0.5">Itinéraire en temps réel</p>
                </div>
              </a>
            </div>
          )}

        <button onClick={() => router.push('/')}
          className="w-full bg-brun text-white py-4 rounded-2xl font-bold text-sm font-sans">
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <p className="text-brun font-semibold">Chargement…</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
