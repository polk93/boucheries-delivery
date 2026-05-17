'use client'
import { useState } from 'react'

export default function TestShipdayPage() {
  const [result, setResult] = useState<string>('')
  const [status, setStatus] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  async function call(body: object) {
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/shipday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setStatus(res.status)
      setOk(res.ok)
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setOk(false)
      setResult(e.message)
    } finally {
      setLoading(false)
    }
  }

  function testCarriers() {
    call({ action: 'carriers' })
  }

  function testCreate() {
    call({
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
    })
  }

  return (
    <div className="min-h-screen bg-creme p-6 max-w-lg mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-black text-brun">Test Shipday</h1>

      <button
        onClick={testCarriers}
        disabled={loading}
        className="w-full bg-brun text-white py-3 rounded-xl font-bold font-sans disabled:bg-gray-300">
        {loading ? 'Chargement...' : '1. Tester connexion (livreurs)'}
      </button>

      <button
        onClick={testCreate}
        disabled={loading}
        className="w-full bg-or text-brun py-3 rounded-xl font-bold font-sans disabled:bg-gray-300">
        {loading ? 'Chargement...' : '2. Creer commande test'}
      </button>

      {result !== '' && (
        <div className={result && ok ? 'bg-green-50 border border-green-200 rounded-2xl p-4' : 'bg-red-50 border border-red-200 rounded-2xl p-4'}>
          <p className="font-bold text-sm mb-2">
            {ok ? 'OK' : 'Erreur'} - Status {status}
          </p>
          <pre className="text-xs overflow-auto whitespace-pre-wrap text-gray-600">{result}</pre>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">Page de test temporaire</p>
    </div>
  )
}
