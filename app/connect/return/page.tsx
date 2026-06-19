'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useBoucherStore } from '@/store/boucherStore'
import { useAuth } from '@/store/auth'

function ReturnContent() {
  const params    = useSearchParams()
  const router    = useRouter()
  const { user }  = useAuth()
  const boucherStore = useBoucherStore()

  const accountId = params.get('account')
  const type      = params.get('type') || 'boucher'
  const isBoucher = type === 'boucher'

  const [status, setStatus] = useState<'loading'|'ok'|'pending'|'error'>('loading')
  const [info,   setInfo]   = useState<any>(null)

  useEffect(() => {
    if (!accountId) { setStatus('error'); return }
    fetch(`/api/connect/onboard?accountId=${accountId}`)
      .then(r => r.json())
      .then(data => {
        setInfo(data)
        const ok = data.chargesEnabled && data.payoutsEnabled
        setStatus(ok ? 'ok' : 'pending')

        // Sauvegarder le compte Stripe dans le store
        if (isBoucher && user?.email) {
          boucherStore.setStripeAccount(user.email, {
            accountId,
            businessName: data.businessName || '',
            chargesEnabled: data.chargesEnabled || false,
            payoutsEnabled: data.payoutsEnabled || false,
            email: data.email || user.email,
            linkedAt: new Date().toISOString(),
          })
        }
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
            <h1 className="font-serif text-xl font-black text-brun">
              {isBoucher ? 'Compte Stripe activé !' : 'Compte livreur activé !'}
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              {isBoucher
                ? 'Vos paiements sont configurés. Vous recevrez votre part automatiquement chaque lundi.'
                : 'Votre compte est prêt. Vous recevrez vos courses et paiements dès validation.'}
            </p>
            <div className="bg-or-pale border border-or/20 rounded-xl p-3 text-left">
              <p className="text-xs font-bold text-brun mb-2">{isBoucher ? '💶 Répartition automatique' : '💶 Votre rémunération'}</p>
              {isBoucher ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-brun font-semibold">Vous (boucher)</span><span className="text-green-600 font-bold">85% des produits</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Commission plateforme</span><span className="text-gray-400">15%</span></div>
                  <div className="flex justify-between text-xs border-t border-gris-bd pt-1 mt-1"><span className="text-gray-400">Virement</span><span className="text-gray-400">Chaque lundi</span></div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-brun font-semibold">Frais de livraison</span><span className="text-green-600 font-bold">70%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-brun font-semibold">Pourboires</span><span className="text-green-600 font-bold">100%</span></div>
                  <div className="flex justify-between text-xs border-t border-gris-bd pt-1 mt-1"><span className="text-gray-400">Virement</span><span className="text-gray-400">Chaque lundi</span></div>
                </div>
              )}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-left space-y-1">
              <p className="text-xs font-bold text-green-700">✅ Paiements activés</p>
              <p className="text-xs font-bold text-green-700">✅ Virements activés</p>
              <p className="text-xs text-gray-400">{info?.businessName || info?.email || accountId}</p>
            </div>
            <button className="w-full bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
              onClick={() => router.push(isBoucher ? '/panel' : '/')}>
              {isBoucher ? 'Accéder à mon espace →' : "Retour à l'accueil →"}
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <span className="text-5xl block">⚠️</span>
            <h1 className="font-serif text-xl font-black text-brun">Vérification en cours</h1>
            <p className="text-sm text-gray-400 leading-relaxed">Stripe vérifie vos informations. Email de confirmation sous 24–48h.</p>
            <div className="bg-or-pale border border-or/20 rounded-xl p-3 text-left space-y-1">
              <p className="text-xs text-gray-500">Paiements : {info?.chargesEnabled ? '✅' : '⏳'}</p>
              <p className="text-xs text-gray-500">Virements  : {info?.payoutsEnabled ? '✅' : '⏳'}</p>
            </div>
            <button className="w-full bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans" onClick={() => router.push('/')}>Retour</button>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="text-5xl block">❌</span>
            <p className="font-serif text-lg font-bold text-brun">Une erreur est survenue</p>
            <p className="text-sm text-gray-400">Contactez-nous : contact@coteacote.fr</p>
            <button className="w-full bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans" onClick={() => router.push('/')}>Retour</button>
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
