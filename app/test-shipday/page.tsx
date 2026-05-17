'use client'
import { useState } from 'react'

export default function TestShipdayPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function testCarriers() {
    setLoading(true)
    try {
      const res = await fetch('/api/shipday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'carriers' }),
      })
      const data = await res.json()
      setResult({ test: 'Livreurs disponibles', status: res.status, data })
    } catch (e: any) {
      setResult({ error: e.message })
    } finally { setLoading(false) }
  }

  async function testOrderStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/shipday?debug=1')
      const data = await res.json()
      setResult({ test: 'Commandes actives', status: res.status, data })
    } catch (e: any) {
      setResult({ error: e.message })
    } finally { setLoading(false) }
  }
    setLoading(true)
    try {
      const res = await fetch('/api/shipday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          numeroCommande: '#TEST-001',
          nomClient: 'Jean Dupont',
          telClient: '0600000000',
          adresseClient: '1 rue de Rivoli, 75001 Paris',
          nomBoucherie: 'Maison Dupont',
          adresseBoucherie: '12 rue de la Roquette, 75011 Paris',
          telBoucherie: '0123456789',
          montantTotal: 25.90,
          pourboire: 2,
          heurePickup: '14:30',
          items: [{ nom: 'Entrecôte Charolais', qty: 1, prix: 18.90 }],
        }),
      })
      const data = await res.json()
      setResult({ test: 'Création commande test', status: res.status, data })
    } catch (e: any) {
      setResult({ error: e.message })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-creme p-6 max-w-lg mx-auto">
      <h1 className="font-serif text-2xl font-black text-brun mb-6">🛵 Test Shipday</h1>

      <div className="space-y-3 mb-6">
        <button onClick={testCarriers} disabled={loading}
          className="w-full bg-brun text-white py-3 rounded-xl font-bold font-sans disabled:bg-gray-300">
          {loading ? '⏳' : '1. Tester la connexion (livreurs)'}
        </button>
        <button onClick={testOrderStatus} disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold font-sans disabled:bg-gray-300">
          {loading ? '⏳' : '3. Voir commandes actives (debug)'}
        </button>
        <button onClick={testOrder} disabled={loading}
          className="w-full bg-or text-brun py-3 rounded-xl font-bold font-sans disabled:bg-gray-300">
          {loading ? '⏳' : '2. Créer une commande test'}
        </button>
      </div>

      {result && (
        <div className={`rounded-2xl p-4 ${result.error || result.status >= 400 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="font-bold text-sm mb-2">
            {result.error || result.status >= 400 ? '❌ Erreur' : '✅ Succès'} · Status {result.status}
          </p>
          <pre className="text-xs overflow-auto whitespace-pre-wrap text-gray-600">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Page de test temporaire · Supprimez après vérification
      </p>
    </div>
  )
}
