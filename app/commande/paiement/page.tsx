'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePanier, type PanierItem } from '@/store/panier'
import { CRENEAUX, BOUCHERIES } from '@/lib/data'
import toast from 'react-hot-toast'

// ── Tarification livraison par km (calée sur le marché 2026) ─────────────────
// Base : 2,50 € fixe + 0,80 €/km (légèrement au-dessus d'Uber Eats pour compenser
// la spécificité boucherie artisanale et la chaîne du froid)
const TARIF_BASE   = 2.50   // € fixe par commande
const TARIF_KM     = 0.80   // €/km
const TARIF_MIN    = 2.90   // minimum perçu
const TARIF_MAX    = 8.90   // plafond (>8km → dégressif)

function calculerFrais(km: number): number {
  if (km === 0) return TARIF_MIN
  const calcule = TARIF_BASE + km * TARIF_KM
  return Math.min(Math.max(calcule, TARIF_MIN), TARIF_MAX)
}

// Rémunération livreur (70% des frais de livraison + 100% du pourboire)
function remunerationLivreur(frais: number, pourboire: number): number {
  return frais * 0.70 + pourboire
}

// ── Créneaux click & collect ──────────────────────────────────────────────────
const CRENEAUX_CC = [
  { label: 'Dès que possible (~20 min)', value: 'cc-now'      },
  { label: "Aujourd'hui 12h–13h",        value: 'cc-today-12' },
  { label: "Aujourd'hui 18h–19h",        value: 'cc-today-18' },
  { label: "Aujourd'hui 19h–20h",        value: 'cc-today-19' },
  { label: 'Demain 9h–10h',              value: 'cc-tom-9'    },
  { label: 'Demain 12h–13h',             value: 'cc-tom-12'   },
]

// ── Distances simulées par boucherie (en production : calcul GPS réel) ────────
const DISTANCES_DEMO: Record<number, number> = {
  1: 1.2, 2: 3.5, 3: 0.8, 4: 5.2, 5: 7.1, 6: 2.3
}

// ── Pourboires suggérés ───────────────────────────────────────────────────────
const POURBOIRES = [
  { label: 'Aucun', val: 0 },
  { label: '1 €',   val: 1 },
  { label: '2 €',   val: 2 },
  { label: '3 €',   val: 3 },
  { label: '5 €',   val: 5 },
]

