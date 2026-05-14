'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import BottomNavClient from '@/components/ui/BottomNavClient'
import AuthModal from '@/components/ui/AuthModal'
import { useState } from 'react'

// Données factices — affichées UNIQUEMENT pour le compte démo
const HISTORIQUE_DEMO = [
  {
    id: '1', numero: '#1038', boucherie: 'Maison Dupont', date: '2026-05-08',
    total: 46.30, frais: 2.90, creneau: 'Dès que possible',
    items: [
      { nom: 'Entrecôte Charolais', icon: '🥩', qty: 2, decoupe: 'Épaisse (2cm) · Marinée herbes' },
      { nom: 'Merguez Maison', icon: '🌶️', qty: 1, decoupe: 'Extra-épicées' },
    ],
  },
  {
    id: '2', numero: '#1025', boucherie: 'Bœuf & Tradition', date: '2026-04-30',
    total: 97.40, frais: 3.50, creneau: "Aujourd'hui 19h–20h",
    items: [
      { nom: 'Wagyu A5 – 200g', icon: '⭐', qty: 1, decoupe: 'Fine (4mm)' },
      { nom: 'T-Bone Maturé 60j', icon: '🥩', qty: 1, decoupe: 'Entier' },
    ],
  },
  {
    id: '3', numero: '#1010', boucherie: 'Ferme & Boucherie Morel', date: '2026-04-15',
    total: 35.70, frais: 1.90, creneau: 'Demain 9h–10h',
    items: [
      { nom: 'Poulet Fermier Entier', icon: '🐓', qty: 1, decoupe: 'Découpé 8 morceaux' },
      { nom: 'Magret de Canard', icon: '🍖', qty: 1, decoupe: 'Tranché fin · Miel-balsamique' },
    ],
  },
]

export default function CommandesPage() {
  const router = useRouter()
  const { user, isDemo } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const historique = isDemo() ? HISTORIQUE_DEMO : []

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
          <p className="text-sm text-gray-400 mb-6">Connectez-vous pour accéder à votre historique de commandes.</p>
          <button className="bg-brun text-white px-8 py-3 rounded-xl font-bold text-sm font-sans w-full max-w-xs"
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
          /* Compte réel sans commandes */
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-4">📦</span>
            <h2 className="font-serif text-lg font-bold text-brun mb-2">Aucune commande</h2>
            <p className="text-sm mb-6">Vous n'avez pas encore passé de commande.<br />Découvrez les boucheries près de chez vous !</p>
            <button className="bg-brun text-white px-6 py-3 rounded-xl font-bold text-sm font-sans"
              onClick={() => router.push('/')}>
              Découvrir les boucheries →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {historique.map(o => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-brun text-sm">{o.numero}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full">✅ Livrée</span>
                </div>

                <p className="text-sm font-semibold text-brun-clair mb-1">🔪 {o.boucherie}</p>
                <p className="text-xs text-or font-semibold mb-3">🕐 {o.creneau}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {o.items.map((it, i) => (
                    <span key={i} className="bg-creme text-brun text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      {it.icon} {it.nom} ×{it.qty}
                      {it.decoupe && <span className="text-or text-[10px]">✂️</span>}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gris-bd">
                  <div>
                    <p className="font-bold text-brun text-sm">{o.total.toFixed(2)} €</p>
                    <p className="text-xs text-gray-400">dont {o.frais.toFixed(2)} € livraison</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-or-pale text-brun-clair border border-or/30 text-xs font-bold px-3 py-2 rounded-xl font-sans">
                      ⭐ Avis
                    </button>
                    <button className="bg-rouge-vif text-white text-xs font-bold px-3 py-2 rounded-xl font-sans"
                      onClick={() => router.push('/')}>
                      🔄 Re-commander
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavClient currentPage="commandes" />
    </div>
  )
}
