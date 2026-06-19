'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { BOUCHERIES } from '@/lib/data'

// Admin password (en prod → vérification côté serveur)
const ADMIN_EMAIL = 'admin@boucheriesdelivery.fr'

const STATS_GLOBALES = {
  ca_total: 4280.50,
  commandes: 127,
  bouchers_actifs: 6,
  livreurs_actifs: 4,
  panier_moyen: 33.70,
  taux_livraison: 78,
  ca_plateforme: 4280.50 * 0.15,
}

const COMMANDES_RECENTES = [
  { id: '#1042', client: 'Sophie M.', boucher: 'Maison Dupont', total: 46.30, status: 'delivery', date: 'Aujourd\'hui 11:42' },
  { id: '#1041', client: 'Théo B.',   boucher: 'Comptoir du Veau', total: 24.50, status: 'ready',    date: 'Aujourd\'hui 11:24' },
  { id: '#1040', client: 'Marie L.',  boucher: 'Maison Dupont', total: 38.40, status: 'done',     date: 'Aujourd\'hui 10:58' },
  { id: '#1039', client: 'Jules R.',  boucher: 'Bœuf & Tradition', total: 17.00, status: 'done',  date: 'Aujourd\'hui 10:15' },
]

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tab, setTab] = useState<'overview'|'bouchers'|'commandes'|'promos'>('overview')

  // Vérification admin basique
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <span className="text-5xl block">🔒</span>
          <p className="font-serif text-xl font-bold text-brun">Accès restreint</p>
          <p className="text-sm text-gray-400">Cette page est réservée aux administrateurs.</p>
          <button className="bg-brun text-white px-6 py-3 rounded-xl font-bold text-sm font-sans"
            onClick={() => router.push('/')}>Retour</button>
        </div>
      </div>
    )
  }

  const SC: Record<string, string> = {
    done: 'bg-gray-100 text-gray-500', delivery: 'bg-orange-100 text-orange-600',
    ready: 'bg-green-100 text-green-600', prep: 'bg-blue-100 text-blue-600',
  }
  const SL: Record<string, string> = { done: '✅ Livrée', delivery: '🛵 En route', ready: '📦 Prête', prep: '🔪 En prép.' }

  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 20 }}>
      <div className="bg-brun px-4 py-3.5 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-base font-bold text-or">⚙️ Administration</h1>
          <p className="text-white/50 text-xs">Côte à Côte · Vue globale</p>
        </div>
        <button className="text-white/60 text-xs" onClick={() => router.push('/')}>← Retour</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-none">
        {[['overview','📊 Vue d\'ensemble'],['bouchers','🔪 Bouchers'],['commandes','📦 Commandes'],['promos','🏷️ Promos']].map(([k,l]) => (
          <button key={k}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold font-sans whitespace-nowrap flex-shrink-0 ' + (tab === k ? 'bg-brun text-white' : 'bg-white text-gray-500')}
            onClick={() => setTab(k as any)}>{l}</button>
        ))}
      </div>

      <div className="px-4 max-w-2xl mx-auto space-y-4">

        {tab === 'overview' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { ico:'💶', val: STATS_GLOBALES.ca_total.toFixed(0)+'€',  label:'CA Total' },
                { ico:'💰', val: STATS_GLOBALES.ca_plateforme.toFixed(0)+'€', label:'Vos revenus (15%)' },
                { ico:'📦', val: String(STATS_GLOBALES.commandes),         label:'Commandes' },
                { ico:'🧺', val: STATS_GLOBALES.panier_moyen.toFixed(2)+'€', label:'Panier moyen' },
                { ico:'🔪', val: String(STATS_GLOBALES.bouchers_actifs),   label:'Bouchers actifs' },
                { ico:'🛵', val: String(STATS_GLOBALES.livreurs_actifs),   label:'Livreurs actifs' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm">
                  <span className="text-xl block mb-1">{s.ico}</span>
                  <p className="font-black text-brun text-lg">{s.val}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Commandes récentes */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
                <p className="font-bold text-brun text-sm">Commandes récentes</p>
              </div>
              {COMMANDES_RECENTES.map((c, i) => (
                <div key={c.id} className={'px-4 py-3 flex items-center justify-between ' + (i < COMMANDES_RECENTES.length-1 ? 'border-b border-gris-bd' : '')}>
                  <div>
                    <p className="text-sm font-bold text-brun">{c.id} · {c.client}</p>
                    <p className="text-xs text-gray-400">{c.boucher} · {c.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-brun">{c.total.toFixed(2)}€</p>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + SC[c.status]}>{SL[c.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'bouchers' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
              <p className="font-bold text-brun text-sm">{BOUCHERIES.length} boucheries partenaires</p>
            </div>
            {BOUCHERIES.map((b, i) => (
              <div key={b.id} className={'px-4 py-3 flex items-center gap-3 ' + (i < BOUCHERIES.length-1 ? 'border-b border-gris-bd' : '')}>
                <span className="text-2xl">{b.produits[0]?.icon || '🔪'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brun truncate">{b.nom}</p>
                  <p className="text-xs text-gray-400">⭐ {b.note} · {b.produits.length} produits</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">✅ Actif</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'commandes' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-or-pale border-b border-gris-bd flex justify-between">
              <p className="font-bold text-brun text-sm">Toutes les commandes</p>
              <span className="text-xs text-gray-400">{COMMANDES_RECENTES.length} aujourd'hui</span>
            </div>
            {COMMANDES_RECENTES.map((c, i) => (
              <div key={c.id} className={'px-4 py-3 ' + (i < COMMANDES_RECENTES.length-1 ? 'border-b border-gris-bd' : '')}>
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-brun">{c.id} · {c.client}</p>
                  <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + SC[c.status]}>{SL[c.status]}</span>
                </div>
                <p className="text-xs text-gray-400">{c.boucher} · {c.date}</p>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">Commission : <span className="font-bold text-brun">{(c.total * 0.15).toFixed(2)}€</span></p>
                  <p className="text-sm font-black text-brun">{c.total.toFixed(2)}€</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'promos' && (
          <div className="space-y-3">
            {[
              { code:'BIENVENUE10', desc:'10% première commande', reduction:'10%',  actif: true,  utilisations:42 },
              { code:'LIVRAISON',   desc:'Livraison offerte dès 30€', reduction:'Offert', actif: true, utilisations:18 },
              { code:'ETE2026',     desc:'-15% été 2026', reduction:'15%',          actif: false, utilisations:7 },
              { code:'ARTISAN5',    desc:'5€ offerts dès 25€', reduction:'5€',      actif: true,  utilisations:31 },
            ].map(p => (
              <div key={p.code} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-brun text-sm font-mono">{p.code}</p>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (p.actif ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400')}>
                      {p.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                  <p className="text-xs text-gray-300">{p.utilisations} utilisations</p>
                </div>
                <span className="text-lg font-black text-rouge-vif">{p.reduction}</span>
              </div>
            ))}
            <button className="w-full bg-brun text-white py-3 rounded-2xl font-bold text-sm font-sans">
              + Créer un code promo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
