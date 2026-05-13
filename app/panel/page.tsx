'use client'
import { useState, useRef } from 'react'
import BottomNav from '@/components/ui/BottomNav'
import { BOUCHERIES, type Produit } from '@/lib/data'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProduitEtendu extends Produit {
  boucherieId: number
  boucherieNom: string
  photoUrl: string | null
}

interface ProduitForm {
  id: string
  nom: string
  desc: string
  prix: string
  icon: string
  stock: string
  decoupes: string
  preparation: string
  photoUrl: string | null
  boucherieId: number
}

const ORDERS_INIT = [
  { id: '#1042', client: 'Sophie M.', items: 'Entrecôte ×2 [Épaisse, Marinée]', total: '46,30 €', time: 'Il y a 5 min', status: 'new' },
  { id: '#1041', client: 'Théo B.', items: 'Filet ×1 [Médaillons, Nature]', total: '24,50 €', time: 'Il y a 18 min', status: 'prep' },
  { id: '#1040', client: 'Marie L.', items: 'Bavette ×3 [Fine]', total: '38,40 €', time: 'Il y a 32 min', status: 'ready' },
  { id: '#1039', client: 'Jules R.', items: 'Merguez ×2 [Épicées]', total: '17,00 €', time: 'Il y a 55 min', status: 'delivery' },
  { id: '#1038', client: 'Anna K.', items: 'Côtes ×4 [Désossées]', total: '44,80 €', time: 'Il y a 1h20', status: 'done' },
]

const STATUS_LABELS: Record<string, string> = { new: 'Nouvelle', prep: 'En préparation', ready: 'Prête', delivery: 'En livraison', done: 'Livrée' }
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  prep: 'bg-blue-100 text-blue-600',
  ready: 'bg-green-100 text-green-600',
  delivery: 'bg-orange-100 text-orange-600',
  done: 'bg-gray-100 text-gray-500',
}
const STATUS_FLOW = ['new', 'prep', 'ready', 'delivery', 'done']
const BTN_LABELS: Record<string, string> = { new: 'Préparer', prep: 'Prête', ready: 'Livrer', delivery: 'Confirmer' }
const ICONS = ['🥩', '🍖', '🌶️', '🥓', '🌭', '🫙', '🦴', '🐓', '🐇', '🦆', '🔥', '⭐']

