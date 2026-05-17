'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ReturnContent() {
  const params = useSearchParams()
  const router = useRouter()
  const accountId = params.get('account')
  const [status, setStatus] = useState<'loading'|'ok'|'pending'|'error'>('loading')
  const [info, setInfo] = useState<any>(null)

  useEffect(() => {
    if (!accountId) { setStatus('error'); return }
    fetch(`/api/connect/onboard?accountId=${accountId}`)
      .then(r => r.json())
      .then(data => {
        setInfo(data)
        if (data.chargesEnabled && data.payoutsEnabled) setStatus('ok')
        else setStatus('pending')
      })
      .catch(() => setStatus('error'))
  }, [accountId])

  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6 py-10">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm space-y-4">

        {status === 'loading' && (
          <>
            <span className="text-5xl block">⏳</span>
            <p className="font-serif text-lg font-bold text-brun">Vérification en cours…</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <span className="text-5xl block">🎉</span>
            <h1 className="font-serif text-xl font-black text-brun">Compte activé !</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre compte Stripe est configuré. Vous recevrez vos paiements automatiquement chaque semaine (le lundi).
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-left space-y-1">
              <p className="text-xs font-bold text-green-700">✅ Paiements activés</p>
              <p className="text-xs font-bold text-green-700">✅ Virements activés</p>
              <p className="text-xs text-gray-400">Compte : {info?.businessName || accountId}</p>
            </div>
            <div className="bg-or-pale border border-or/20 rounded-xl p-3 text-left">
              <p className="text-xs font-bold text-brun mb-1">Répartition automatique</p>
              <p className="text-xs text-gray-500">Quand un client paie, Stripe répartit instantanément :</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-brun font-semibold">Vous (boucher)</span><span className="text-green-600 font-bold">85% des produits</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Plateforme</span><span className="text-gray-400">15% commission</span></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Virement bancaire chaque lundi · Frais Stripe : 1,4% + 0,25€/transaction</p>
            </div>
            <button className="w-full bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
              onClick={() => router.push('/')}>
              Retour à l'accueil
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <span className="text-5xl block">⚠️</span>
            <h1 className="font-serif text-xl font-black text-brun">Vérification en attente</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Stripe vérifie encore vos informations. Cela peut prendre quelques heures. Vous recevrez un email de confirmation.
            </p>
            <div className="bg-or-pale border border-or/20 rounded-xl p-3 text-left space-y-1">
              <p className="text-xs text-gray-500">Paiements activés : {info?.chargesEnabled ? '✅' : '⏳'}</p>
              <p className="text-xs text-gray-500">Virements activés : {info?.payoutsEnabled ? '✅' : '⏳'}</p>
            </div>
            <button className="w-full bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
              onClick={() => router.push('/')}>
              Retour à l'accueil
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="text-5xl block">❌</span>
            <p className="font-serif text-lg font-bold text-brun">Une erreur est survenue</p>
            <p className="text-sm text-gray-400">Contactez-nous à boucheriesdelivery@gmail.com</p>
            <button className="w-full bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
              onClick={() => router.push('/')}>Retour</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConnectReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-creme flex items-center justify-center"><p className="text-brun">Chargement…</p></div>}>
      <ReturnContent />
    </Suspense>
  )
}
