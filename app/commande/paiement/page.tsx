'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePanier, type PanierItem } from '@/store/panier'
import { CRENEAUX, BOUCHERIES } from '@/lib/data'
import toast from 'react-hot-toast'

// ── Créneaux click & collect ──────────────────────────────────────────────────
const CRENEAUX_CC = [
  { label: 'Dès que possible (~20 min)', value: 'cc-now'      },
  { label: "Aujourd'hui 12h–13h",        value: 'cc-today-12' },
  { label: "Aujourd'hui 18h–19h",        value: 'cc-today-18' },
  { label: "Aujourd'hui 19h–20h",        value: 'cc-today-19' },
  { label: 'Demain 9h–10h',              value: 'cc-tom-9'    },
  { label: 'Demain 12h–13h',             value: 'cc-tom-12'   },
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
                  <button key={d} className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all font-sans ${decoupe === d ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
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
                  <button key={pr} className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all font-sans ${preparation === pr ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                    onClick={() => setPreparation(pr)}>{pr}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-brun mb-2">📝 Note boucher</p>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans outline-none focus:border-brun resize-none"
              rows={2} placeholder="Sans gras, bien cuit…"
              value={note} onChange={e => setNote(e.target.value)} />
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

  // Mode : livraison ou click & collect
  const [mode, setMode]       = useState<'livraison' | 'click_collect' | null>(null)
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [editItem, setEditItem] = useState<PanierItem | null>(null)
  const [adresse, setAdresse] = useState({ prenom: '', nom: '', adresse: '', cp: '', ville: '' })
  const [card,    setCard]    = useState({ numero: '', expiry: '', cvv: '', titulaire: '' })
  const [creneauCC, setCreneauCC] = useState(CRENEAUX_CC[0].value)

  const frais  = mode === 'click_collect' ? 0 : items.length > 0 ? 2.90 : 0
  const total  = sousTotal() + frais
  const boucherie = BOUCHERIES.find(b => b.id === items[0]?.boucherie_id)

  // Étapes selon le mode
  const stepsLivraison    = ['📋 Récap', '📍 Adresse', '📅 Créneau', '💳 Paiement']
  const stepsClickCollect = ['📋 Récap', '📅 Retrait', '💳 Paiement']
  const stepLabels = mode === 'click_collect' ? stepsClickCollect : stepsLivraison
  const stepIcons  = mode === 'click_collect' ? ['📋','📅','💳'] : ['📋','📍','📅','💳']

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <div className="text-center px-6">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-brun font-semibold mb-4">Votre panier est vide</p>
          <button onClick={() => router.push('/')} className="bg-brun text-white px-6 py-3 rounded-xl font-bold font-sans">← Retour</button>
        </div>
      </div>
    )
  }

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

  // ── Écran choix du mode ────────────────────────────────────────────────────
  if (mode === null) {
    return (
      <div className="min-h-screen bg-creme" style={{ paddingBottom: 40 }}>
        <div className="bg-brun px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
          <h1 className="font-serif text-lg font-bold text-or">Finaliser ma commande</h1>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

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
              <span>Sous-total</span>
              <span>{sousTotal().toFixed(2)} €</span>
            </div>
          </div>

          {/* Choix du mode */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Comment récupérer votre commande ?</p>

          {/* Livraison */}
          <button
            className="w-full bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-brun transition-all text-left active:scale-[.98]"
            onClick={() => setMode('livraison')}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brun flex items-center justify-center text-2xl flex-shrink-0">🛵</div>
              <div className="flex-1">
                <p className="font-serif text-base font-black text-brun">Livraison à domicile</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Livré chez vous en moins de 45 minutes, chaîne du froid garantie.</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold text-rouge-vif">+ 2,90 €</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">🕐 25–45 min</span>
                </div>
              </div>
              <span className="text-gray-300 text-lg flex-shrink-0">›</span>
            </div>
          </button>

          {/* Click & Collect */}
          <button
            className="w-full bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent hover:border-brun transition-all text-left active:scale-[.98]"
            onClick={() => setMode('click_collect')}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-or flex items-center justify-center text-2xl flex-shrink-0">🏪</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-base font-black text-brun">Click & Collect</p>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">GRATUIT</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Commandez maintenant, récupérez en boutique à l'heure de votre choix. La boucherie prépare tout avant votre arrivée.
                </p>
                {boucherie && (
                  <p className="text-xs text-or font-semibold mt-2">📍 {boucherie.nom}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-green-600">0,00 €</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">🕐 Dès 20 min</span>
                </div>
              </div>
              <span className="text-gray-300 text-lg flex-shrink-0">›</span>
            </div>
          </button>

          <p className="text-center text-xs text-gray-300">Paiement sécurisé · Annulation possible</p>
        </div>

        {editItem && <EditRecapModal item={editItem} onClose={() => setEditItem(null)} />}
      </div>
    )
  }

  // ── Tunnel de commande ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 40 }}>

      {/* Header */}
      <div className="bg-brun px-4 py-4 flex items-center gap-3">
        <button onClick={goBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-lg font-bold text-or">
          {mode === 'click_collect' ? '🏪 Click & Collect' : '🛵 Livraison'}
        </h1>
      </div>

      {/* Badge mode */}
      <div className={`px-4 py-2 text-center text-xs font-bold ${mode === 'click_collect' ? 'bg-green-50 text-green-700' : 'bg-or-pale text-brun-clair'}`}>
        {mode === 'click_collect'
          ? '🏪 Retrait en boutique — Livraison offerte'
          : '🛵 Livraison à domicile — Frais : 2,90 €'}
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
            <div className="mt-3 pt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-400"><span>Sous-total</span><span>{sousTotal().toFixed(2)} €</span></div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Livraison</span>
                <span className={frais === 0 ? 'text-green-600 font-bold' : ''}>{frais === 0 ? 'Offerte ✓' : `${frais.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-brun border-t border-gris-bd pt-2">
                <span>Total</span>
                <span className="text-rouge-vif">{total.toFixed(2)} €</span>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm mt-4 font-sans">
              Continuer →
            </button>
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

            {/* Infos boucherie */}
            {boucherie && (
              <div className="bg-or-pale border border-or/20 rounded-xl p-3 flex gap-3 items-start">
                <span className="text-xl">🏪</span>
                <div>
                  <p className="text-sm font-bold text-brun">{boucherie.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Votre commande sera prête à l'heure choisie.</p>
                  <p className="text-xs text-green-600 font-semibold mt-0.5">✅ Pas de frais de livraison</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {CRENEAUX_CC.map(c => (
                <div key={c.value}
                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${creneauCC === c.value ? 'border-brun bg-brun text-white' : 'border-gray-200 text-gray-500 hover:border-brun'}`}
                  onClick={() => setCreneauCC(c.value)}>
                  🏪 {c.label}
                </div>
              ))}
            </div>

            <div className="bg-creme rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
              💡 Vous recevrez une notification dès que votre commande est prête. Présentez-vous directement en caisse.
            </div>

            <button onClick={() => setStep(2)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans">Continuer →</button>
          </div>
        )}

        {/* ── Step 2 LIVRAISON : Créneau livraison ── */}
        {mode === 'livraison' && step === 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-serif text-base font-bold text-brun">📅 Créneau de livraison</h2>
            <div className="space-y-2">
              {CRENEAUX.map(c => (
                <div key={c.value}
                  className={`px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${creneau === c.value ? 'border-brun bg-brun text-white' : 'border-gray-200 text-gray-500 hover:border-brun'}`}
                  onClick={() => setCreneau(c.value)}>
                  {c.value === 'now' ? '⚡ ' : '🕐 '}{c.label}
                </div>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans">Continuer →</button>
          </div>
        )}

        {/* ── Step paiement (dernier step selon mode) ── */}
        {((mode === 'livraison' && step === 3) || (mode === 'click_collect' && step === 2)) && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-serif text-base font-bold text-brun mb-3">💳 Paiement</h2>

              {/* Rappel mode */}
              <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${mode === 'click_collect' ? 'bg-green-50 border border-green-200' : 'bg-or-pale border border-or/20'}`}>
                <span className="text-xl">{mode === 'click_collect' ? '🏪' : '🛵'}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-brun">
                    {mode === 'click_collect'
                      ? `Click & Collect — ${CRENEAUX_CC.find(c => c.value === creneauCC)?.label}`
                      : `Livraison — ${CRENEAUX.find(c => c.value === creneau)?.label}`}
                  </p>
                  {mode === 'click_collect' && boucherie && (
                    <p className="text-xs text-gray-400 mt-0.5">{boucherie.nom}</p>
                  )}
                </div>
                <span className="font-black text-rouge-vif text-sm">{total.toFixed(2)} €</span>
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
