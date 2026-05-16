'use client'
import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'

function SuiviContent() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-creme flex flex-col" style={{ paddingBottom: 72 }}>
      <div className="bg-brun px-4 py-3.5">
        <h1 className="font-serif text-lg font-bold text-or">🛵 Suivi de commande</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm w-full max-w-sm space-y-5">
          <div className="w-20 h-20 bg-or-pale rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">🛵</span>
          </div>

          <div>
            <h2 className="font-serif text-xl font-black text-brun mb-2">
              Bientôt disponible
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Le suivi en temps réel de vos commandes sera disponible dans une prochaine mise à jour.
            </p>
          </div>

          <div className="bg-or-pale border border-or/20 rounded-2xl p-4 space-y-2 text-left">
            <p className="text-xs font-bold text-brun">Ce qui arrive prochainement :</p>
            {[
              '📍 Localisation du livreur en temps réel',
              '🔔 Notifications à chaque étape',
              '💬 Chat direct avec le livreur',
              '⏱️ Estimation d\'arrivée précise',
            ].map(f => (
              <p key={f} className="text-xs text-brun-clair">{f}</p>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans">
            ← Retour à l'accueil
          </button>
        </div>
      </div>

      <BottomNavClient currentPage="tracking" />
    </div>
  )
}

export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <p className="text-brun">Chargement…</p>
      </div>
    }>
      <SuiviContent />
    </Suspense>
  )
}
