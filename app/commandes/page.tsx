'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { usePanier } from '@/store/panier'
import BottomNavClient from '@/components/ui/BottomNavClient'
import AuthModal from '@/components/ui/AuthModal'

// ── Données démo ──────────────────────────────────────────────────────────────
const HISTORIQUE_DEMO = [
  {
    id: '1', numero: '#1038', boucherie: 'Maison Dupont',
    adresse: '8 rue Léon Frot, 75011 Paris',
    date: '2026-05-08', heure: '11:42', creneau: 'Dès que possible',
    frais: 2.90,
    items: [
      { nom: 'Entrecôte Charolais', icon: '🥩', qty: 2, prix: 18.90, decoupe: 'Épaisse (2cm)', preparation: 'Marinée herbes' },
      { nom: 'Merguez Maison',      icon: '🌶️', qty: 1, prix: 8.50,  decoupe: 'Standard',     preparation: 'Extra-épicées' },
    ],
  },
  {
    id: '2', numero: '#1025', boucherie: 'Bœuf & Tradition',
    adresse: '23 avenue Parmentier, 75011 Paris',
    date: '2026-04-30', heure: '19:05', creneau: "Aujourd'hui 19h–20h",
    frais: 3.50,
    items: [
      { nom: 'Wagyu A5 – 200g', icon: '⭐', qty: 1, prix: 58.00, decoupe: 'Fine (4mm)',  preparation: 'Nature' },
      { nom: 'T-Bone Maturé 60j', icon: '🥩', qty: 1, prix: 39.90, decoupe: 'Entier',    preparation: 'Sel de Guérande' },
    ],
  },
  {
    id: '3', numero: '#1010', boucherie: 'Ferme & Boucherie Morel',
    adresse: '14 rue de la Roquette, 75011 Paris',
    date: '2026-04-15', heure: '09:10', creneau: 'Demain 9h–10h',
    frais: 1.90,
    items: [
      { nom: 'Poulet Fermier Entier', icon: '🐓', qty: 1, prix: 17.90, decoupe: 'Découpé 8 morceaux', preparation: 'Nature' },
      { nom: 'Magret de Canard',      icon: '🍖', qty: 1, prix: 16.80, decoupe: 'Tranché fin',        preparation: 'Miel-balsamique' },
    ],
  },
]

type Commande = typeof HISTORIQUE_DEMO[0]

