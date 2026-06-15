'use client'
import { useState, useRef } from 'react'

interface EmailVerifyProps {
  email: string
  onVerified: () => void
  onCancel: () => void
}

// Génère un code 6 chiffres
function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export default function EmailVerifyModal({ email, onVerified, onCancel }: EmailVerifyProps) {
  const [code, setCode]       = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const expectedCode          = useRef('')
  const expiresAt             = useRef(0)

  async function envoyer() {
    setLoading(true); setError('')
    try {
      // Générer et stocker le code côté client
      const newCode = genCode()
      expectedCode.current = newCode
      expiresAt.current    = Date.now() + 10 * 60 * 1000 // 10 min

      // Envoyer via EmailJS directement depuis le navigateur
      const { default: emailjs } = await import('@emailjs/browser')
      await emailjs.send(
        'service_uq712ai',
        'template_ycddlce',
        {
          to_email: email,
          name:     email,
          email:    email,
          subject:  `Code de vérification BoucheriesDelivery : ${newCode}`,
          message:  `Votre code de vérification est : ${newCode}\n\nCe code expire dans 10 minutes.\n\nSi vous n'avez pas demandé ce code, ignorez cet email.`,
        },
        'LbqBSABkR-S5wg9PR'
      )
      setSent(true)
    } catch (e: any) {
      setError('Erreur envoi email — ' + (e?.text || e?.message || 'réessayez'))
    } finally {
      setLoading(false)
    }
  }

  function verifier() {
    if (code.length !== 6) { setError('Entrez le code à 6 chiffres'); return }
    if (Date.now() > expiresAt.current) { setError('Code expiré — demandez-en un nouveau'); return }
    if (code !== expectedCode.current)  { setError('Code incorrect — vérifiez votre email'); return }
    onVerified()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl space-y-4">
        <div className="text-center">
          <span className="text-4xl block mb-2">📧</span>
          <h2 className="font-serif text-lg font-black text-brun">Vérifiez votre email</h2>
          <p className="text-base text-gray-400 mt-1">Nous devons vérifier <strong>{email}</strong></p>
        </div>

        {!sent ? (
          <>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Un code à 6 chiffres sera envoyé à cette adresse pour confirmer votre identité.
            </p>
            <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans"
              onClick={envoyer} disabled={loading}>
              {loading ? '⏳ Envoi en cours…' : '📧 Envoyer le code'}
            </button>
            <button className="w-full text-gray-400 text-sm font-sans" onClick={onCancel}>Annuler</button>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-sm text-green-700 font-semibold">✅ Code envoyé à {email}</p>
              <p className="text-base text-green-600 mt-0.5">Vérifiez votre boîte mail (et vos spams)</p>
            </div>
            <div>
              <input
                className="w-full border-2 border-brun rounded-xl px-3 py-3 text-2xl font-mono text-center outline-none tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={e => e.key === 'Enter' && verifier()}
              />
              {error && <p className="text-base text-rouge-vif mt-1.5 text-center font-semibold">{error}</p>}
            </div>
            <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans disabled:bg-gray-300"
              onClick={verifier} disabled={loading || code.length !== 6}>
              {loading ? '⏳ Vérification…' : '✅ Confirmer'}
            </button>
            <button className="w-full text-base text-or font-semibold font-sans" onClick={envoyer} disabled={loading}>
              🔄 Renvoyer le code
            </button>
          </>
        )}
      </div>
    </div>
  )
}

