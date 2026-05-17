'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function RefreshContent() {
  const params = useSearchParams()
  const accountId = params.get('account')

  useEffect(() => {
    if (!accountId) return
    // Regénérer un lien d'onboarding frais
    fetch('/api/connect/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, refresh: true }),
    })
      .then(r => r.json())
      .then(d => { if (d.onboardingUrl) window.location.href = d.onboardingUrl })
  }, [accountId])

  return (
    <div className="min-h-screen bg-creme flex items-center justify-center">
      <div className="text-center">
        <p className="text-brun font-semibold text-lg">⏳ Rechargement du formulaire Stripe…</p>
        <p className="text-gray-400 text-sm mt-2">Vous allez être redirigé automatiquement.</p>
      </div>
    </div>
  )
}

export default function ConnectRefreshPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-creme flex items-center justify-center"><p>Chargement…</p></div>}>
      <RefreshContent />
    </Suspense>
  )
}