// ── Modal modification article ────────────────────────────────────────────────
function EditRecapModal({ item, onClose }: { item: PanierItem; onClose: () => void }) {
  const { updateItem, removeItem } = usePanier()
  const boucherie = BOUCHERIES.find(b => b.id === item.boucherie_id)
  const produit   = boucherie?.produits.find(p => p.id === item.produit_id)
  const [decoupe,     setDecoupe]     = useState(item.decoupe || '')
  const [preparation, setPreparation] = useState(item.preparation || '')
  const [note,        setNote]        = useState(item.note_boucher || '')
  const [quantite,    setQuantite]    = useState(item.quantite)

  function save() {
    if (quantite === 0) { removeItem(item.cart_key); onClose(); return }
    updateItem(item.cart_key, { decoupe, preparation, note_boucher: note || undefined, quantite })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[300] flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white">
          <div>
            <h3 className="font-serif text-base font-black text-brun">{item.icon} {item.nom}</h3>
            <p className="text-xs text-gray-400">{item.prix.toFixed(2)} € / unité</p>
          </div>
          <button className="bg-gris-bd rounded-full w-8 h-8 text-sm flex items-center justify-center" onClick={onClose}>✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-brun mb-2">Quantité</p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full border-2 border-rouge-vif text-rouge-vif text-xl font-bold flex items-center justify-center"
                onClick={() => setQuantite(q => Math.max(0, q - 1))}>−</button>
              <span className="text-xl font-black text-brun w-8 text-center">{quantite}</span>
              <button className="w-10 h-10 rounded-full border-2 border-brun text-brun text-xl font-bold flex items-center justify-center"
                onClick={() => setQuantite(q => q + 1)}>+</button>
              {quantite === 0 && <span className="text-xs text-rouge-vif font-semibold">→ Sera supprimé</span>}
            </div>
          </div>
          {produit?.decoupes && produit.decoupes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-brun mb-2">✂️ Découpe</p>
              <div className="flex flex-wrap gap-2">
                {produit.decoupes.map(d => (
                  <button key={d} className={`px-3 py-1.5 rounded-full border text-xs font-semibold font-sans ${decoupe === d ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                    onClick={() => setDecoupe(d)}>{d}</button>
                ))}
              </div>
            </div>
          )}
          {produit?.preparation && produit.preparation.length > 0 && (
            <div>
              <p className="text-xs font-bold text-brun mb-2">🌿 Préparation</p>
              <div className="flex flex-wrap gap-2">
                {produit.preparation.map(pr => (
                  <button key={pr} className={`px-3 py-1.5 rounded-full border text-xs font-semibold font-sans ${preparation === pr ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                    onClick={() => setPreparation(pr)}>{pr}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-brun mb-2">📝 Note boucher</p>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans outline-none focus:border-brun resize-none"
              rows={2} value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="bg-creme rounded-xl p-3 flex justify-between">
            <span className="text-sm text-gray-500">{quantite} × {item.prix.toFixed(2)} €</span>
            <span className="font-black text-rouge-vif">{(item.prix * quantite).toFixed(2)} €</span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-red-50 text-red-400 border border-red-200 rounded-xl py-3 text-sm font-semibold font-sans"
              onClick={() => { removeItem(item.cart_key); onClose() }}>🗑️ Supprimer</button>
            <button className="flex-[2] bg-brun text-white rounded-xl py-3 text-sm font-bold font-sans" onClick={save}>✅ Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function PaiementPage() {
  const router = useRouter()
  const { items, sousTotal, creneau, setCreneau, clear } = usePanier()

  const [mode,       setMode]       = useState<'livraison' | 'click_collect' | null>(null)
  const [step,       setStep]       = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [editItem,   setEditItem]   = useState<PanierItem | null>(null)
  const [adresse,    setAdresse]    = useState({ prenom:'', nom:'', adresse:'', cp:'', ville:'' })
  const [card,       setCard]       = useState({ numero:'', expiry:'', cvv:'', titulaire:'' })
  const [creneauCC,  setCreneauCC]  = useState(CRENEAUX_CC[0].value)
  const [pourboire,  setPourboire]  = useState(0)
  const [pourboireCustom, setPourboireCustom] = useState('')

  const boucherie = BOUCHERIES.find(b => b.id === items[0]?.boucherie_id)
  const distanceKm = boucherie ? (DISTANCES_DEMO[boucherie.id] || 2.5) : 2.5
  const frais  = mode === 'click_collect' ? 0 : calculerFrais(distanceKm)
  const pourboireVal = pourboireCustom ? parseFloat(pourboireCustom) || 0 : pourboire
  const total  = sousTotal() + frais + pourboireVal

  const stepLabels = mode === 'click_collect'
    ? ['📋 Récap', '📅 Retrait', '💳 Paiement']
    : ['📋 Récap', '📍 Adresse', '📅 Créneau', '💳 Paiement']
  const stepIcons = mode === 'click_collect' ? ['📋','📅','💳'] : ['📋','📍','📅','💳']

  if (items.length === 0) return (
    <div className="min-h-screen bg-creme flex items-center justify-center">
      <div className="text-center px-6">
        <span className="text-6xl block mb-4">🛒</span>
        <p className="text-brun font-semibold mb-4">Votre panier est vide</p>
        <button onClick={() => router.push('/')} className="bg-brun text-white px-6 py-3 rounded-xl font-bold font-sans">← Retour</button>
      </div>
    </div>
  )

  async function simulatePay() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    const numero = '#' + Math.floor(1000 + Math.random() * 9000)
    clear()
    toast.success('🎉 Commande confirmée !')
    router.push(`/suivi?numero=${numero}`)
    setLoading(false)
  }

  function goBack() {
    if (step === 0 && mode !== null) { setMode(null); return }
    if (step > 0) { setStep(s => s - 1); return }
    router.push('/')
  }

  // ── Écran choix mode ───────────────────────────────────────────────────────
  if (mode === null) return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 40 }}>
      <div className="bg-brun px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-lg font-bold text-or">Finaliser ma commande</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Résumé panier */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Votre commande</p>
          {items.map(item => (
            <div key={item.cart_key} className="flex justify-between items-center py-2 border-b border-gris-bd last:border-0">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-brun">{item.nom} ×{item.quantite}</p>
                  {item.decoupe && <p className="text-[11px] text-or">✂️ {item.decoupe}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brun">{(item.prix * item.quantite).toFixed(2)} €</span>
                <button className="text-gray-400 text-xs" onClick={() => setEditItem(item)}>✏️</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-sm font-black text-brun mt-3 pt-2 border-t-2 border-brun">
            <span>Sous-total</span><span>{sousTotal().toFixed(2)} €</span>
          </div>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Comment récupérer votre commande ?</p>

        {/* Livraison */}
        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-brun transition-all text-left"
          onClick={() => setMode('livraison')}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brun flex items-center justify-center text-2xl flex-shrink-0">🛵</div>
            <div className="flex-1">
              <p className="font-serif text-base font-black text-brun">Livraison à domicile</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Livré chez vous en moins de 45 min, chaîne du froid garantie.</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-bold text-rouge-vif bg-rouge-pale px-2 py-0.5 rounded-full">
                  {calculerFrais(distanceKm).toFixed(2)} €
                </span>
                <span className="text-xs text-gray-400">📍 {distanceKm.toFixed(1)} km · {TARIF_KM} €/km</span>
                <span className="text-xs text-gray-400">🕐 25–45 min</span>
              </div>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </div>
        </button>

        {/* Click & Collect */}
        <button className="w-full bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-brun transition-all text-left"
          onClick={() => setMode('click_collect')}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-or flex items-center justify-center text-2xl flex-shrink-0">🏪</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-serif text-base font-black text-brun">Click & Collect</p>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">GRATUIT</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Commandez, récupérez en boutique. Prêt en 20 min.</p>
              {boucherie && <p className="text-xs text-or font-semibold mt-1">📍 {boucherie.nom}</p>}
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </div>
        </button>

        {/* Info tarification km */}
        <div className="bg-or-pale border border-or/20 rounded-xl p-3">
          <p className="text-xs font-bold text-brun mb-1.5">💡 Tarification livraison</p>
          <div className="space-y-1">
            {[
              ['< 1 km', calculerFrais(0.8).toFixed(2) + ' €'],
              ['1–2 km', calculerFrais(1.5).toFixed(2) + ' €'],
              ['2–4 km', calculerFrais(3).toFixed(2) + ' €'],
              ['4–6 km', calculerFrais(5).toFixed(2) + ' €'],
              ['> 6 km', calculerFrais(8).toFixed(2) + ' € max'],
            ].map(([d, p]) => (
              <div key={d} className="flex justify-between text-xs text-brun-clair">
                <span>{d}</span><span className="font-bold">{p}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Base {TARIF_BASE} € + {TARIF_KM} €/km · Plafonné à {TARIF_MAX} €</p>
        </div>
      </div>

      {editItem && <EditRecapModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  )

  // ── Tunnel ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 40 }}>
      <div className="bg-brun px-4 py-4 flex items-center gap-3">
        <button onClick={goBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-lg font-bold text-or">
          {mode === 'click_collect' ? '🏪 Click & Collect' : '🛵 Livraison'}
        </h1>
      </div>

      {/* Badge info */}
      <div className={`px-4 py-2 text-center text-xs font-bold ${mode === 'click_collect' ? 'bg-green-50 text-green-700' : 'bg-or-pale text-brun-clair'}`}>
        {mode === 'click_collect'
          ? '🏪 Retrait en boutique — Livraison offerte'
          : `🛵 Livraison ${distanceKm.toFixed(1)} km — ${frais.toFixed(2)} €`}
      </div>

      {/* Steps */}
      <div className="flex max-w-lg mx-auto px-4 pt-4 mb-4">
        {stepLabels.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${i < step ? 'bg-green-100 border-green-400 text-green-600' : i === step ? 'bg-or-pale border-or text-brun' : 'bg-white border-gray-200 text-gray-300'}`}>
              {i < step ? '✓' : stepIcons[i]}
            </div>
            <span className={`text-[10px] font-semibold text-center ${i === step ? 'text-brun' : 'text-gray-300'}`}>{s.split(' ')[1]}</span>
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">

        {/* ── Step 0 : Récap ── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-serif text-base font-bold text-brun mb-3">📋 Récapitulatif</h2>
            {items.map(item => (
              <div key={item.cart_key} className="flex justify-between items-start py-2.5 border-b border-gris-bd">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brun">{item.icon} {item.nom} ×{item.quantite}</p>
                  {item.decoupe && <p className="text-[11px] text-or">✂️ {item.decoupe}{item.preparation ? ` · ${item.preparation}` : ''}</p>}
                  <p className="text-xs text-gray-400">{item.boucherie_nom}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-brun">{(item.prix * item.quantite).toFixed(2)} €</span>
                  <button className="text-gray-300 text-xs" onClick={() => setEditItem(item)}>✏️</button>
                </div>
              </div>
            ))}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400"><span>Sous-total</span><span>{sousTotal().toFixed(2)} €</span></div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Livraison{mode === 'livraison' ? ` (${distanceKm.toFixed(1)} km)` : ''}</span>
                <span className={frais === 0 ? 'text-green-600 font-bold' : ''}>{frais === 0 ? 'Offerte ✓' : `${frais.toFixed(2)} €`}</span>
              </div>
              {pourboireVal > 0 && (
                <div className="flex justify-between text-xs text-gray-400"><span>Pourboire livreur 🙏</span><span>{pourboireVal.toFixed(2)} €</span></div>
              )}
              <div className="flex justify-between text-base font-black text-brun border-t border-gris-bd pt-2">
                <span>Total</span><span className="text-rouge-vif">{total.toFixed(2)} €</span>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm mt-4 font-sans">Continuer →</button>
          </div>
        )}

        {/* ── Step 1 LIVRAISON : Adresse ── */}
        {mode === 'livraison' && step === 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-serif text-base font-bold text-brun">📍 Adresse de livraison</h2>
            <div className="grid grid-cols-2 gap-3">
              {[['prenom','Prénom'],['nom','Nom']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-brun block mb-1">{l}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    value={(adresse as any)[k]} onChange={e => setAdresse(a => ({ ...a, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Adresse</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="12 rue de la Roquette"
                value={adresse.adresse} onChange={e => setAdresse(a => ({ ...a, adresse: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['cp','Code postal'],['ville','Ville']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-brun block mb-1">{l}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    value={(adresse as any)[k]} onChange={e => setAdresse(a => ({ ...a, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans">Continuer →</button>
          </div>
        )}

        {/* ── Step 1 CLICK & COLLECT : Créneau retrait ── */}
        {mode === 'click_collect' && step === 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-serif text-base font-bold text-brun">📅 Heure de retrait</h2>
            {boucherie && (
              <div className="bg-or-pale border border-or/20 rounded-xl p-3 flex gap-3">
                <span className="text-xl">🏪</span>
                <div>
                  <p className="text-sm font-bold text-brun">{boucherie.nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Votre commande sera prête à l'heure choisie.</p>
                  <p className="text-xs text-green-600 font-semibold mt-0.5">✅ Aucun frais de livraison</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {CRENEAUX_CC.map(c => (
                <div key={c.value}
                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${creneauCC === c.value ? 'border-brun bg-brun text-white' : 'border-gray-200 text-gray-500'}`}
                  onClick={() => setCreneauCC(c.value)}>
                  🏪 {c.label}
                </div>
              ))}
            </div>
            <div className="bg-creme rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
              💡 Vous recevrez une notification dès que votre commande est prête. Présentez-vous en caisse.
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans">Continuer →</button>
          </div>
        )}

        {/* ── Step 2 LIVRAISON : Créneau ── */}
        {mode === 'livraison' && step === 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-serif text-base font-bold text-brun">📅 Créneau de livraison</h2>
            <div className="space-y-2">
              {CRENEAUX.map(c => (
                <div key={c.value}
                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${creneau === c.value ? 'border-brun bg-brun text-white' : 'border-gray-200 text-gray-500'}`}
                  onClick={() => setCreneau(c.value)}>
                  {c.value === 'now' ? '⚡ ' : '🕐 '}{c.label}
                </div>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans">Continuer →</button>
          </div>
        )}

        {/* ── Step paiement ── */}
        {((mode === 'livraison' && step === 3) || (mode === 'click_collect' && step === 2)) && (
          <div className="space-y-3">

            {/* Pourboire livreur — uniquement pour livraison */}
            {mode === 'livraison' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-serif text-base font-bold text-brun">🙏 Pourboire livreur</h3>
                  <span className="text-[10px] text-gray-400 bg-gris-bd px-2 py-0.5 rounded-full">100% au livreur</span>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Votre livreur effectue {distanceKm.toFixed(1)} km pour vous apporter votre commande fraîche. Un pourboire est toujours bienvenu !
                </p>

                {/* Boutons pourboire */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {POURBOIRES.map(p => (
                    <button key={p.val}
                      className={`flex-1 min-w-[52px] py-2 rounded-xl border-2 text-xs font-bold font-sans transition-all ${pourboire === p.val && !pourboireCustom ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500 hover:border-brun'}`}
                      onClick={() => { setPourboire(p.val); setPourboireCustom('') }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Montant libre */}
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="0" step="0.5"
                    className={`flex-1 border-2 rounded-xl px-3 py-2 text-sm font-sans outline-none transition-all ${pourboireCustom ? 'border-brun' : 'border-gray-200'}`}
                    placeholder="Montant libre (€)"
                    value={pourboireCustom}
                    onChange={e => { setPourboireCustom(e.target.value); setPourboire(0) }}
                  />
                  {pourboireCustom && (
                    <button className="text-gray-400 text-sm font-sans" onClick={() => setPourboireCustom('')}>✕</button>
                  )}
                </div>

                {/* Info rémunération livreur */}
                <div className="mt-3 bg-or-pale border border-or/20 rounded-xl p-3">
                  <p className="text-[11px] text-brun-clair leading-relaxed">
                    💶 Votre livreur percevra <span className="font-bold text-brun">{remunerationLivreur(frais, pourboireVal).toFixed(2)} €</span> pour cette course
                    <span className="text-gray-400"> ({(frais * 0.70).toFixed(2)} € de livraison + {pourboireVal.toFixed(2)} € de pourboire)</span>
                  </p>
                </div>
              </div>
            )}

            {/* Récap final */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-serif text-base font-bold text-brun mb-3">💳 Paiement</h2>

              {/* Rappel mode */}
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${mode === 'click_collect' ? 'bg-green-50 border border-green-200' : 'bg-or-pale border border-or/20'}`}>
                <span className="text-xl">{mode === 'click_collect' ? '🏪' : '🛵'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brun">
                    {mode === 'click_collect'
                      ? `Click & Collect — ${CRENEAUX_CC.find(c => c.value === creneauCC)?.label}`
                      : `Livraison ${distanceKm.toFixed(1)} km — ${CRENEAUX.find(c => c.value === creneau)?.label}`}
                  </p>
                </div>
                <span className="font-black text-rouge-vif text-sm flex-shrink-0">{total.toFixed(2)} €</span>
              </div>

              {/* Détail total */}
              <div className="space-y-1 mb-4 text-xs text-gray-400">
                <div className="flex justify-between"><span>Articles</span><span>{sousTotal().toFixed(2)} €</span></div>
                {frais > 0 && <div className="flex justify-between"><span>Livraison</span><span>{frais.toFixed(2)} €</span></div>}
                {pourboireVal > 0 && <div className="flex justify-between"><span>Pourboire livreur</span><span>{pourboireVal.toFixed(2)} €</span></div>}
                <div className="flex justify-between font-black text-brun text-sm border-t border-gris-bd pt-1.5">
                  <span>Total</span><span className="text-rouge-vif">{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Carte visuelle */}
              <div className="bg-gradient-to-br from-brun to-brun-clair rounded-2xl p-4 text-white mb-4">
                <div className="w-8 h-5 bg-or rounded mb-3" />
                <p className="text-base font-bold tracking-widest font-mono mb-2">{card.numero || '•••• •••• •••• ••••'}</p>
                <div className="flex justify-between text-xs opacity-75">
                  <span>{card.titulaire || 'TITULAIRE'}</span>
                  <span>{card.expiry || 'MM/AA'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-brun block mb-1">Numéro de carte</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun font-mono"
                    placeholder="1234 5678 9012 3456" maxLength={19}
                    value={card.numero}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g,'').slice(0,16)
                      setCard(c => ({ ...c, numero: v.replace(/(.{4})/g,'$1 ').trim() }))
                    }} />
                </div>
                <div>
                  <label className="text-xs font-bold text-brun block mb-1">Titulaire</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder="JEAN DUPONT"
                    value={card.titulaire}
                    onChange={e => setCard(c => ({ ...c, titulaire: e.target.value.toUpperCase() }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-brun block mb-1">Expiration</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun font-mono"
                      placeholder="MM/AA" maxLength={5}
                      value={card.expiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g,'').slice(0,4)
                        if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2)
                        setCard(c => ({ ...c, expiry: v }))
                      }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brun block mb-1">CVV</label>
                    <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                      placeholder="•••" maxLength={4}
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">🔒 Paiement sécurisé SSL</p>
              </div>
            </div>

            <button onClick={simulatePay} disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-base transition-colors font-sans">
              {loading ? '⏳ Traitement…' : `🔒 Payer ${total.toFixed(2)} €`}
            </button>
          </div>
        )}
      </div>

      {editItem && <EditRecapModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  )
}
