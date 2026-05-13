'use client'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'

const HISTORIQUE = [
  { id: '1', numero: '#1038', boucherie: 'Maison Dupont', date: '2026-05-08', total: 46.30, frais: 2.90, creneau: 'Dès que possible',
    items: [{ nom: 'Entrecôte Charolais', icon: '🥩', qty: 2, decoupe: 'Épaisse (2cm)' }, { nom: 'Merguez Maison', icon: '🌶️', qty: 1, decoupe: 'Extra-épicées' }] },
  { id: '2', numero: '#1025', boucherie: 'Bœuf & Tradition', date: '2026-04-30', total: 97.40, frais: 3.50, creneau: 'Aujourd\'hui 19h–20h',
    items: [{ nom: 'Wagyu A5', icon: '⭐', qty: 1, decoupe: 'Fine (4mm)' }, { nom: 'T-Bone Maturé', icon: '🥩', qty: 1, decoupe: 'Entier' }] },
]

export default function CommandesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4">
        <h1 className="font-serif text-xl font-bold text-or">📦 Mes commandes</h1>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {HISTORIQUE.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-4">📦</span>
            <p>Aucune commande pour l'instant.</p>
            <button onClick={() => router.push('/')} className="mt-4 bg-brun text-white px-6 py-3 rounded-xl font-bold text-sm">
              Découvrir les boucheries →
            </button>
          </div>
        ) : HISTORIQUE.map(o => (
          <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-brun text-sm">{o.numero}</p>
                <p className="text-xs text-gray-400">{new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="bg-green-100 text-green-600 text-[11px] font-bold px-3 py-1 rounded-full">✅ Livrée</span>
            </div>

            <p className="text-sm font-semibold text-brun-clair mb-1">🔪 {o.boucherie}</p>
            <p className="text-xs text-or font-semibold mb-3">🕐 {o.creneau}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {o.items.map((it, i) => (
                <span key={i} className="bg-creme text-brun text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                  {it.icon} {it.nom} ×{it.qty}
                  {it.decoupe && <span className="text-or">✂️</span>}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gris-bd">
              <div>
                <p className="font-bold text-brun text-sm">{o.total.toFixed(2)} €</p>
                <p className="text-xs text-gray-400">dont {o.frais.toFixed(2)} € livraison</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-or-pale text-brun-clair border border-or/30 text-xs font-bold px-3 py-2 rounded-xl">
                  ⭐ Avis
                </button>
                <button onClick={() => router.push('/')} className="bg-rouge-vif text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brun transition-colors">
                  🔄 Re-commander
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav currentPage="history" />
    </div>
  )
}
