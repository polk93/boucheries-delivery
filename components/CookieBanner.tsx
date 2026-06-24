'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ConsentChoice = 'accepted' | 'refused' | null

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent') as ConsentChoice
    if (!stored) setVisible(true)
  }, [])

  function handleChoice(choice: 'accepted' | 'refused') {
    setSaving(true)
    localStorage.setItem('cookie_consent', choice)
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
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
        {/* Header */}
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0">🍪</span>
          <div>
            <p className="font-serif font-bold text-sm text-or">Gestion des cookies</p>
            <p className="text-xs text-white/70 leading-relaxed mt-0.5">
              Nous utilisons des cookies nécessaires au bon fonctionnement de notre service et, avec votre accord, des cookies d'analyse d'audience pour améliorer votre expérience.
            </p>
          </div>
        </div>

        {/* Link to policy */}
        <Link
          href="/politique-cookies"
          className="text-[11px] text-or/80 underline underline-offset-2 hover:text-or transition-colors"
        >
          En savoir plus sur nos cookies →
        </Link>

        {/* Buttons — equally prominent (CNIL requirement) */}
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
