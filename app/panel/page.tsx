'use client'
import { useState } from 'react'
import BottomNav from '@/components/ui/BottomNav'
import { BOUCHERIES } from '@/lib/data'

const ORDERS = [
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

export default function PanelPage() {
  const [tab, setTab] = useState('commandes')
  const [orders, setOrders] = useState(ORDERS)
  const [isOpen, setIsOpen] = useState(true)
  const allProds = BOUCHERIES.flatMap(b => b.produits.map(p => ({ ...p, boucherie: b.nom })))
  const [stocks, setStocks] = useState<Record<string, number>>(
    Object.fromEntries(allProds.map(p => [p.id, p.stock]))
  )

  function progress(id: string) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o
      const i = STATUS_FLOW.indexOf(o.status)
      return { ...o, status: STATUS_FLOW[Math.min(i + 1, STATUS_FLOW.length - 1)] }
    }))
  }

  return (
    <div className="min-h-screen bg-creme pb-24">
      {/* Header */}
      <div className="bg-brun px-5 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-xl font-bold text-or">🔪 Espace Boucher</h1>
          <p className="text-white/60 text-xs mt-0.5">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-semibold">{isOpen ? 'Ouverte ✅' : 'Fermée ⛔'}</span>
          <button
            className={`w-12 h-6 rounded-full relative transition-colors ${isOpen ? 'bg-green-400' : 'bg-gray-400'}`}
            onClick={() => setIsOpen(o => !o)}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOpen ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 max-w-2xl mx-auto">
        {[
          { ico: '📦', val: '5', label: "Commandes aujourd'hui" },
          { ico: '💶', val: '171 €', label: 'CA du jour' },
          { ico: '⭐', val: '4,9', label: 'Note moyenne' },
          { ico: '🛵', val: '3', label: 'En livraison' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-1">{s.ico}</div>
            <div className="font-serif text-2xl font-black text-brun">{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex mx-5 mb-4 bg-gris-bd rounded-xl p-1 max-w-2xl mx-auto">
        {[['commandes', '📋 Commandes'], ['stocks', '📦 Stocks']].map(([id, label]) => (
          <button key={id}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all font-sans ${tab === id ? 'bg-white text-brun shadow' : 'text-gray-400'}`}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div className="px-5 max-w-2xl mx-auto">

        {/* Commandes */}
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
                      className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rouge-vif transition-colors"
                      onClick={() => progress(o.id)}>
                      {BTN_LABELS[o.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stocks */}
        {tab === 'stocks' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {allProds.map((p, i) => {
              const qty = stocks[p.id] ?? 0
              const pct = Math.min(100, Math.round(qty / 20 * 100))
              const barColor = pct > 40 ? 'bg-green-400' : pct > 15 ? 'bg-orange-400' : 'bg-rouge-vif'
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 ${i < allProds.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brun">{p.icon} {p.nom}</p>
                    <p className="text-xs text-gray-400">{p.boucherie}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <button className="w-6 h-6 border border-gray-200 rounded text-gray-400 text-sm hover:border-brun hover:text-brun"
                      onClick={() => setStocks(s => ({ ...s, [p.id]: Math.max(0, s[p.id] - 1) }))}>−</button>
                    <span className="text-sm font-bold text-brun w-5 text-center">{qty}</span>
                    <button className="w-6 h-6 border border-gray-200 rounded text-gray-400 text-sm hover:border-brun hover:text-brun"
                      onClick={() => setStocks(s => ({ ...s, [p.id]: s[p.id] + 1 }))}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav currentPage="panel" />
    </div>
  )
}
