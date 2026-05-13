'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'

const STEPS = [
  { label: 'Commande reçue',  icon: '📋', sub: 'Transmise à la boucherie.' },
  { label: 'En préparation',  icon: '🔪', sub: 'Le boucher prépare votre sélection.' },
  { label: 'Prête au départ', icon: '📦', sub: 'Emballée et réfrigérée.' },
  { label: 'En livraison',    icon: '🛵', sub: 'Votre livreur est en route.' },
  { label: 'Livrée !',        icon: '✅', sub: 'Bon appétit ! Pensez à laisser un avis.' },
]

// ── Contenu qui utilise useSearchParams (doit être dans Suspense) ──
function SuiviContent() {
  const searchParams = useSearchParams()
  const numero = searchParams.get('numero') || '#1043'
  const [step, setStep] = useState(1)
  const [showReview, setShowReview] = useState(false)
  const [reviewNote, setReviewNote] = useState(0)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (s < 4) return s + 1
        clearInterval(timer)
        setTimeout(() => setShowReview(true), 1500)
        return s
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const eta = step >= 3 ? '~8 min' : step >= 2 ? '~18 min' : '~28 min'

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4">
        <h1 className="font-serif text-xl font-bold text-or">🛵 Suivi de commande</h1>
        <p className="text-white/60 text-xs mt-0.5">{numero} · Maison Dupont</p>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">

        {/* Map simulée */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl h-36 flex items-center justify-center text-5xl mb-4 relative overflow-hidden border border-blue-200">
          🗺️
          {step >= 3 && (
            <span className="absolute bottom-4 right-6 text-2xl animate-bounce">🛵</span>
          )}
        </div>

        {/* ETA */}
        <div className="bg-rouge-pale border border-rouge-vif/20 rounded-2xl p-4 text-center mb-4">
          <p className="font-serif text-4xl font-black text-rouge-vif">{eta}</p>
          <p className="text-xs text-gray-400 mt-1">Temps de livraison estimé</p>
        </div>

        {/* Livreur */}
        {step >= 3 && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 mb-4 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-brun text-white text-xl flex items-center justify-center flex-shrink-0">🛵</div>
            <div>
              <p className="font-bold text-brun text-sm">Karim B.</p>
              <p className="text-xs text-gray-400">⭐ 4,8 · En route · Kangoo réfrigéré ❄️</p>
            </div>
            <span className="ml-auto text-2xl cursor-pointer">📞</span>
          </div>
        )}

        {/* Steps */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'pending'
            return (
              <div key={i} className="flex gap-4 relative">
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[17px] top-9 w-0.5 h-[calc(100%-12px)] ${i < step ? 'bg-green-400' : 'bg-gray-100'}`} />
                )}
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base flex-shrink-0 z-10 transition-all ${
                  state === 'done'   ? 'border-green-400 bg-green-50' :
                  state === 'active' ? 'border-rouge-vif bg-rouge-pale animate-pulse' :
                                       'border-gray-200 bg-white'
                }`}>
                  {state === 'done' ? '✓' : s.icon}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-bold ${state === 'pending' ? 'text-gray-400' : 'text-brun'}`}>{s.label}</p>
                  {state !== 'pending' && (
                    <p className={`text-xs mt-0.5 ${state === 'active' ? 'text-rouge-vif font-semibold' : 'text-gray-400'}`}>
                      {state === 'active' ? 'En cours…' : s.sub}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal avis */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-serif text-xl font-black text-brun mb-1">Votre avis compte ! ⭐</h2>
            <p className="text-xs text-gray-400 mb-4">Comment s'est passée votre commande ?</p>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  className="text-3xl bg-transparent border-none cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setReviewNote(n)}>
                  {n <= reviewNote ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none mb-4"
              rows={3}
              placeholder="Dites-nous ce que vous avez aimé…"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
            <button
              className="w-full bg-or text-brun font-bold py-3 rounded-xl text-sm disabled:bg-gray-200 disabled:text-gray-400"
              disabled={!reviewNote}
              onClick={() => setShowReview(false)}>
              {reviewNote ? `Publier mon avis ${'⭐'.repeat(reviewNote)}` : 'Sélectionnez une note'}
            </button>
            <button className="w-full text-gray-400 text-xs mt-2" onClick={() => setShowReview(false)}>Plus tard</button>
          </div>
        </div>
      )}

      <BottomNavClient currentPage="tracking" />
    </div>
  )
}

// ── Export avec Suspense ──────────────────────────────────────
export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-4xl mb-3">🛵</p>
          <p className="text-sm">Chargement du suivi…</p>
        </div>
      </div>
    }>
      <SuiviContent />
    </Suspense>
  )
}
