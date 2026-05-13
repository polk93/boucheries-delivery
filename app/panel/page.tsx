'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import BottomNavBoucher from '@/components/ui/BottomNavBoucher'
import AuthModal from '@/components/ui/AuthModal'
import { BOUCHERIES, type Produit } from '@/lib/data'

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProduitEtendu extends Produit {
  boucherieId: number
  boucherieNom: string
  photoUrl: string | null
}
interface ProduitForm {
  id: string; nom: string; desc: string; prix: string; icon: string
  stock: string; decoupes: string; preparation: string; photoUrl: string | null; boucherieId: number
}

const ORDERS_INIT = [
  { id: '#1042', client: 'Sophie M.', items: 'Entrecôte ×2 [Épaisse, Marinée]', total: '46,30 €', time: 'Il y a 5 min', status: 'new' },
  { id: '#1041', client: 'Théo B.', items: 'Filet ×1 [Médaillons, Nature]', total: '24,50 €', time: 'Il y a 18 min', status: 'prep' },
  { id: '#1040', client: 'Marie L.', items: 'Bavette ×3 [Fine]', total: '38,40 €', time: 'Il y a 32 min', status: 'ready' },
  { id: '#1039', client: 'Jules R.', items: 'Merguez ×2 [Épicées]', total: '17,00 €', time: 'Il y a 55 min', status: 'delivery' },
  { id: '#1038', client: 'Anna K.', items: 'Côtes ×4 [Désossées]', total: '44,80 €', time: 'Il y a 1h20', status: 'done' },
]
const SL: Record<string,string> = { new:'Nouvelle', prep:'En préparation', ready:'Prête', delivery:'En livraison', done:'Livrée' }
const SC: Record<string,string> = { new:'bg-yellow-100 text-yellow-700', prep:'bg-blue-100 text-blue-600', ready:'bg-green-100 text-green-600', delivery:'bg-orange-100 text-orange-600', done:'bg-gray-100 text-gray-500' }
const SF = ['new','prep','ready','delivery','done']
const BL: Record<string,string> = { new:'Préparer', prep:'Prête', ready:'Livrer', delivery:'Confirmer' }
const ICONS = ['🥩','🍖','🌶️','🥓','🌭','🫙','🦴','🐓','🐇','🦆','🔥','⭐']

function emptyForm(boucherieId: number): ProduitForm {
  return { id:'', nom:'', desc:'', prix:'', icon:'🥩', stock:'0', decoupes:'', preparation:'', photoUrl:null, boucherieId }
}

