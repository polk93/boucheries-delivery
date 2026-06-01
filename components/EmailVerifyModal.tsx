'use client'
import { useState } from 'react'

interface EmailVerifyProps {
  email: string
  onVerified: () => void
  onCancel: () => void
}

export default function EmailVerifyModal({ email, onVerified, onCancel }: EmailVerifyProps) {
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function envoyer() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/email-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setSent(true)
      else setError('Erreur envoi email')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  async function verifier() {
    if (code.length !== 6) { setError('Code à 6 chiffres'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/email-verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (data.verified) onVerified()
      else setError(data.error || 'Code incorrect')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4">
        <div className="text-center">
          <span className="text-4xl block mb-2">📧</span>
          <h2 className="font-serif text-lg font-black text-brun">Vérifiez votre email</h2>
          <p className="text-xs text-gray-400 mt-1">Nous devons vérifier <strong>{email}</strong></p>
        </div>

        {!sent ? (
          <>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Un code à 6 chiffres sera envoyé à cette adresse pour confirmer votre identité.
            </p>
            <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans"
              onClick={envoyer} disabled={loading}>
              {loading ? '⏳ Envoi…' : '📧 Envoyer le code'}
            </button>
            <button className="w-full text-gray-400 text-sm font-sans" onClick={onCancel}>Annuler</button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center">Code envoyé ! Vérifiez votre boîte mail.</p>
            <div>
              <input
                className="w-full border-2 border-brun rounded-xl px-3 py-3 text-2xl font-mono text-center outline-none tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
              />
              {error && <p className="text-xs text-rouge-vif mt-1 text-center">{error}</p>}
            </div>
            <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans"
              onClick={verifier} disabled={loading || code.length !== 6}>
              {loading ? '⏳ Vérification…' : '✅ Confirmer'}
            </button>
            <button className="w-full text-xs text-or font-semibold font-sans" onClick={envoyer}>
              Renvoyer le code
            </button>
          </>
        )}
      </div>
    </div>
  )
}
