'use client'
import { useState } from 'react'

interface PromoResult {
  valid: boolean
  code: string
  reduction: number
  type: 'percent' | 'fixed'
  valeur: number
  description: string
}

interface PromoInputProps {
  montant: number
  onApply: (promo: PromoResult) => void
  onRemove: () => void
  appliedPromo: PromoResult | null
}

export default function PromoInput({ montant, onApply, onRemove, appliedPromo }: PromoInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function appliquer() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), montant }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setError(data.error || 'Code invalide')
        return
      }
      onApply(data)
      setCode('')
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  if (appliedPromo) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-green-700">🏷️ {appliedPromo.code}</p>
        <p className="text-xs text-green-600">{appliedPromo.description}</p>
        <p className="text-sm font-black text-green-700">-{appliedPromo.reduction.toFixed(2)} €</p>
      </div>
      <button className="text-gray-400 text-lg font-bold" onClick={onRemove}>✕</button>
    </div>
  )

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun uppercase"
          placeholder="Code promo"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
          onKeyDown={e => e.key === 'Enter' && appliquer()}
        />
        <button
          className="bg-brun text-white px-4 py-2.5 rounded-xl text-sm font-bold font-sans disabled:bg-gray-300 flex-shrink-0"
          onClick={appliquer}
          disabled={loading || !code.trim()}>
          {loading ? '⏳' : 'Appliquer'}
        </button>
      </div>
      {error && <p className="text-xs text-rouge-vif font-semibold">{error}</p>}
    </div>
  )
}
