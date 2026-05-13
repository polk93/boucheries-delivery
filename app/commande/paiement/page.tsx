'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePanier } from '@/store/panier'
import { CRENEAUX } from '@/lib/data'
import toast from 'react-hot-toast'

export default function PaiementPage() {
  const router = useRouter()
  const { items, sousTotal, creneau, setCreneau, clear } = usePanier()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [adresse, setAdresse] = useState({ prenom: '', nom: '', adresse: '', cp: '', ville: '', etage: '', interphone: '' })
  const [card, setCard] = useState({ numero: '4242 4242 4242 4242', expiry: '12/27', cvv: '123', titulaire: 'JEAN DUPONT' })

  const frais = items.length > 0 ? 2.90 : 0
  const total = sousTotal() + frais

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-brun font-semibold mb-4">Votre panier est vide</p>
          <button onClick={() => router.push('/')} className="bg-brun text-white px-6 py-3 rounded-xl font-bold font-sans">← Retour</button>
        </div>
      </div>
    )
  }

  async function simulatePay() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    const numero = '#' + Math.floor(1000 + Math.random() * 9000)
    clear()
    toast.success('🎉 Commande confirmée !')
    router.push(`/suivi?numero=${numero}`)
    setLoading(false)
  }

  const stepLabels = ['📋 Récap', '📍 Adresse', '📅 Créneau', '💳 Paiement']

  return (
    <div className="min-h-screen bg-creme pb-10">
      <div className="bg-brun px-5 py-4 flex items-center gap-3">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/')} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-xl font-bold text-or">Commande</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex max-w-lg mx-auto px-5 pt-5 mb-5">
        {stepLabels.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${i < step ? 'bg-green-100 border-green-400 text-green-600' : i === step ? 'bg-or-pale border-or text-brun' : 'bg-white border-gray-200 text-gray-300'}`}>
              {i < step ? '✓' : ['📋','📍','📅','💳'][i]}
            </div>
            <span className={`text-[10px] font-semibold text-center ${i === step ? 'text-brun' : 'text-gray-300'}`}>{s.split(' ')[1]}</span>
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-5">

        {/* Step 0 — Récap */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-brun mb-4">📋 Récapitulatif</h2>
            {items.map(item => (
              <div key={item.cart_key} className="flex justify-between py-3 border-b border-gris-bd">
                <div>
                  <p className="text-sm font-semibold text-brun">{item.icon} {item.nom} ×{item.quantite}</p>
                  {item.decoupe && <p className="text-[11px] text-or">✂️ {item.decoupe}{item.preparation ? ` · ${item.preparation}` : ''}</p>}
                  <p className="text-xs text-gray-400">{item.boucherie_nom}</p>
                </div>
                <span className="text-sm font-bold text-brun">{(item.prix * item.quantite).toFixed(2)} €</span>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t-2 border-brun space-y-1">
              <div className="flex justify-between text-xs text-gray-400"><span>Sous-total</span><span>{sousTotal().toFixed(2)} €</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>Livraison</span><span>{frais.toFixed(2)} €</span></div>
              <div className="flex justify-between text-base font-black text-brun pt-1"><span>Total</span><span className="text-rouge-vif">{total.toFixed(2)} €</span></div>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm mt-5 hover:bg-rouge-vif transition-colors font-sans">Continuer →</button>
          </div>
        )}

        {/* Step 1 — Adresse */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-bold text-brun">📍 Adresse de livraison</h2>
            <div className="grid grid-cols-2 gap-3">
              {[['prenom','Prénom','Jean'],['nom','Nom','Dupont']].map(([k,l,ph]) => (
                <div key={k}><label className="text-xs font-bold text-brun block mb-1">{l}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder={ph}
                    value={(adresse as any)[k]} onChange={e => setAdresse(a => ({ ...a, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <div><label className="text-xs font-bold text-brun block mb-1">Adresse</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder="12 rue de la Roquette"
                value={adresse.adresse} onChange={e => setAdresse(a => ({ ...a, adresse: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              {[['cp','Code postal','75011'],['ville','Ville','Paris']].map(([k,l,ph]) => (
                <div key={k}><label className="text-xs font-bold text-brun block mb-1">{l}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" placeholder={ph}
                    value={(adresse as any)[k]} onChange={e => setAdresse(a => ({ ...a, [k]: e.target.value }))} /></div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm hover:bg-rouge-vif transition-colors font-sans">Continuer →</button>
          </div>
        )}

        {/* Step 2 — Créneau */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-brun mb-4">📅 Créneau de livraison</h2>
            <div className="space-y-2 mb-5">
              {CRENEAUX.map(c => (
                <div key={c.value}
                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${creneau === c.value ? 'border-brun bg-brun text-white' : 'border-gray-200 text-gray-500 hover:border-brun'}`}
                  onClick={() => setCreneau(c.value)}>
                  {c.value === 'now' ? '⚡ ' : '🕐 '}{c.label}
                </div>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm hover:bg-rouge-vif transition-colors font-sans">Continuer →</button>
          </div>
        )}

        {/* Step 3 — Paiement simulé */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-brun mb-4">💳 Paiement sécurisé</h2>
              {/* Carte visuelle */}
              <div className="bg-gradient-to-br from-brun to-brun-clair rounded-2xl p-5 text-white mb-4">
                <div className="w-8 h-6 bg-or rounded mb-3" />
                <p className="text-lg font-bold tracking-widest mb-2">{card.numero}</p>
                <div className="flex justify-between text-xs opacity-80"><span>{card.titulaire}</span><span>{card.expiry}</span></div>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-bold text-brun block mb-1">Numéro de carte</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" value={card.numero} onChange={e => setCard(c => ({ ...c, numero: e.target.value }))} /></div>
                <div><label className="text-xs font-bold text-brun block mb-1">Titulaire</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" value={card.titulaire} onChange={e => setCard(c => ({ ...c, titulaire: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-brun block mb-1">Expiration</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} /></div>
                  <div><label className="text-xs font-bold text-brun block mb-1">CVV</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans" value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} /></div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">🔒 Paiement sécurisé · SSL 256 bits</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between text-sm">
              <span>🛵 {CRENEAUX.find(c => c.value === creneau)?.label}</span>
              <span className="font-black text-rouge-vif">{total.toFixed(2)} €</span>
            </div>

            <button onClick={simulatePay} disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-base transition-colors font-sans flex items-center justify-center gap-2">
              {loading ? '⏳ Traitement en cours…' : `🔒 Payer ${total.toFixed(2)} €`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
