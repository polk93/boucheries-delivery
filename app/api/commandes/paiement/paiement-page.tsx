'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { usePanier } from '@/store/panier'
import { CRENEAUX } from '@/lib/data'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Formulaire Stripe ────────────────────────────────────────
function CheckoutForm({ total, onSuccess }: { total: number; onSuccess: (id: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/commande/confirmation` },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Erreur de paiement')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div className="bg-rouge-pale text-rouge-vif text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-base transition-colors font-sans flex items-center justify-center gap-2"
      >
        {loading ? '⏳ Traitement…' : `🔒 Payer ${total.toFixed(2)} €`}
      </button>
      <p className="text-center text-xs text-gray-400">🔒 Paiement sécurisé par Stripe · SSL 256 bits</p>
    </form>
  )
}

// ── Page principale ──────────────────────────────────────────
export default function PaiementPage() {
  const router = useRouter()
  const { items, sousTotal, creneau, setCreneau, clear } = usePanier()
  const [step, setStep] = useState(0) // 0=récap 1=adresse 2=créneau 3=paiement
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [commandeId, setCommandeId] = useState<string | null>(null)
  const [numero, setNumero] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [adresse, setAdresse] = useState({ prenom: '', nom: '', adresse: '', cp: '', ville: '', etage: '', interphone: '' })

  const frais = items.length > 0 ? 2.90 : 0
  const total = sousTotal() + frais

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-brun font-semibold mb-4">Votre panier est vide</p>
          <button onClick={() => router.push('/')} className="bg-brun text-white px-6 py-3 rounded-xl font-bold">
            ← Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  async function createCommande() {
    setLoading(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user', // Remplacer par l'ID Supabase Auth
          boucherie_id: items[0].boucherie_id,
          lignes: items.map(i => ({
            produit_id: i.produit_id,
            nom: i.nom,
            prix: i.prix,
            quantite: i.quantite,
            decoupe: i.decoupe,
            preparation: i.preparation,
            note_boucher: i.note_boucher,
          })),
          frais_livraison: frais,
          creneau_type: creneau === 'now' ? 'maintenant' : 'programme',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClientSecret(data.client_secret)
      setCommandeId(data.commande_id)
      setNumero(data.numero)
      setStep(3)
    } catch (err: any) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  function handlePaySuccess() {
    clear()
    router.push(`/suivi/${commandeId}?numero=${numero}`)
  }

  return (
    <div className="min-h-screen bg-creme pb-10">
      {/* Header */}
      <div className="bg-brun px-5 py-4 flex items-center gap-4">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/')} className="text-white text-xl bg-none border-none cursor-pointer">←</button>
        <h1 className="font-serif text-xl font-bold text-or">Commande</h1>
      </div>

      {/* Steps */}
      <div className="flex max-w-lg mx-auto px-5 pt-6 mb-6 gap-0">
        {['Récap','Adresse','Créneau','Paiement'].map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1 relative">
            {i < 3 && <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm z-10 transition-all ${i < step ? 'bg-green-100 border-green-500 text-green-600' : i === step ? 'bg-or-pale border-or text-brun' : 'bg-white border-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : ['📋','📍','📅','💳'][i]}
            </div>
            <span className={`text-[11px] font-semibold ${i === step ? 'text-brun' : 'text-gray-400'}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-5">

        {/* Step 0 — Récap */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-brun mb-4">📋 Récapitulatif</h2>
            {items.map(item => (
              <div key={item.cart_key} className="flex justify-between items-start py-3 border-b border-gris-bd">
                <div>
                  <p className="text-sm font-semibold text-brun">{item.icon} {item.nom} ×{item.quantite}</p>
                  {item.decoupe && <p className="text-[11px] text-or font-semibold">✂️ {item.decoupe}{item.preparation ? ` · ${item.preparation}` : ''}</p>}
                  <p className="text-xs text-gray-400">{item.boucherie_nom}</p>
                </div>
                <span className="text-sm font-bold text-brun">{(item.prix * item.quantite).toFixed(2)} €</span>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t-2 border-brun">
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Sous-total</span><span>{sousTotal().toFixed(2)} €</span></div>
              <div className="flex justify-between text-xs text-gray-400 mb-2"><span>Livraison</span><span>{frais.toFixed(2)} €</span></div>
              <div className="flex justify-between text-base font-black text-brun"><span>Total</span><span className="text-rouge-vif">{total.toFixed(2)} €</span></div>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm mt-5 hover:bg-rouge-vif transition-colors font-sans">
              Continuer →
            </button>
          </div>
        )}

        {/* Step 1 — Adresse */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-brun mb-4">📍 Adresse de livraison</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs font-bold text-brun block mb-1">Prénom</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="Jean" value={adresse.prenom} onChange={e => setAdresse(a => ({ ...a, prenom: e.target.value }))} /></div>
              <div><label className="text-xs font-bold text-brun block mb-1">Nom</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="Dupont" value={adresse.nom} onChange={e => setAdresse(a => ({ ...a, nom: e.target.value }))} /></div>
            </div>
            <div className="mb-3"><label className="text-xs font-bold text-brun block mb-1">Adresse</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="12 rue de la Roquette" value={adresse.adresse} onChange={e => setAdresse(a => ({ ...a, adresse: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs font-bold text-brun block mb-1">Code postal</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="75011" value={adresse.cp} onChange={e => setAdresse(a => ({ ...a, cp: e.target.value }))} /></div>
              <div><label className="text-xs font-bold text-brun block mb-1">Ville</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="Paris" value={adresse.ville} onChange={e => setAdresse(a => ({ ...a, ville: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div><label className="text-xs font-bold text-brun block mb-1">Étage / Bât.</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="3e étage" value={adresse.etage} onChange={e => setAdresse(a => ({ ...a, etage: e.target.value }))} /></div>
              <div><label className="text-xs font-bold text-brun block mb-1">Interphone</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="DUPONT" value={adresse.interphone} onChange={e => setAdresse(a => ({ ...a, interphone: e.target.value }))} /></div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm hover:bg-rouge-vif transition-colors font-sans">Continuer →</button>
          </div>
        )}

        {/* Step 2 — Créneau */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-brun mb-4">📅 Créneau de livraison</h2>
            <div className="grid grid-cols-1 gap-2 mb-5">
              {CRENEAUX.map(c => (
                <div key={c.value}
                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${creneau === c.value ? 'border-brun bg-brun text-white' : 'border-gray-200 text-gray-500 hover:border-brun'}`}
                  onClick={() => setCreneau(c.value)}>
                  {c.value === 'now' ? '⚡ ' : '🕐 '}{c.label}
                </div>
              ))}
            </div>
            <div className="bg-or-pale rounded-xl p-3 text-xs text-brun-clair mb-5">
              💡 La livraison programmée vous permet de recevoir votre commande au moment idéal, avec la même fraîcheur garantie.
            </div>
            <button onClick={createCommande} disabled={loading}
              className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm hover:bg-rouge-vif transition-colors font-sans disabled:bg-gray-300">
              {loading ? '⏳ Création de la commande…' : 'Continuer →'}
            </button>
          </div>
        )}

        {/* Step 3 — Paiement Stripe */}
        {step === 3 && clientSecret && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-brun mb-2">💳 Paiement sécurisé</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex justify-between text-sm">
              <span>🛵 {CRENEAUX.find(c => c.value === creneau)?.label}</span>
              <span className="font-black text-rouge-vif">{total.toFixed(2)} €</span>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3D2012',
                    colorBackground: '#FAF7F2',
                    colorText: '#1A0A00',
                    colorDanger: '#C0392B',
                    fontFamily: 'DM Sans, sans-serif',
                    borderRadius: '9px',
                  },
                },
                locale: 'fr',
              }}
            >
              <CheckoutForm total={total} onSuccess={handlePaySuccess} />
            </Elements>
            <p className="text-center text-xs text-gray-300 mt-3">
              Carte test : 4242 4242 4242 4242 · 12/27 · 123
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