// ══════════════════════════════════════════════════════════════════════════════
export default function PanelPage() {
  const router = useRouter()
  const { user, logout, isBoucher } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [tab, setTab] = useState('commandes')
  const [orders, setOrders] = useState(ORDERS_INIT)
  const [toast, setToast] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Produits
  const [produits, setProduits] = useState<ProduitEtendu[]>(() =>
    BOUCHERIES.flatMap(b => b.produits.map(p => ({ ...p, boucherieId: b.id, boucherieNom: b.nom, photoUrl: p.photo })))
  )
  const [modalProd, setModalProd] = useState<ProduitForm|null>(null)
  const [isNew, setIsNew] = useState(false)

  // Guard rôle — si non boucher, afficher connexion
  const isBoucherUser = isBoucher()

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function progress(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const i = SF.indexOf(o.status)
      return { ...o, status: SF[Math.min(i+1, SF.length-1)] }
    }))
  }

  function openEdit(p: ProduitEtendu) {
    setModalProd({ id:p.id, nom:p.nom, desc:p.desc, prix:String(p.prix), icon:p.icon, stock:String(p.stock), decoupes:p.decoupes?.join(', ')||'', preparation:p.preparation?.join(', ')||'', photoUrl:p.photoUrl, boucherieId:p.boucherieId })
    setIsNew(false)
  }

  function openNew() {
    const bid = user?.boucherieId || 1
    setModalProd(emptyForm(bid))
    setIsNew(true)
  }

  function saveProduit() {
    if (!modalProd) return
    if (!modalProd.nom.trim() || !modalProd.prix.trim()) { showToast('⚠️ Nom et prix obligatoires'); return }
    if (isNew) {
      setProduits(prev => [...prev, {
        id: 'new_' + Date.now(), nom:modalProd.nom, desc:modalProd.desc,
        prix:parseFloat(modalProd.prix)||0, icon:modalProd.icon, stock:parseInt(modalProd.stock)||0,
        photo:modalProd.photoUrl, photoUrl:modalProd.photoUrl,
        decoupes:modalProd.decoupes.split(',').map(s=>s.trim()).filter(Boolean),
        preparation:modalProd.preparation.split(',').map(s=>s.trim()).filter(Boolean),
        boucherieId:modalProd.boucherieId,
        boucherieNom:BOUCHERIES.find(b=>b.id===modalProd.boucherieId)?.nom||'',
      }])
      showToast('✅ Produit créé !')
    } else {
      setProduits(prev => prev.map(p => p.id !== modalProd.id ? p : {
        ...p, nom:modalProd.nom, desc:modalProd.desc, prix:parseFloat(modalProd.prix)||p.prix,
        icon:modalProd.icon, stock:parseInt(modalProd.stock)||0, photoUrl:modalProd.photoUrl, photo:modalProd.photoUrl,
        decoupes:modalProd.decoupes.split(',').map(s=>s.trim()).filter(Boolean),
        preparation:modalProd.preparation.split(',').map(s=>s.trim()).filter(Boolean),
      }))
      showToast('✅ Produit mis à jour !')
    }
    setModalProd(null)
  }

  function deleteProd(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    setProduits(prev => prev.filter(p => p.id !== id))
    showToast('🗑️ Produit supprimé')
  }

  function adjustStock(id: string, d: number) {
    setProduits(prev => prev.map(p => p.id !== id ? p : { ...p, stock: Math.max(0, p.stock + d) }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !modalProd) return
    setModalProd(f => f ? { ...f, photoUrl: URL.createObjectURL(file) } : f)
    showToast('📸 Photo ajoutée !')
    e.target.value = ''
  }

  // Produits de la boucherie du boucher connecté uniquement
  const myBoucherieId = user?.boucherieId || 1
  const myBoucherie = BOUCHERIES.find(b => b.id === myBoucherieId)
  const myProduits = produits.filter(p => p.boucherieId === myBoucherieId)

  // ── Si non connecté ou pas boucher ──
  if (!user || !isBoucherUser) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-5 pb-10">
        <div className="text-center max-w-sm">
          <span className="text-6xl block mb-4">🔪</span>
          <h1 className="font-serif text-2xl font-black text-brun mb-2">Espace Boucher</h1>
          <p className="text-gray-400 text-sm mb-6">Cet espace est réservé aux boucheries partenaires. Connectez-vous avec votre compte boucher pour accéder à votre tableau de bord.</p>
          <button className="w-full bg-brun text-white py-3.5 rounded-xl font-bold text-sm font-sans hover:bg-rouge-vif transition-colors"
            onClick={() => setAuthOpen(true)}>
            🔪 Connexion Boucher
          </button>
          <button className="w-full mt-3 bg-white border border-gris-bd text-brun py-3 rounded-xl font-semibold text-sm font-sans hover:bg-creme transition-colors"
            onClick={() => router.push('/')}>
            ← Retour à l'accueil client
          </button>
        </div>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} defaultRole="boucher" />}
      </div>
    )
  }

  // ── Interface boucher ──
  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 96 }}>

      {/* Header boucher */}
      <div className="bg-brun px-5 py-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-or font-serif text-xl font-black">🔪 {myBoucherie?.nom || 'Votre boucherie'}</span>
          </div>
          <p className="text-white/60 text-xs mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })} · {user.nom}
          </p>
        </div>
        <button className="bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 text-white text-xs font-semibold"
          onClick={() => { logout(); router.push('/') }}>
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 max-w-2xl mx-auto sm:grid-cols-4">
        {[
          { ico:'📋', val: orders.filter(o => o.status !== 'done').length.toString(), label:'Commandes en cours' },
          { ico:'💶', val:'171 €', label:'CA du jour' },
          { ico:'⭐', val:'4,9', label:'Note moyenne' },
          { ico:'🛍️', val: myProduits.length.toString(), label:'Produits actifs' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">{s.ico}</div>
            <div className="font-serif text-2xl font-black text-brun">{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-5 max-w-2xl mx-auto">

        {/* ══════════ COMMANDES ══════════ */}
        {tab === 'commandes' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gris-bd bg-or-pale">
              <p className="font-bold text-brun text-sm">Commandes du jour</p>
            </div>
            {orders.map((o, i) => (
              <div key={o.id} className={`p-4 ${i < orders.length-1 ? 'border-b border-gris-bd' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-brun text-sm">{o.id} — {o.client}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${SC[o.status]}`}>{SL[o.status]}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{o.items}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">{o.time} · {o.total}</span>
                  {o.status !== 'done' && (
                    <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rouge-vif transition-colors font-sans"
                      onClick={() => progress(o.id)}>
                      {BL[o.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════ PRODUITS ══════════ */}
        {tab === 'produits' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gris-bd bg-or-pale">
              <div>
                <p className="font-bold text-brun text-sm">{myBoucherie?.nom}</p>
                <p className="text-xs text-gray-400">{myProduits.length} produit{myProduits.length > 1 ? 's' : ''}</p>
              </div>
              <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rouge-vif transition-colors font-sans"
                onClick={openNew}>+ Ajouter</button>
            </div>

            {myProduits.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Aucun produit —{' '}
                <button className="text-or font-semibold" onClick={openNew}>en ajouter un</button>
              </div>
            ) : myProduits.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 ${i < myProduits.length-1 ? 'border-b border-gris-bd' : ''}`}>
                {p.photoUrl
                  ? <img src={p.photoUrl} alt={p.nom} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-14 h-14 rounded-xl bg-or-pale flex items-center justify-center text-2xl flex-shrink-0">{p.icon}</div>
                }
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
                <div className="flex gap-2 flex-shrink-0">
                  <button className="bg-or-pale text-brun border border-or/30 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-or hover:text-white transition-colors font-sans"
                    onClick={() => openEdit(p)}>✏️</button>
                  <button className="bg-red-50 text-red-400 border border-red-200 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-sans"
                    onClick={() => deleteProd(p.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════ STOCKS ══════════ */}
        {tab === 'stocks' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gris-bd bg-or-pale">
              <p className="font-bold text-brun text-sm">Gestion des stocks — {myBoucherie?.nom}</p>
            </div>
            {myProduits.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Aucun produit à gérer.</div>
            ) : myProduits.map((p, i) => {
              const pct = Math.min(100, Math.round(p.stock / 20 * 100))
              const bc = pct > 40 ? 'bg-green-400' : pct > 15 ? 'bg-orange-400' : 'bg-rouge-vif'
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 ${i < myProduits.length-1 ? 'border-b border-gris-bd' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brun">{p.icon} {p.nom}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${bc}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 4 ? 'text-orange-500' : 'text-green-600'}`}>
                        {p.stock === 0 ? '⚠️ Rupture' : `${p.stock} unité${p.stock > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="w-8 h-8 border border-gray-200 rounded-xl text-gray-400 hover:border-brun hover:text-brun transition-colors font-sans text-lg"
                      onClick={() => adjustStock(p.id, -1)}>−</button>
                    <span className="text-sm font-bold text-brun w-6 text-center">{p.stock}</span>
                    <button className="w-8 h-8 border border-gray-200 rounded-xl text-gray-400 hover:border-brun hover:text-brun transition-colors font-sans text-lg"
                      onClick={() => adjustStock(p.id, 1)}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ══════════ MODAL PRODUIT ══════════ */}
      {modalProd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setModalProd(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white z-10">
              <h2 className="font-serif text-lg font-black text-brun">{isNew ? '+ Nouveau produit' : '✏️ Modifier'}</h2>
              <button className="bg-gris-bd border-none rounded-full w-8 h-8 text-sm cursor-pointer flex items-center justify-center" onClick={() => setModalProd(null)}>✕</button>
            </div>
            <div className="p-5 space-y-4">

              {/* Photo */}
              <div>
                <label className="text-xs font-bold text-brun block mb-2">📸 Photo du produit</label>
                <div className="flex items-center gap-3">
                  {modalProd.photoUrl
                    ? <img src={modalProd.photoUrl} alt="Photo" className="w-20 h-20 rounded-xl object-cover border border-gris-bd" />
                    : <div className="w-20 h-20 rounded-xl bg-or-pale flex items-center justify-center text-3xl border-2 border-dashed border-or/30">{modalProd.icon}</div>
                  }
                  <div className="flex flex-col gap-2">
                    <button className="bg-brun text-white text-xs font-bold px-4 py-2 rounded-xl font-sans hover:bg-rouge-vif transition-colors"
                      onClick={() => fileRef.current?.click()}>
                      {modalProd.photoUrl ? '📷 Changer' : '📷 Ajouter une photo'}
                    </button>
                    {modalProd.photoUrl && (
                      <button className="bg-red-50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl font-sans border border-red-200"
                        onClick={() => setModalProd(f => f ? { ...f, photoUrl: null } : f)}>🗑️ Supprimer</button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>
              </div>

              {/* Icône */}
              <div>
                <label className="text-xs font-bold text-brun block mb-1.5">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ico => (
                    <button key={ico}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all font-sans ${modalProd.icon === ico ? 'bg-brun scale-110' : 'bg-gris-bd hover:bg-or-pale'}`}
                      onClick={() => setModalProd(f => f ? { ...f, icon: ico } : f)}>{ico}</button>
                  ))}
                </div>
              </div>

              {/* Nom & Description */}
              {[['nom','Nom du produit *','Entrecôte Charolais'],['desc','Description','500g, persillé idéal']].map(([k, l, ph]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-brun block mb-1.5">{l}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder={ph} value={(modalProd as any)[k]}
                    onChange={e => setModalProd(f => f ? { ...f, [k]: e.target.value } : f)} />
                </div>
              ))}

              {/* Prix + Stock */}
              <div className="grid grid-cols-2 gap-3">
                {[['prix','Prix (€) *','18.90'],['stock','Stock','10']].map(([k, l, ph]) => (
                  <div key={k}>
                    <label className="text-xs font-bold text-brun block mb-1.5">{l}</label>
                    <input type="number" min="0" step={k === 'prix' ? '0.10' : '1'}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                      placeholder={ph} value={(modalProd as any)[k]}
                      onChange={e => setModalProd(f => f ? { ...f, [k]: e.target.value } : f)} />
                  </div>
                ))}
              </div>

              {/* Découpes + Préparation */}
              {[['decoupes','✂️ Options de découpe','Standard, Fine (3mm), Épaisse (2cm)'],['preparation','🌿 Options de préparation','Nature, Marinée herbes, Marinée BBQ']].map(([k, l, ph]) => (
                <div key={k}>
                  <label className="text-xs font-bold text-brun block mb-1.5">{l} <span className="text-gray-400 font-normal">(virgules)</span></label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                    placeholder={ph} value={(modalProd as any)[k]}
                    onChange={e => setModalProd(f => f ? { ...f, [k]: e.target.value } : f)} />
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-4">
                <button className="flex-1 bg-gris-bd text-brun border-none rounded-xl py-3 text-sm font-semibold cursor-pointer font-sans"
                  onClick={() => setModalProd(null)}>Annuler</button>
                <button className="flex-[2] bg-brun text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer font-sans hover:bg-rouge-vif transition-colors"
                  onClick={saveProduit}>
                  {isNew ? '✅ Créer' : '✅ Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-brun text-white px-5 py-2.5 rounded-xl text-sm font-semibold z-50 shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Nav boucher en bas */}
      <BottomNavBoucher currentTab={tab} onTabChange={setTab} />
    </div>
  )
}
