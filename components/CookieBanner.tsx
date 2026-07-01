'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'

function getBrowserConsent(): string | null {
  const match = document.cookie.split(';').find(c => c.trim().startsWith('cookie_consent='))
  return match ? match.trim().split('=')[1] : null
}

function setBrowserConsent(value: 'accepted' | 'refused') {
  const expires = new Date()
  expires.setMonth(expires.getMonth() + 13) // 13 mois max (CNIL)
  document.cookie = `cookie_consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

export default function CookieBanner() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Cookie navigateur présent → déjà consenti (anonyme ou connecté)
    if (getBrowserConsent()) { setVisible(false); return }

    // Démo : pas de bannière
    if (user?.isDemo) { setVisible(false); return }

    // Anonyme sans cookie → montrer la bannière
    if (!user?.email) { setVisible(true); return }

    // Connecté : vérifier Supabase
    fetch(`/api/clients?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => { if (!data?.cookie_consent) setVisible(true) })
      .catch(() => setVisible(true))
  }, [user?.email, user?.isDemo])

  async function handleChoice(choice: 'accepted' | 'refused') {
    setSaving(true)

    // Toujours persister dans le cookie navigateur (fonctionne pour anonymes et connectés)
    setBrowserConsent(choice)

    // Synchroniser dans Supabase si connecté
    if (user?.email && !user.isDemo) {
      try {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            cookie_consent: choice,
            cookie_consent_date: new Date().toISOString(),
          }),
        })
      } catch {
        // Cookie navigateur suffit
      }
    }

    setVisible(false)
    setSaving(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <div className="max-w-2xl mx-auto bg-brun text-white rounded-2xl shadow-modal p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0">🍪</span>
          <div>
            <p className="font-serif font-bold text-sm text-or">Gestion des cookies</p>
            <p className="text-xs text-white/70 leading-relaxed mt-0.5">
              Nous utilisons des cookies nécessaires au bon fonctionnement du service et, avec votre accord, des cookies d'analyse pour améliorer votre expérience.
            </p>
          </div>
        </div>

        {/* Boutons équiprobables — exigence CNIL */}
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={saving}
            onClick={() => handleChoice('refused')}
            className="py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors disabled:opacity-50"
          >
            Tout refuser
          </button>
          <button
            disabled={saving}
            onClick={() => handleChoice('accepted')}
            className="py-2.5 rounded-xl text-xs font-bold bg-or text-brun hover:bg-or/90 transition-colors disabled:opacity-50"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  )
}