// ── Reçu détaillé (modal) ─────────────────────────────────────────────────────
function ModalRecu({ commande: o, onClose, onReorder }: { commande: Commande; onClose: () => void; onReorder: (o: Commande) => void }) {
  const sousTotal = o.items.reduce((s, i) => s + i.prix * i.qty, 0)
  const total = sousTotal + o.frais

  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-serif text-lg font-black text-brun">🧾 Reçu {o.numero}</h2>
            <p className="text-xs text-gray-400">{o.date} à {o.heure}</p>
          </div>
          <button
            className="bg-gris-bd rounded-full w-8 h-8 text-sm flex items-center justify-center flex-shrink-0"
            onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Statut */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-sm font-bold text-green-700">Commande livrée avec succès</p>
              <p className="text-xs text-gray-400">Créneau : {o.creneau}</p>
            </div>
          </div>

          {/* Infos boucherie & livraison */}
          <div className="bg-creme rounded-2xl p-4 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Détails de la commande</p>
            <div className="flex items-start gap-2">
              <span className="text-base">🔪</span>
              <div>
                <p className="text-sm font-bold text-brun">{o.boucherie}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">📍</span>
              <p className="text-sm text-gray-500">{o.adresse}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">📅</span>
              <p className="text-sm text-gray-500">
                {new Date(o.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Articles */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Articles</p>
            <div className="bg-white border border-gris-bd rounded-2xl overflow-hidden">
              {o.items.map((item, i) => (
                <div key={i} className={`px-4 py-3 ${i < o.items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brun">{item.icon} {item.nom}</p>
                      <p className="text-[11px] text-or font-semibold mt-0.5">
                        ✂️ {item.decoupe} · {item.preparation}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.qty} × {item.prix.toFixed(2)} €</p>
                    </div>
                    <p className="text-sm font-black text-brun flex-shrink-0 ml-3">
                      {(item.prix * item.qty).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total</p>
            <div className="bg-white border border-gris-bd rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>{sousTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Frais de livraison</span>
                <span>{o.frais === 0 ? 'Offerts' : `${o.frais.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-brun border-t border-gris-bd pt-2">
                <span>Total payé</span>
                <span className="text-rouge-vif">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <button
              className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans"
              onClick={onClose}>
              Fermer
            </button>
            <button
              className="flex-1 bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
              onClick={() => onReorder(o)}>
              🔄 Re-commander
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function CommandesPage() {
  const router = useRouter()
  const { user, isDemo } = useAuth()
  const { clear, addItem } = usePanier()
  const [authOpen, setAuthOpen] = useState(false)
  const [recuOpen, setRecuOpen] = useState<Commande | null>(null)

  const historique = isDemo() ? HISTORIQUE_DEMO : []

  function reorder(o: Commande) {
    clear()
    o.items.forEach((item, idx) => {
      addItem({
        produit_id: `reorder_${o.id}_${idx}`,
        boucherie_id: 1,
        boucherie_nom: o.boucherie,
        nom: item.nom,
        prix: item.prix,
        icon: item.icon,
        quantite: item.qty,
        decoupe: item.decoupe,
        preparation: item.preparation,
      })
    })
    router.push('/')
  }

  // Non connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>
        <div className="bg-brun px-4 py-3.5">
          <h1 className="font-serif text-lg font-bold text-or">📦 Mes commandes</h1>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="text-5xl mb-4 block">🔐</span>
          <h2 className="font-serif text-xl font-bold text-brun mb-2">Connexion requise</h2>
          <p className="text-sm text-gray-400 mb-6">Connectez-vous pour accéder à vos commandes.</p>
          <button
            className="bg-brun text-white px-8 py-3 rounded-xl font-bold text-sm font-sans w-full max-w-xs"
            onClick={() => setAuthOpen(true)}>
            Se connecter
          </button>
        </div>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        <BottomNavClient currentPage="commandes" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>
      <div className="bg-brun px-4 py-3.5 flex items-center gap-3">
        <h1 className="font-serif text-lg font-bold text-or">📦 Mes commandes</h1>
        {isDemo() && (
          <span className="bg-or/20 border border-or/40 text-or text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
            DÉMO
          </span>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {historique.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-4">📦</span>
            <h2 className="font-serif text-lg font-bold text-brun mb-2">Aucune commande</h2>
            <p className="text-sm mb-6">Vous n'avez pas encore passé de commande.</p>
            <button
              className="bg-brun text-white px-6 py-3 rounded-xl font-bold text-sm font-sans"
              onClick={() => router.push('/')}>
              Découvrir les boucheries →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {historique.map(o => {
              const sousTotal = o.items.reduce((s, i) => s + i.prix * i.qty, 0)
              const total = sousTotal + o.frais
              return (
                <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* En-tête */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gris-bd">
                    <div>
                      <p className="font-bold text-brun text-sm">{o.numero}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full">✅ Livrée</span>
                  </div>

                  {/* Infos */}
                  <div className="px-4 py-3 border-b border-gris-bd">
                    <p className="text-sm font-semibold text-brun-clair mb-1">🔪 {o.boucherie}</p>
                    <p className="text-xs text-or font-semibold">🕐 {o.creneau}</p>
                  </div>

                  {/* Articles résumé */}
                  <div className="px-4 py-3 border-b border-gris-bd">
                    <div className="flex flex-wrap gap-1.5">
                      {o.items.map((it, i) => (
                        <span key={i} className="bg-creme text-brun text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                          {it.icon} {it.nom} ×{it.qty}
                          <span className="text-or text-[10px]">✂️</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center px-4 py-3">
                    <div>
                      <p className="font-bold text-brun text-sm">{total.toFixed(2)} €</p>
                      <p className="text-xs text-gray-400">dont {o.frais.toFixed(2)} € livraison</p>
                    </div>
                    <div className="flex gap-2">
                      {/* Voir le reçu */}
                      <button
                        className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-3 py-2 rounded-xl font-sans"
                        onClick={() => setRecuOpen(o)}>
                        🧾 Reçu
                      </button>
                      {/* Re-commander */}
                      <button
                        className="bg-rouge-vif text-white text-xs font-bold px-3 py-2 rounded-xl font-sans"
                        onClick={() => reorder(o)}>
                        🔄 Re-commander
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal reçu */}
      {recuOpen && <ModalRecu commande={recuOpen} onClose={() => setRecuOpen(null)} onReorder={reorder} />}

      <BottomNavClient currentPage="commandes" />
    </div>
  )
}