// ── Helpers ────────────────────────────────────────────────────────────────────
function emptyForm(boucherieId: number): ProduitForm {
  return { id: '', nom: '', desc: '', prix: '', icon: '🥩', stock: '0', decoupes: '', preparation: '', photoUrl: null, boucherieId }
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function PanelPage() {
  const [tab, setTab] = useState('commandes')
  const [orders, setOrders] = useState(ORDERS_INIT)

  // Produits enrichis avec état local
  const [produits, setProduits] = useState<ProduitEtendu[]>(() =>
    BOUCHERIES.flatMap(b =>
      b.produits.map(p => ({
        ...p,
        boucherieId: b.id,
        boucherieNom: b.nom,
        photoUrl: p.photo,
      }))
    )
  )

  // Modal produit
  const [modalProd, setModalProd] = useState<ProduitForm | null>(null)
  const [isNewProd, setIsNewProd] = useState(false)
  const [selectedBoucherieId, setSelectedBoucherieId] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Commandes ──────────────────────────────────────────────────────────────
  function progress(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const i = STATUS_FLOW.indexOf(o.status)
      return { ...o, status: STATUS_FLOW[Math.min(i + 1, STATUS_FLOW.length - 1)] }
    }))
  }

  // ── Produits ───────────────────────────────────────────────────────────────
  function openEdit(p: ProduitEtendu) {
    setModalProd({
      id: p.id,
      nom: p.nom,
      desc: p.desc,
      prix: String(p.prix),
      icon: p.icon,
      stock: String(p.stock),
      decoupes: p.decoupes?.join(', ') || '',
      preparation: p.preparation?.join(', ') || '',
      photoUrl: p.photoUrl,
      boucherieId: p.boucherieId,
    })
    setIsNewProd(false)
  }

  function openNew(boucherieId: number) {
    setModalProd(emptyForm(boucherieId))
    setIsNewProd(true)
  }

  function saveProduit() {
    if (!modalProd) return
    if (!modalProd.nom.trim() || !modalProd.prix.trim()) {
      showToast('⚠️ Nom et prix sont obligatoires')
      return
    }
    if (isNewProd) {
      const newP: ProduitEtendu = {
        id: 'new_' + Date.now(),
        nom: modalProd.nom,
        desc: modalProd.desc,
        prix: parseFloat(modalProd.prix) || 0,
        icon: modalProd.icon,
        stock: parseInt(modalProd.stock) || 0,
        photo: modalProd.photoUrl,
        photoUrl: modalProd.photoUrl,
        decoupes: modalProd.decoupes.split(',').map(s => s.trim()).filter(Boolean),
        preparation: modalProd.preparation.split(',').map(s => s.trim()).filter(Boolean),
        boucherieId: modalProd.boucherieId,
        boucherieNom: BOUCHERIES.find(b => b.id === modalProd.boucherieId)?.nom || '',
      }
      setProduits(prev => [...prev, newP])
      showToast('✅ Produit créé !')
    } else {
      setProduits(prev => prev.map(p => p.id !== modalProd.id ? p : {
        ...p,
        nom: modalProd.nom,
        desc: modalProd.desc,
        prix: parseFloat(modalProd.prix) || p.prix,
        icon: modalProd.icon,
        stock: parseInt(modalProd.stock) || 0,
        photoUrl: modalProd.photoUrl,
        photo: modalProd.photoUrl,
        decoupes: modalProd.decoupes.split(',').map(s => s.trim()).filter(Boolean),
        preparation: modalProd.preparation.split(',').map(s => s.trim()).filter(Boolean),
      }))
      showToast('✅ Produit mis à jour !')
    }
    setModalProd(null)
  }

  function deleteProduit(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    setProduits(prev => prev.filter(p => p.id !== id))
    showToast('🗑️ Produit supprimé')
  }

  function adjustStock(id: string, delta: number) {
    setProduits(prev => prev.map(p => p.id !== id ? p : { ...p, stock: Math.max(0, p.stock + delta) }))
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !modalProd) return
    const url = URL.createObjectURL(file)
    setModalProd(f => f ? { ...f, photoUrl: url } : f)
    showToast('📸 Photo ajoutée !')
    e.target.value = ''
  }

  // Grouper les produits par boucherie
  const produitsByBoucherie = BOUCHERIES.map(b => ({
    ...b,
    produits: produits.filter(p => p.boucherieId === b.id),
  }))

  const tabs = ['commandes', 'produits', 'stocks', 'avis']
  const tabLabels: Record<string, string> = {
    commandes: '📋 Commandes',
    produits: '🛍️ Produits',
    stocks: '📦 Stocks',
    avis: '⭐ Avis',
  }

  return (
    <div className="min-h-screen bg-creme pb-24">

      {/* ── Header ── */}
      <div className="bg-brun px-5 py-4">
        <h1 className="font-serif text-xl font-bold text-or">🔪 Espace Boucher</h1>
        <p className="text-white/60 text-xs mt-0.5">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 max-w-2xl mx-auto sm:grid-cols-4">
        {[
          { ico: '📦', val: orders.filter(o => o.status !== 'done').length.toString(), label: 'En cours' },
          { ico: '💶', val: '171 €', label: 'CA du jour' },
          { ico: '⭐', val: '4,9', label: 'Note moyenne' },
          { ico: '🛍️', val: produits.length.toString(), label: 'Produits actifs' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">{s.ico}</div>
            <div className="font-serif text-2xl font-black text-brun">{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex mx-5 mb-4 bg-gris-bd rounded-xl p-1 max-w-2xl mx-auto gap-1">
        {tabs.map(t => (
          <button key={t}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all font-sans ${tab === t ? 'bg-white text-brun shadow' : 'text-gray-400'}`}
            onClick={() => setTab(t)}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="px-5 max-w-2xl mx-auto">

        {/* ══════════ COMMANDES ══════════ */}
        {tab === 'commandes' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {orders.map((o, i) => (
              <div key={o.id} className={`p-4 ${i < orders.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-brun text-sm">{o.id} — {o.client}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{o.items}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">{o.time} · {o.total}</span>
                  {o.status !== 'done' && (
                    <button
                      className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rouge-vif transition-colors font-sans"
                      onClick={() => progress(o.id)}>
                      {BTN_LABELS[o.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.every(o => o.status === 'done') && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">Toutes les commandes sont livrées !</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════ PRODUITS ══════════ */}
        {tab === 'produits' && (
          <div className="space-y-5">
            {produitsByBoucherie.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* En-tête boucherie */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gris-bd bg-or-pale">
                  <div>
                    <p className="font-bold text-brun text-sm">{b.nom}</p>
                    <p className="text-xs text-gray-400">{b.produits.length} produit{b.produits.length > 1 ? 's' : ''}</p>
                  </div>
                  <button
                    className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rouge-vif transition-colors font-sans flex items-center gap-1"
                    onClick={() => openNew(b.id)}>
                    + Ajouter
                  </button>
                </div>

                {/* Liste produits */}
                {b.produits.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    Aucun produit — <button className="text-or font-semibold" onClick={() => openNew(b.id)}>en ajouter un</button>
                  </div>
                ) : b.produits.map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 p-3 ${i < b.produits.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                    {/* Photo / icône */}
                    {p.photoUrl
                      ? <img src={p.photoUrl} alt={p.nom} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-14 h-14 rounded-xl bg-or-pale flex items-center justify-center text-2xl flex-shrink-0">{p.icon}</div>
                    }
                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brun text-sm truncate">{p.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{p.desc}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-rouge-vif">{p.prix.toFixed(2)} €</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-500' : p.stock <= 4 ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-600'}`}>
                          {p.stock === 0 ? 'Rupture' : `Stock : ${p.stock}`}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="bg-or-pale text-brun border border-or/30 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-or hover:text-white transition-colors font-sans"
                        onClick={() => openEdit(p)}>
                        ✏️ Modifier
                      </button>
                      <button
                        className="bg-red-50 text-red-400 border border-red-200 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-sans"
                        onClick={() => deleteProduit(p.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ══════════ STOCKS ══════════ */}
        {tab === 'stocks' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {produits.map((p, i) => {
              const pct = Math.min(100, Math.round(p.stock / 20 * 100))
              const barColor = pct > 40 ? 'bg-green-400' : pct > 15 ? 'bg-orange-400' : 'bg-rouge-vif'
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 ${i < produits.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brun">{p.icon} {p.nom}</p>
                    <p className="text-xs text-gray-400">{p.boucherieNom}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <button className="w-6 h-6 border border-gray-200 rounded text-gray-400 text-sm hover:border-brun hover:text-brun transition-colors font-sans"
                      onClick={() => adjustStock(p.id, -1)}>−</button>
                    <span className="text-sm font-bold text-brun w-5 text-center">{p.stock}</span>
                    <button className="w-6 h-6 border border-gray-200 rounded text-gray-400 text-sm hover:border-brun hover:text-brun transition-colors font-sans"
                      onClick={() => adjustStock(p.id, 1)}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════ AVIS ══════════ */}
        {tab === 'avis' && (
          <div className="space-y-3">
            {[
              { auteur: 'Sophie M.', note: 5, texte: 'Entrecôte incroyable, fondante et goûteuse. Livraison rapide !', date: '2026-05-08' },
              { auteur: 'Théo B.', note: 5, texte: 'Le filet était parfait. Qualité digne d\'un grand restaurant.', date: '2026-05-05' },
              { auteur: 'Marie L.', note: 4, texte: 'Très bonnes côtes, marinée excellente. Je recommande !', date: '2026-04-30' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-brun text-sm">{r.auteur}</span>
                  <span className="text-or text-sm">{'⭐'.repeat(r.note)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.texte}</p>
                <p className="text-xs text-gray-300 mt-2">{new Date(r.date).toLocaleDateString('fr-FR')}</p>
                <div className="mt-3 pt-3 border-t border-gris-bd">
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-sans outline-none focus:border-brun resize-none"
                    rows={2}
                    placeholder="Répondre à cet avis…"
                  />
                  <button className="mt-1.5 bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg font-sans hover:bg-rouge-vif transition-colors">
                    Répondre
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL CRÉATION / MODIFICATION PRODUIT
      ══════════════════════════════════════════════════════ */}
      {modalProd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setModalProd(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white z-10">
              <h2 className="font-serif text-lg font-black text-brun">
                {isNewProd ? '+ Nouveau produit' : '✏️ Modifier le produit'}
              </h2>
              <button className="bg-gris-bd border-none rounded-full w-8 h-8 text-sm cursor-pointer flex items-center justify-center" onClick={() => setModalProd(null)}>✕</button>
            </div>

            <div className="p-5 space-y-4">

              {/* Photo */}
              <div>
                <label className="text-xs font-bold text-brun block mb-2">📸 Photo du produit</label>
                <div className="flex items-center gap-3">
                  {modalProd.photoUrl
                    ? <img src={modalProd.photoUrl} alt="Photo" className="w-20 h-20 rounded-xl object-cover border border-gris-bd" />
                    : <div className="w-20 h-20 rounded-xl bg-or-pale flex flex-col items-center justify-center text-2xl border-2 border-dashed border-or/30">
                        {modalProd.icon}
                      </div>
                  }
                  <div className="flex flex-col gap-2">
                    <button
                      className="bg-brun text-white text-xs font-bold px-4 py-2 rounded-xl font-sans hover:bg-rouge-vif transition-colors"
                      onClick={() => fileRef.current?.click()}>
                      {modalProd.photoUrl ? '📷 Changer la photo' : '📷 Ajouter une photo'}
                    </button>
                    {modalProd.photoUrl && (
                      <button
                        className="bg-red-50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl font-sans border border-red-200 hover:bg-red-100 transition-colors"
                        onClick={() => setModalProd(f => f ? { ...f, photoUrl: null } : f)}>
                        🗑️ Supprimer la photo
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>

              {/* Boucherie (si nouveau) */}
              {isNewProd && (
                <div>
                  <label className="text-xs font-bold text-brun block mb-1.5">🔪 Boucherie</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    value={modalProd.boucherieId}
                    onChange={e => setModalProd(f => f ? { ...f, boucherieId: parseInt(e.target.value) } : f)}>
                    {BOUCHERIES.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
                  </select>
                </div>
              )}

              {/* Icône */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ico => (
                    <button key={ico}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all font-sans ${modalProd.icon === ico ? 'bg-brun shadow-md scale-110' : 'bg-gris-bd hover:bg-or-pale'}`}
                      onClick={() => setModalProd(f => f ? { ...f, icon: ico } : f)}>
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">Nom du produit *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Ex: Entrecôte Charolais"
                  value={modalProd.nom}
                  onChange={e => setModalProd(f => f ? { ...f, nom: e.target.value } : f)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">Description</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Ex: 500g, persillé idéal"
                  value={modalProd.desc}
                  onChange={e => setModalProd(f => f ? { ...f, desc: e.target.value } : f)}
                />
              </div>

              {/* Prix + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brun block mb-1.5">Prix (€) *</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder="18.90"
                    type="number"
                    min="0"
                    step="0.10"
                    value={modalProd.prix}
                    onChange={e => setModalProd(f => f ? { ...f, prix: e.target.value } : f)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brun block mb-1.5">Stock initial</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder="10"
                    type="number"
                    min="0"
                    value={modalProd.stock}
                    onChange={e => setModalProd(f => f ? { ...f, stock: e.target.value } : f)}
                  />
                </div>
              </div>

              {/* Découpes */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">✂️ Options de découpe <span className="text-gray-400 font-normal">(séparées par des virgules)</span></label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Standard, Fine (3mm), Épaisse (2cm)"
                  value={modalProd.decoupes}
                  onChange={e => setModalProd(f => f ? { ...f, decoupes: e.target.value } : f)}
                />
              </div>

              {/* Préparation */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">🌿 Options de préparation <span className="text-gray-400 font-normal">(séparées par des virgules)</span></label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Nature, Marinée herbes, Marinée BBQ"
                  value={modalProd.preparation}
                  onChange={e => setModalProd(f => f ? { ...f, preparation: e.target.value } : f)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-4">
                <button
                  className="flex-1 bg-gris-bd text-brun border-none rounded-xl py-3 text-sm font-semibold cursor-pointer font-sans"
                  onClick={() => setModalProd(null)}>
                  Annuler
                </button>
                <button
                  className="flex-[2] bg-brun text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer font-sans hover:bg-rouge-vif transition-colors"
                  onClick={saveProduit}>
                  {isNewProd ? '✅ Créer le produit' : '✅ Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brun text-white px-5 py-2.5 rounded-xl text-sm font-semibold z-50 shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}

      <BottomNav currentPage="panel" />
    </div>
  )
}
