'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'

export default function ParametresPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      titre: 'Mon compte',
      items: [
        { ico: '👤', label: 'Mon profil', sub: 'Jean Dupont · jean@email.fr', action: () => setActiveSection('profil') },
        { ico: '📍', label: 'Mes adresses', sub: '1 adresse enregistrée', action: () => setActiveSection('adresses') },
        { ico: '🔔', label: 'Notifications', sub: '2 non lues', action: () => setActiveSection('notifs') },
        { ico: '❤️', label: 'Boucheries favorites', sub: '2 boucheries sauvegardées', action: () => setActiveSection('favoris') },
      ],
    },
    {
      titre: 'Mes achats',
      items: [
        { ico: '📦', label: 'Historique des commandes', sub: '2 commandes passées', action: () => router.push('/commandes') },
        { ico: '⭐', label: 'Mes avis', sub: '1 avis laissé', action: () => setActiveSection('avis') },
        { ico: '💳', label: 'Moyens de paiement', sub: 'Carte •••• 4242', action: () => setActiveSection('paiement') },
      ],
    },
    {
      titre: 'Espace Boucher',
      items: [
        { ico: '🔪', label: 'Tableau de bord', sub: 'Gérer commandes & stocks', action: () => router.push('/panel') },
        { ico: '📸', label: 'Gérer mes produits', sub: 'Photos, prix, découpes', action: () => router.push('/panel') },
        { ico: '💶', label: 'Mes revenus Stripe', sub: 'Voir les paiements reçus', action: () => setActiveSection('revenus') },
      ],
    },
    {
      titre: 'Application',
      items: [
        { ico: '🌍', label: 'Langue', sub: 'Français', action: () => {} },
        { ico: '🔒', label: 'Confidentialité', sub: 'RGPD & données personnelles', action: () => {} },
        { ico: '📋', label: 'Conditions d\'utilisation', sub: 'CGU & CGV', action: () => {} },
        { ico: '💬', label: 'Support', sub: 'Nous contacter', action: () => {} },
      ],
    },
  ]

  // ── Sous-pages inline ─────────────────────────────────────
  if (activeSection === 'profil') return <ProfilSection onBack={() => setActiveSection(null)} />
  if (activeSection === 'adresses') return <AdressesSection onBack={() => setActiveSection(null)} />
  if (activeSection === 'notifs') return <NotifsSection onBack={() => setActiveSection(null)} />

  return (
    <div className="min-h-screen bg-creme pb-24">
      {/* Header */}
      <div className="bg-brun px-5 py-4">
        <h1 className="font-serif text-xl font-bold text-or">⚙️ Paramètres</h1>
      </div>

      {/* Avatar rapide */}
      <div className="bg-white mx-5 mt-5 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-brun text-white text-2xl flex items-center justify-center flex-shrink-0">👤</div>
        <div className="flex-1">
          <p className="font-bold text-brun text-base">Jean Dupont</p>
          <p className="text-xs text-gray-400">jean@email.fr · Client</p>
        </div>
        <button
          className="bg-creme border border-gris-bd text-brun text-xs font-semibold px-3 py-1.5 rounded-xl"
          onClick={() => setActiveSection('profil')}>
          Modifier
        </button>
      </div>

      {/* Sections */}
      <div className="px-5 mt-5 space-y-5 max-w-lg mx-auto">
        {sections.map(sec => (
          <div key={sec.titre}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{sec.titre}</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {sec.items.map((item, i) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-creme transition-colors ${i < sec.items.length - 1 ? 'border-b border-gris-bd' : ''}`}
                  onClick={item.action}
                >
                  <span className="text-xl flex-shrink-0">{item.ico}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brun">{item.label}</p>
                    <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Déconnexion */}
        <button className="w-full bg-rouge-pale text-rouge-vif font-bold py-3.5 rounded-2xl text-sm hover:bg-red-100 transition-colors font-sans">
          Se déconnecter
        </button>

        <p className="text-center text-xs text-gray-300 pb-2">BoucherieDelivery v1.0.0</p>
      </div>

      <BottomNav currentPage="settings" />
    </div>
  )
}

// ── Sous-page Profil ─────────────────────────────────────────
function ProfilSection({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ prenom: 'Jean', nom: 'Dupont', email: 'jean@email.fr', tel: '06 12 34 56 78' })

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-xl font-bold text-or">Mon profil</h1>
      </div>
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brun text-white text-4xl flex items-center justify-center mx-auto mb-3">👤</div>
          <button className="text-xs text-or font-semibold">Changer la photo</button>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          {[['prenom','Prénom'],['nom','Nom'],['email','Email'],['tel','Téléphone']].map(([k, l]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans"
                value={(form as any)[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              />
            </div>
          ))}
          <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm hover:bg-rouge-vif transition-colors font-sans">
            Enregistrer les modifications
          </button>
        </div>
      </div>
      <BottomNav currentPage="settings" />
    </div>
  )
}

// ── Sous-page Adresses ────────────────────────────────────────
function AdressesSection({ onBack }: { onBack: () => void }) {
  const [adresses] = useState([
    { id: '1', label: '🏠 Domicile', detail: '12 rue de la Roquette, 75011 Paris', defaut: true },
    { id: '2', label: '💼 Bureau', detail: '45 avenue de l\'Opéra, 75002 Paris', defaut: false },
  ])

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-xl font-bold text-or">Mes adresses</h1>
      </div>
      <div className="max-w-lg mx-auto px-5 py-6 space-y-3">
        {adresses.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-brun text-sm">{a.label}</p>
                {a.defaut && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Par défaut</span>}
              </div>
              <p className="text-xs text-gray-400">{a.detail}</p>
            </div>
            <button className="text-gray-300 text-sm hover:text-rouge-vif">✏️</button>
          </div>
        ))}
        <button className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-semibold text-gray-400 hover:border-brun hover:text-brun transition-colors">
          + Ajouter une adresse
        </button>
      </div>
      <BottomNav currentPage="settings" />
    </div>
  )
}

// ── Sous-page Notifications ────────────────────────────────────
function NotifsSection({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({
    livraison: true,
    promos: true,
    nouveaux: false,
    rappels: true,
  })

  const items = [
    { key: 'livraison', label: 'Suivi de livraison', sub: 'Statut de vos commandes en temps réel' },
    { key: 'promos',    label: 'Promotions & offres', sub: 'Bons plans et réductions des boucheries' },
    { key: 'nouveaux',  label: 'Nouvelles boucheries', sub: 'Quand un nouveau partenaire s\'installe' },
    { key: 'rappels',   label: 'Rappels de commande', sub: 'Pour ne pas oublier de re-commander' },
  ]

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-xl font-bold text-or">Notifications</h1>
      </div>
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {items.map((item, i) => (
            <div key={item.key} className={`flex items-center gap-3 px-4 py-4 ${i < items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brun">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <button
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${(prefs as any)[item.key] ? 'bg-green-400' : 'bg-gray-200'}`}
                onClick={() => setPrefs(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(prefs as any)[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <BottomNav currentPage="settings" />
    </div>
  )
}
