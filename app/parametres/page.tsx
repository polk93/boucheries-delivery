'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'
import { useAuth } from '@/store/auth'
import { useAccounts } from '@/store/accounts'
import AuthModal from '@/components/ui/AuthModal'
import Switch from '@/components/Switch'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CarteDB = {
  id: string
  client_email: string
  stripe_pm_id: string
  last4: string
  brand: string
  exp_month: number
  exp_year: number
  is_default: boolean
  created_at: string
}

function brandLabel(brand: string) {
  const map: Record<string, string> = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', maestro: 'MAESTRO' }
  return map[brand.toLowerCase()] ?? brand.toUpperCase()
}

function expiry(m: number, y: number) {
  return `${String(m).padStart(2, '0')}/${String(y).slice(-2)}`
}

type Section =
  | 'profil' | 'adresses' | 'notifs' | 'favoris'
  | 'commandes' | 'avis' | 'paiement'
  | 'support' | 'contact' | 'confidentialite' | 'cgu'
  | 'livreur' | 'partenaire'
  | 'deconnexion' | null

function PageWrapper({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>
      <div className="bg-brun px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-white text-xl bg-transparent border-none cursor-pointer flex-shrink-0 w-8">←</button>
        <h1 className="font-serif text-lg font-bold text-or">{title}</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-5">{children}</div>
      <BottomNavClient currentPage="settings" />
    </div>
  )
}

export default function ParametresPage() {
  const router = useRouter()
  const { user, logout, isBoucher } = useAuth()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const initSection = searchParams?.get('section') as Section || null
  const [section, setSection] = useState<Section>(initSection)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  // Rediriger automatiquement les bouchers vers leur panel
  useEffect(() => {
    if (isBoucher()) router.replace('/panel')
  }, [user])

  if (section === 'profil')          return <ProfilSection onBack={() => setSection(null)} />
  if (section === 'adresses')        return <AdressesSection onBack={() => setSection(null)} />
  if (section === 'notifs')          return <NotifsSection onBack={() => setSection(null)} />
  if (section === 'favoris')         return <FavorisSection onBack={() => setSection(null)} />
  if (section === 'commandes')       return <CommandesSection onBack={() => setSection(null)} />
  if (section === 'avis')            return <AvisSection onBack={() => setSection(null)} />
  if (section === 'paiement')        return <PaiementSection onBack={() => setSection(null)} />
  if (section === 'support')         return <SupportSection onBack={() => setSection(null)} />
  if (section === 'contact')         return <ContactSection onBack={() => setSection(null)} />
  if (section === 'confidentialite') return <ConfidentialiteSection onBack={() => setSection(null)} />
  if (section === 'cgu')             return <CguSection onBack={() => setSection(null)} />
  if (section === 'livreur')         return <LivreurSection onBack={() => setSection(null)} />
  if (section === 'partenaire')      return <PartenaireSection onBack={() => setSection(null)} />

  const sections = [
    {
      titre: 'Mon compte',
      items: [
        { ico: '👤', label: 'Mon profil', sub: user?.nom || 'Modifier mes informations', action: () => setSection('profil') },
        { ico: '📍', label: 'Mes adresses', sub: '1 adresse enregistrée', action: () => setSection('adresses') },
        { ico: '🔔', label: 'Notifications', sub: 'Gérer mes préférences', action: () => setSection('notifs') },
        { ico: '❤️', label: 'Boucheries favorites', sub: 'Vos boucheries sauvegardées', action: () => setSection('favoris') },
      ],
    },
    {
      titre: 'Mes achats',
      items: [
        { ico: '📦', label: 'Historique des commandes', sub: user?.isDemo ? '3 commandes passées' : 'Voir mes commandes', action: () => setSection('commandes') },
        { ico: '⭐', label: 'Mes avis', sub: user?.isDemo ? '2 avis laissés' : 'Consulter mes avis', action: () => setSection('avis') },
        { ico: '💳', label: 'Moyens de paiement', sub: 'Gérer mes cartes', action: () => setSection('paiement') },
      ],
    },
    ...(isBoucher() ? [{
      titre: 'Espace Boucher',
      items: [
        { ico: '🔪', label: 'Tableau de bord', sub: 'Commandes & stocks', action: () => router.push('/panel') },
        { ico: '🛍️', label: 'Gérer mes produits', sub: 'Photos, prix, découpes', action: () => router.push('/panel') },
        { ico: '💶', label: 'Mes revenus', sub: 'Voir les paiements reçus', action: () => {} },
      ],
    }] : []),
    {
      titre: 'Rejoindre BoucheriesDelivery',
      items: [
        { ico: '🛵', label: 'Devenir livreur', sub: 'Livrez à votre rythme, revenus flexibles', action: () => setSection('livreur') },
        { ico: '🔪', label: 'Devenir partenaire boucher', sub: 'Rejoignez le réseau artisan', action: () => setSection('partenaire') },
      ],
    },
    {
      items: [
        { ico: '🆘', label: 'Support & FAQ', sub: 'Questions fréquentes', action: () => setSection('support') },
        { ico: '✉️', label: 'Nous contacter', sub: 'Envoyer un message', action: () => setSection('contact') },
        { ico: '🔒', label: 'Confidentialité', sub: 'Données & RGPD', action: () => setSection('confidentialite') },
        { ico: '📋', label: "Conditions d'utilisation", sub: 'CGU & CGV', action: () => setSection('cgu') },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>
      <div className="bg-brun px-4 py-3.5">
        <h1 className="font-serif text-lg font-bold text-or">⚙️ Paramètres</h1>
      </div>
      <div className="bg-white mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-brun text-white text-2xl flex items-center justify-center flex-shrink-0">
          {!user ? '👤' : isBoucher() ? '🔪' : '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-brun text-sm truncate">{user?.nom || 'Non connecté'}</p>
            {user?.isDemo && <span className="bg-or/20 border border-or/40 text-or text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">DÉMO</span>}
          </div>
          <p className="text-xs text-gray-400 truncate">
            {user ? `${user.email} · ${isBoucher() ? 'Boucher' : 'Client'}` : 'Connectez-vous pour accéder à vos données'}
          </p>
        </div>
        {user && <button className="bg-creme border border-gris-bd text-brun text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" onClick={() => setSection('profil')}>Modifier</button>}
      </div>
      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        {sections.map(sec => (
          <div key={sec.titre}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">{sec.titre}</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {sec.items.map((item, i) => (
                <button key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left active:bg-creme transition-colors ${i < sec.items.length - 1 ? 'border-b border-gris-bd' : ''}`}
                  onClick={item.action}>
                  <span className="text-xl flex-shrink-0">{item.ico}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brun">{item.label}</p>
                    <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                  </div>
                  <span className="text-gray-300 text-base flex-shrink-0">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {!user ? (
          <button className="w-full bg-brun text-white font-bold py-3.5 rounded-2xl text-sm font-sans flex items-center justify-center gap-2" onClick={() => setAuthOpen(true)}>🔐 Se connecter</button>
        ) : !logoutConfirm ? (
          <button className="w-full bg-rouge-pale text-rouge-vif font-bold py-3.5 rounded-2xl text-sm transition-colors active:bg-red-100 font-sans" onClick={() => setLogoutConfirm(true)}>🚪 Se déconnecter</button>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-rouge-vif">
            <p className="font-bold text-brun text-sm text-center mb-1">Confirmer la déconnexion ?</p>
            <p className="text-xs text-gray-400 text-center mb-4">Vous devrez vous reconnecter pour passer commande.</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans" onClick={() => setLogoutConfirm(false)}>Annuler</button>
              <button className="flex-1 bg-rouge-vif text-white font-bold py-2.5 rounded-xl text-sm font-sans" onClick={() => { logout(); setLogoutConfirm(false); router.push('/') }}>Déconnecter</button>
            </div>
          </div>
        )}
        <p className="text-center text-xs text-gray-300 pb-2">BoucherieDelivery v1.0.0</p>
      </div>
      <BottomNavClient currentPage="settings" />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}

function ProfilSection({ onBack }: { onBack: () => void }) {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ prenom: '', nom: '', email: user?.email || '', tel: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email || user.isDemo) {
      setForm({ prenom: user?.nom?.split(' ')[0] || '', nom: user?.nom?.split(' ').slice(1).join(' ') || '', email: user?.email || '', tel: '' })
      setLoading(false)
      return
    }
    fetch(`/api/clients?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const parts = (data.nom || '').split(' ')
          setForm({ prenom: parts[0] || '', nom: parts.slice(1).join(' ') || '', email: data.email || user.email, tel: data.telephone || '' })
        } else {
          setForm({ prenom: user.nom?.split(' ')[0] || '', nom: user.nom?.split(' ').slice(1).join(' ') || '', email: user.email, tel: '' })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user?.email])

  function enregistrer() {
    const email = form.email.trim() || user?.email || ''
    updateUser({ nom: `${form.prenom} ${form.nom}`.trim(), email })
    if (email && !user?.isDemo) {
      fetch('/api/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nom: `${form.prenom} ${form.nom}`.trim(), telephone: form.tel }),
      }).catch(console.error)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PageWrapper title="👤 Mon profil" onBack={onBack}>
      <div className="text-center mb-5">
        <div className="w-16 h-16 rounded-full bg-brun text-white text-3xl flex items-center justify-center mx-auto mb-2">👤</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {loading ? <p className="text-center text-gray-400 text-sm py-4">Chargement…</p> : (
          <>
            {[['prenom', 'Prénom', 'Jean'], ['nom', 'Nom', 'Dupont'], ['email', 'Email', 'vous@email.fr'], ['tel', 'Téléphone', '+33 6 00 00 00 00']].map(([k, l, ph]) => (
              <div key={k}>
                <label className="text-xs font-bold text-brun block mb-1">{l}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans"
                  placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            {saved && <p className="text-green-600 text-xs font-semibold text-center">✅ Modifications enregistrées !</p>}
            <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans" onClick={enregistrer}>Enregistrer</button>
          </>
        )}
      </div>
    </PageWrapper>
  )
}

function AdressesSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  type Adresse = { id: string; label: string; rue: string; cp: string; ville: string; complement: string; defaut: boolean }
  const [adresses, setAdresses] = useState<Adresse[]>([])

  useEffect(() => {
    if (!user?.email) return
    fetch(`/api/adresses?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setAdresses(data.map((a: any) => ({
        id: a.id, label: a.label || '📍 Autre', rue: a.rue || '',
        cp: a.cp || '', ville: a.ville || '', complement: a.complement || '', defaut: a.defaut || false,
      }))))
      .catch(console.error)
  }, [user?.email])
  const [ajoutOpen, setAjoutOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ label: '🏠 Domicile', rue: '', cp: '', ville: '', complement: '' })
  const LABELS = ['🏠 Domicile', '💼 Bureau', '❤️ Proche', '📍 Autre']

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function ajouterAdresse() {
    if (!form.rue.trim() || !form.ville.trim()) { showToast('⚠️ Rue et ville sont requises'); return }
    const newAdresse = { label: form.label, rue: form.rue, cp: form.cp, ville: form.ville, complement: form.complement, defaut: adresses.length === 0 }
    // Sync Supabase
    if (user?.email) {
      fetch('/api/adresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_email: user.email, ...newAdresse }),
      }).then(r => r.json()).then(data => {
        setAdresses(prev => [...prev, { ...newAdresse, id: data.id || Date.now().toString() }])
      }).catch(() => setAdresses(prev => [...prev, { ...newAdresse, id: Date.now().toString() }]))
    } else {
      setAdresses(prev => [...prev, { ...newAdresse, id: Date.now().toString() }])
    }
    setForm({ label: '🏠 Domicile', rue: '', cp: '', ville: '', complement: '' })
    setAjoutOpen(false)
    showToast('✅ Adresse ajoutée !')
  }

  return (
    <PageWrapper title="📍 Mes adresses" onBack={onBack}>
      <div className="space-y-3">
        {adresses.length === 0 && !ajoutOpen && (
          <div className="bg-white rounded-2xl p-5 text-center text-gray-400 shadow-sm">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-sm">Aucune adresse enregistrée.</p>
          </div>
        )}
        {adresses.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-brun text-sm">{a.label}</p>
                  {a.defaut && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Défaut</span>}
                </div>
                <p className="text-xs text-gray-500">{a.rue}</p>
                <p className="text-xs text-gray-500">{a.cp} {a.ville}</p>
              </div>
              <button className="bg-red-50 border border-red-200 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-xl font-sans"
                onClick={() => {
                  setAdresses(prev => prev.filter(x => x.id !== a.id))
                  fetch(`/api/adresses?id=${a.id}`, { method: 'DELETE' }).catch(console.error)
                }}>🗑️</button>
            </div>
          </div>
        ))}
        {ajoutOpen ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-brun text-base">Nouvelle adresse</h3>
            <div className="flex flex-wrap gap-2">
              {LABELS.map(l => (
                <button key={l} className={`px-3 py-1.5 rounded-full border text-xs font-semibold font-sans ${form.label === l ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                  onClick={() => setForm(f => ({ ...f, label: l }))}>{l}</button>
              ))}
            </div>
            {[['rue','Rue et numéro *','12 rue de la Roquette'],['complement','Complément','Bât. A, 3e étage…'],['cp','Code postal','75011'],['ville','Ville *','Paris']].map(([k,l,ph]) => (
              <div key={k}>
                <label className="text-xs font-bold text-brun block mb-1">{l}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="flex gap-3">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans" onClick={() => setAjoutOpen(false)}>Annuler</button>
              <button className="flex-[2] bg-brun text-white font-bold py-2.5 rounded-xl text-sm font-sans" onClick={ajouterAdresse}>Ajouter</button>
            </div>
          </div>
        ) : (
          <button className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-semibold text-gray-400 font-sans"
            onClick={() => setAjoutOpen(true)}>+ Ajouter une adresse</button>
        )}
      </div>
      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brun text-white px-4 py-2.5 rounded-xl text-sm font-semibold z-50 shadow-xl whitespace-nowrap">{toast}</div>}
    </PageWrapper>
  )
}

function NotifsSection({ onBack }: { onBack: () => void }) {
  const { user, notifPrefs, setNotifPrefs } = useAuth()

  const DEMO_PREFS = { livraison: true, promos: true, nouveaux: false, rappels: true, rapport: false }

  // Initialise depuis le cache Zustand (disponible immédiatement), sinon valeurs démo
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    if (user?.isDemo) return DEMO_PREFS
    return Object.keys(notifPrefs).length > 0 ? notifPrefs : DEMO_PREFS
  })

  useEffect(() => {
    if (!user?.email || user.isDemo) return
    fetch(`/api/clients?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.notifs_prefs && Object.keys(data.notifs_prefs).length > 0) {
          setPrefs(data.notifs_prefs)
          setNotifPrefs(data.notifs_prefs)
        }
      })
      .catch(() => {})
  }, [user?.email, user?.isDemo])

  function toggle(key: string) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    if (user?.email && !user.isDemo) {
      setNotifPrefs(updated)
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, notifs_prefs: updated }),
      }).catch(console.error)
    }
  }

  const items = [
    { key: 'livraison', label: 'Suivi de livraison',      sub: 'Statut en temps réel de vos commandes' },
    { key: 'promos',    label: 'Promotions & offres',      sub: 'Bons plans des boucheries partenaires' },
    { key: 'nouveaux',  label: 'Nouvelles boucheries',     sub: 'Nouveaux partenaires dans votre quartier' },
    { key: 'rappels',   label: 'Rappels de panier',        sub: 'Panier non finalisé' },
    { key: 'rapport',   label: 'Rapport hebdomadaire',     sub: 'Résumé de vos achats chaque semaine' },
  ]
  const NOTIFS_DEMO = [
    { ico: '🛵', titre: 'Votre livreur est en route !', sub: 'Commande #1042 · Arrivée dans ~8 min', time: 'Il y a 5 min', lu: false },
    { ico: '✅', titre: 'Commande #1041 prête !', sub: 'Comptoir du Veau · Présentez-vous en caisse', time: 'Il y a 2h', lu: false },
    { ico: '🏷️', titre: '-20% sur le Wagyu ce weekend', sub: 'Bœuf & Tradition · Offre limitée', time: 'Hier', lu: true },
    { ico: '⭐', titre: 'Merci pour votre avis !', sub: 'Votre avis sur Maison Dupont a été publié', time: 'Il y a 2 jours', lu: true },
  ]

  return (
    <PageWrapper title="🔔 Notifications" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
            <p className="text-xs font-bold text-brun">Préférences</p>
          </div>
          {items.map((item, i) => (
            <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brun">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <Switch
                checked={!!(prefs as any)[item.key]}
                onChange={() => toggle(item.key)}
              />
            </div>
          ))}
        </div>
        {user?.isDemo && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-or-pale border-b border-gris-bd"><p className="text-xs font-bold text-brun">Récentes</p></div>
            {NOTIFS_DEMO.map((n, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i < NOTIFS_DEMO.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                <span className="text-lg flex-shrink-0 mt-0.5">{n.ico}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.lu ? 'text-gray-500' : 'text-brun'}`}>{n.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.sub}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">{n.time}</p>
                </div>
                {!n.lu && <span className="w-2 h-2 bg-rouge-vif rounded-full flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

function FavorisSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const router = useRouter()
  const [favoris, setFavoris] = useState<{ id: string; nom: string; note: number }[]>([])

  useEffect(() => {
    if (!user?.email) return
    fetch(`/api/favoris?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setFavoris(data.map((f: any) => ({
        id: f.boucher_id, nom: f.bouchers?.nom_boutique || '', note: 5.0,
      }))))
      .catch(console.error)
  }, [user?.email])
  return (
    <PageWrapper title="❤️ Boucheries favorites" onBack={onBack}>
      {favoris.length === 0
        ? <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-3">❤️</span><p className="text-sm">Aucune boucherie favorite pour l'instant.</p></div>
        : favoris.map(f => (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex items-center justify-between">
            <div><p className="font-bold text-brun text-sm">{f.nom}</p><p className="text-xs text-or">⭐ {f.note}</p></div>
            <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-xl font-sans" onClick={() => router.push('/')}>Commander</button>
          </div>
        ))
      }
    </PageWrapper>
  )
}

function CommandesSection({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const { user } = useAuth()
  const [filtre, setFiltre] = useState<'toutes'|'encours'|'livrees'>('toutes')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email || user.isDemo) { setLoading(false); return }
    fetch(`/api/commandes?client_email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : [])
      .then(rows => { setData(Array.isArray(rows) ? rows : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.email])

  const filtered = filtre === 'encours'
    ? data.filter(o => !['done','livree','annulee'].includes(o.status || o.statut))
    : filtre === 'livrees'
    ? data.filter(o => ['done','livree'].includes(o.status || o.statut))
    : data

  function getStatus(o: any) { return o.status || o.statut || 'new' }
  function isDone(o: any)     { return ['done','livree'].includes(getStatus(o)) }
  function isDelivery(o: any) { return ['delivery','livraison'].includes(getStatus(o)) }
  function isReady(o: any)    { return ['ready','prete'].includes(getStatus(o)) }

  return (
    <PageWrapper title="📦 Mes commandes" onBack={onBack}>
      <div className="space-y-4">
        {loading && <div className="bg-white rounded-2xl p-5 shadow-sm text-center text-gray-400 text-sm">Chargement…</div>}
        {!loading && data.length > 0 && (
          <div className="flex gap-2">
            {(['toutes','encours','livrees'] as const).map(v => (
              <button key={v} className={'flex-1 py-2 rounded-xl text-xs font-bold font-sans border transition-all ' + (filtre === v ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gris-bd')}
                onClick={() => setFiltre(v)}>{v === 'toutes' ? 'Toutes' : v === 'encours' ? 'En cours' : 'Livrées'}</button>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">📦</span>
            <p className="text-sm">Aucune commande pour l'instant.</p>
            <button className="mt-4 bg-brun text-white px-5 py-2 rounded-xl text-sm font-bold font-sans" onClick={() => router.push('/')}>Découvrir les boucheries</button>
          </div>
        )}
        {filtered.map(o => {
          const numero = o.numero || o.id
          const date = o.created_at || o.date
          const boucherie = o.boucher_nom || o.boucherie || '—'
          const mode = o.mode || o.creneau_type || 'livraison'
          const total = parseFloat(o.total || 0)
          const frais = parseFloat(o.frais_livraison || o.frais || 0)
          const lignes: any[] = o.lignes || []
          return (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gris-bd flex justify-between items-center">
                <div><span className="font-black text-brun text-sm">{numero}</span><span className="text-gray-400 text-xs ml-2">{date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}</span></div>
                <span className={'text-[11px] font-bold px-2.5 py-1 rounded-full ' + (isDone(o) ? 'bg-gray-100 text-gray-500' : isDelivery(o) ? 'bg-orange-100 text-orange-600' : isReady(o) ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')}>
                  {isDone(o) ? '✅ Livrée' : isDelivery(o) ? '🛵 En livraison' : isReady(o) ? '📦 Prête' : '🔪 En préparation'}
                </span>
              </div>
              <div className="px-4 py-3 border-b border-gris-bd">
                <p className="text-xs font-semibold text-brun-clair mb-1">🔪 {boucherie} · {mode === 'livraison' ? '🛵 Livraison' : '🏪 Click & Collect'}</p>
                {lignes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {lignes.map((it: any, i: number) => <span key={i} className="bg-creme text-brun text-xs px-2.5 py-1 rounded-lg">{it.icon || '🥩'} {it.produit || it.nom} ×{it.qty || it.quantite || 1}</span>)}
                  </div>
                )}
                {isDelivery(o) && <div className="bg-or-pale border border-or/20 rounded-xl p-2.5 mt-2 flex items-center gap-2"><span className="text-lg">🛵</span><div><p className="text-xs font-bold text-brun">Votre livreur est en route</p></div></div>}
                {isReady(o)    && <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 mt-2 flex items-center gap-2"><span className="text-lg">✅</span><div><p className="text-xs font-bold text-green-700">Votre commande est prête !</p></div></div>}
              </div>
              <div className="px-4 py-3 flex justify-between items-center">
                <div><p className="font-bold text-brun text-sm">{total.toFixed(2)} €</p><p className="text-xs text-gray-400">dont {frais.toFixed(2)} € livraison</p></div>
                <div className="flex gap-2">
                  {isDelivery(o) && <button className="bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl font-sans" onClick={() => router.push(`/suivi?numero=${numero}`)}>🗺️ Suivre</button>}
                  <button className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-3 py-2 rounded-xl font-sans" onClick={() => router.push('/')}>🔄 Re-commander</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}

function AvisSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [avis, setAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email || user.isDemo) { setLoading(false); return }
    fetch(`/api/avis?client_email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAvis(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.email])

  async function supprimerAvis(id: string) {
    setAvis(prev => prev.filter(a => a.id !== id))
    await fetch(`/api/avis?id=${id}`, { method: 'DELETE' })
  }

  return (
    <PageWrapper title="⭐ Mes avis" onBack={onBack}>
      {loading
        ? <div className="text-center py-12 text-gray-400 text-sm">Chargement…</div>
        : avis.length === 0
        ? <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-3">⭐</span><p className="text-sm">Vous n'avez pas encore laissé d'avis.</p></div>
        : <div className="space-y-4">
            {avis.map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-bold text-brun text-sm">{a.bouchers?.nom_boutique || a.boucherie || '—'}</p>
                    <p className="text-xs text-gray-400">{a.produit || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-or text-sm">{'⭐'.repeat(a.note)}</span>
                    <button className="text-gray-300 text-xs" onClick={() => supprimerAvis(a.id)}>🗑️</button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{a.texte}</p>
                <p className="text-xs text-gray-300 mt-2">{new Date(a.created_at || a.date).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
      }
    </PageWrapper>
  )
}

function PaiementSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [cartes, setCartes] = useState<CarteDB[]>([])
  const [ajoutOpen, setAjoutOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user?.email || user.isDemo) { setLoading(false); return }
    fetch(`/api/cartes?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setCartes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.email])

  async function supprimerCarte(id: string) {
    setCartes(prev => prev.filter(c => c.id !== id))
    await fetch(`/api/cartes/${id}`, { method: 'DELETE' })
  }

  function onCarteAjoutee(carte: CarteDB) {
    setCartes(prev => [...prev, carte])
    setAjoutOpen(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PageWrapper title="💳 Moyens de paiement" onBack={onBack}>
      <div className="space-y-4">
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-green-700 text-sm font-semibold">✅ Carte ajoutée avec succès !</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center text-gray-400 text-sm">Chargement…</div>
        ) : cartes.length === 0 && !ajoutOpen ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <span className="text-4xl block mb-3">💳</span>
            <p className="font-bold text-brun text-sm mb-1">Aucune carte enregistrée</p>
            <p className="text-xs text-gray-400">Ajoutez une carte pour payer rapidement</p>
          </div>
        ) : (
          cartes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-br from-brun to-brun-clair rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {brandLabel(c.brand)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brun text-sm capitalize">{c.brand} •••• {c.last4}</p>
                <p className="text-xs text-gray-400">Expire {expiry(c.exp_month, c.exp_year)}</p>
              </div>
              {c.is_default && <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">Défaut</span>}
              <button className="text-gray-300 text-sm flex-shrink-0" onClick={() => supprimerCarte(c.id)}>🗑️</button>
            </div>
          ))
        )}

        {!ajoutOpen && !loading && (
          <button
            className="w-full bg-brun text-white font-bold py-3.5 rounded-2xl text-sm font-sans"
            onClick={() => setAjoutOpen(true)}
          >
            + Ajouter une carte
          </button>
        )}

        {ajoutOpen && user?.email && (
          <Elements stripe={stripePromise}>
            <AddCardForm
              email={user.email}
              onSuccess={onCarteAjoutee}
              onCancel={() => setAjoutOpen(false)}
            />
          </Elements>
        )}

        <div className="bg-or-pale rounded-2xl p-3 border border-or/20">
          <p className="text-xs text-brun-clair leading-relaxed">
            🔒 <strong>Paiement sécurisé par Stripe.</strong> Votre numéro de carte et CVV sont chiffrés directement par Stripe — jamais transmis ni stockés sur nos serveurs.
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}

function AddCardForm({ email, onSuccess, onCancel }: { email: string; onSuccess: (carte: CarteDB) => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ajouterCarte() {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
    try {
      // Étape 1 : créer un SetupIntent côté serveur (lie la carte au Stripe Customer)
      const res = await fetch('/api/cartes/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const { clientSecret, error: setupErr } = await res.json()
      if (setupErr) throw new Error(setupErr)

      // Étape 2 : Stripe tokenise la carte dans son iframe sécurisé (numéro/CVV jamais vus par notre code)
      const cardElement = elements.getElement(CardElement)!
      const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      })
      if (stripeErr) throw new Error(stripeErr.message)

      const pmId = typeof setupIntent!.payment_method === 'string'
        ? setupIntent!.payment_method
        : setupIntent!.payment_method?.id

      if (!pmId) throw new Error('PaymentMethod introuvable')

      // Étape 3 : sauvegarder uniquement les métadonnées masquées (last4, brand, expiry) dans Supabase
      const confirmRes = await fetch('/api/cartes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, stripe_pm_id: pmId }),
      })
      const carte = await confirmRes.json()
      if (carte.error) throw new Error(carte.error)

      onSuccess(carte)
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'ajout de la carte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <h3 className="font-serif font-bold text-brun text-base">Nouvelle carte</h3>
      <div className="border border-gray-200 rounded-xl px-3 py-3 focus-within:border-brun transition-colors">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#3d1c0b',
                fontFamily: 'sans-serif',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#e53e3e' },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <p className="text-[11px] text-gray-400">🔒 Saisie chiffrée par Stripe — le numéro et le CVV ne transitent jamais par nos serveurs</p>
      <div className="flex gap-3">
        <button
          className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </button>
        <button
          className="flex-[2] bg-rouge-vif text-white font-bold py-3 rounded-xl text-sm font-sans disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={ajouterCarte}
          disabled={loading || !stripe}
        >
          {loading ? '⏳ Ajout en cours…' : 'Ajouter la carte'}
        </button>
      </div>
    </div>
  )
}

function SupportSection({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: "Comment passer ma première commande ?", a: "Ouvrez l'app, sélectionnez une boucherie, choisissez vos produits et personnalisez votre découpe. Ajoutez au panier et procédez au paiement sécurisé." },
    { q: "Quelle est la zone de livraison ?", a: "BoucheriesDelivery livre dans un rayon de 10 km autour des boucheries partenaires." },
    { q: "La chaîne du froid est-elle garantie ?", a: "Oui. Tous nos livreurs utilisent des sacs isothermes réfrigérés. Livraison en moins de 45 minutes." },
    { q: "Que faire si je ne suis pas satisfait ?", a: "Contactez-nous dans les 2h suivant la livraison. Remboursement ou remplacement garanti." },
    { q: "Comment annuler une commande ?", a: "Annulation possible dans les 5 minutes. Remboursement intégral sous 3-5 jours ouvrés." },
  ]
  return (
    <PageWrapper title="🆘 Support & FAQ" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-4 text-center">
          <p className="text-white font-bold text-sm mb-1">Besoin d'aide immédiate ?</p>
          <p className="text-white/60 text-xs mb-3">Réponse sous 2h en jours ouvrés</p>
          <div className="flex gap-2 justify-center">
            <a href="mailto:boucheriesdelivery@gmail.com" className="bg-or text-brun text-xs font-bold px-4 py-2 rounded-xl no-underline">✉️ Email</a>
            <a href="tel:+33650290212" className="bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl no-underline">📞 Appel</a>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className={i < faqs.length - 1 ? 'border-b border-gris-bd' : ''}>
              <button className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left font-sans" onClick={() => setOpen(open === i ? null : i)}>
                <p className="text-sm font-semibold text-brun flex-1">{faq.q}</p>
                <span className={`text-gray-400 text-base flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {open === i && <div className="px-4 pb-4"><p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}

function ContactSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ sujet: 'commande', nom: user?.nom || '', email: user?.email || '', message: '' })
  const [sent, setSent] = useState(false)
  const sujets = [
    { val: 'commande', label: '📦 Problème avec une commande' },
    { val: 'livraison', label: '🛵 Problème de livraison' },
    { val: 'paiement', label: '💳 Problème de paiement' },
    { val: 'suggestion', label: '💡 Suggestion' },
    { val: 'autre', label: '❓ Autre demande' },
  ]
  if (sent) return (
    <PageWrapper title="✉️ Nous contacter" onBack={onBack}>
      <div className="text-center py-14"><span className="text-6xl block mb-4">✅</span><h2 className="font-serif text-xl font-bold text-brun mb-2">Message envoyé !</h2><p className="text-gray-400 text-sm">Notre équipe vous répondra sous 2h.</p></div>
    </PageWrapper>
  )
  return (
    <PageWrapper title="✉️ Nous contacter" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-brun block mb-2">Sujet</label>
            <div className="space-y-1.5">
              {sujets.map(s => (
                <label key={s.val} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer ${form.sujet === s.val ? 'border-brun bg-or-pale' : 'border-gray-100'}`}>
                  <input type="radio" name="sujet" value={s.val} checked={form.sujet === s.val} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.sujet === s.val ? 'border-brun bg-brun' : 'border-gray-300'}`}>
                    {form.sujet === s.val && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-brun">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-brun block mb-1">Nom</label><input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun" placeholder="Votre nom" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
            <div><label className="text-xs font-bold text-brun block mb-1">Email</label><input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun" placeholder="vous@email.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div><label className="text-xs font-bold text-brun block mb-1">Message</label><textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none" rows={4} placeholder="Décrivez votre demande…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
          <button className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans disabled:bg-gray-300" disabled={!form.nom || !form.email || !form.message} onClick={() => setSent(true)}>✉️ Envoyer</button>
        </div>
      </div>
    </PageWrapper>
  )
}

function ConfidentialiteSection({ onBack }: { onBack: () => void }) {
  return (
    <PageWrapper title="🔒 Confidentialité" onBack={onBack}>
      <div className="space-y-3">
        <div className="bg-or-pale border border-or/20 rounded-xl p-3"><p className="text-xs text-brun-clair font-semibold">Dernière mise à jour : 13 mai 2026 · Conforme RGPD</p></div>
        {[
          { t: "1. Responsable du traitement", c: "BoucherieDelivery SAS. Contact : boucheriesdelivery@gmail.com" },
          { t: "2. Données collectées", c: "Identité, adresses, historique commandes, géolocalisation (avec consentement). Données bancaires gérées par Stripe." },
          { t: "3. Vos droits", c: "Accès, rectification, effacement, portabilité. Contact : boucheriesdelivery@gmail.com. Réclamation CNIL : www.cnil.fr" },
          { t: "4. Durée de conservation", c: "Données de compte : 3 ans après suppression. Commandes : 5 ans (obligation légale)." },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-serif text-sm font-bold text-brun mb-1.5">{s.t}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{s.c}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}

function CguSection({ onBack }: { onBack: () => void }) {
  return (
    <PageWrapper title="📋 CGU" onBack={onBack}>
      <div className="space-y-3">
        <div className="bg-or-pale border border-or/20 rounded-xl p-3"><p className="text-xs text-brun-clair font-semibold">En vigueur depuis le 13 mai 2026</p></div>
        {[
          { t: "1. Objet", c: "Les CGU régissent l'utilisation de BoucherieDelivery." },
          { t: "2. Description du service", c: "Marketplace mettant en relation consommateurs et boucheries artisanales." },
          { t: "3. Paiement", c: "Prix en euros TTC. Paiement dû à la validation via Stripe." },
          { t: "4. Livraison", c: "Délais indicatifs 25-55 min. Chaîne du froid garantie." },
          { t: "5. Droit de rétractation", c: "Non applicable aux denrées périssables (art. L.221-28 Code consommation)." },
          { t: "6. Droit applicable", c: "Droit français. Tribunaux de Paris compétents." },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-serif text-sm font-bold text-brun mb-1.5">{s.t}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">{s.c}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}


function LivreurSection({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'info'|'form'>('info')
  const [form, setForm] = useState({ prenom:'', nom:'', email:'', tel:'', ville:'', vehicule:'velo_elec', siret:'', disponibilite:'', message:'' })
  const [docs, setDocs] = useState<Record<string, File|null>>({ cni: null, siret_doc: null, permis_doc: null, carte_grise: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const needsPermis = ['scooter','voiture'].includes(form.vehicule)
  const [sacIsotherme, setSacIsotherme] = useState<'oui'|'non'|null>(null)
  const [hParJour, setHParJour] = useState(3)
  const [joursParSemaine, setJours] = useState(5)
  const revenus_brut = hParJour * joursParSemaine * 4 * 2.5 * (2.85 + 2.5 * 0.80)
  const revenus_net = revenus_brut * 0.78

  function docValide() {
    if (!docs.cni || !docs.siret_doc) return false
    if (needsPermis && (!docs.permis_doc || !docs.carte_grise)) return false
    return true
  }

  async function soumettre() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/connect/onboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, nom_boutique: `Livreur — ${form.prenom} ${form.nom}`, ville: form.ville, type: 'livreur' }),
      })
      const data = await res.json()
      if (data.onboardingUrl) window.location.href = data.onboardingUrl
      else throw new Error(data.error || 'Erreur Stripe')
    } catch (e: any) { setError(`Erreur : ${e?.message}`) }
    finally { setLoading(false) }
  }

  if (step === 'info') return (
    <PageWrapper title="🛵 Devenir livreur" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-5 text-center"><span className="text-4xl block mb-2">🛵</span><h2 className="font-serif text-lg font-black text-or mb-1">Livrez à votre rythme</h2><p className="text-white/70 text-xs">Gagnez un revenu flexible en livrant des produits artisanaux.</p></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-brun text-sm mb-3">🧮 Simulateur de revenus</p>
          <div className="space-y-3">
            <div><div className="flex justify-between mb-1"><label className="text-xs text-brun font-semibold">Heures / jour</label><span className="text-xs font-black text-brun">{hParJour}h</span></div><input type="range" min="1" max="10" step="0.5" value={hParJour} className="w-full accent-brun" onChange={e => setHParJour(parseFloat(e.target.value))} /></div>
            <div><div className="flex justify-between mb-1"><label className="text-xs text-brun font-semibold">Jours / semaine</label><span className="text-xs font-black text-brun">{joursParSemaine}j</span></div><input type="range" min="1" max="7" step="1" value={joursParSemaine} className="w-full accent-brun" onChange={e => setJours(parseInt(e.target.value))} /></div>
            <div className="bg-creme rounded-xl p-3"><div className="flex justify-between text-sm font-black text-brun"><span>Revenu net estimé</span><span className="text-green-600">{revenus_net.toFixed(0)} €/mois</span></div></div>
          </div>
        </div>
        <button className="w-full bg-brun text-white py-4 rounded-2xl font-bold text-sm font-sans" onClick={() => setStep('form')}>🛵 Postuler maintenant →</button>
      </div>
    </PageWrapper>
  )

  // Étape 2 : sac isotherme + Stuart
  return (
    <PageWrapper title="🛵 Inscription livreur" onBack={() => setStep('info')}>
      <div className="space-y-4">

        {/* Question sac isotherme */}
        {sacIsotherme === null && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-bold text-brun">🧊 Avez-vous un sac isotherme ?</p>
            <p className="text-xs text-gray-400">Obligatoire pour maintenir la chaîne du froid lors des livraisons.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold font-sans"
                onClick={() => setSacIsotherme('oui')}>
                ✅ Oui
              </button>
              <button
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold font-sans"
                onClick={() => setSacIsotherme('non')}>
                ❌ Non
              </button>
            </div>
          </div>
        )}

        {/* Pas de sac → lien Amazon */}
        {sacIsotherme === 'non' && (
          <div className="space-y-3">
            <div className="bg-or-pale border border-or/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-brun">🛒 Commandez votre sac isotherme</p>
              <p className="text-xs text-gray-500 leading-relaxed">Un sac isotherme est obligatoire pour livrer des produits de boucherie. Commandez-en un sur Amazon avant de vous inscrire.</p>
              <a href="https://www.amazon.fr/s?k=sac+isotherme+livraison+professionnel&rh=p_36%3A1000-2000"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-or text-brun font-bold py-3 rounded-xl text-sm no-underline font-sans">
                🛒 Voir les sacs isothermes sur Amazon →
              </a>
              <p className="text-xs text-gray-400 text-center">Environ 15-20€ · Livraison en 1-2 jours</p>
            </div>
            <button className="w-full text-xs text-gray-400 font-sans py-2"
              onClick={() => setSacIsotherme(null)}>← Retour</button>
          </div>
        )}

        {/* Sac OK → Stuart */}
        {sacIsotherme === 'oui' && (
          <div className="space-y-4">
            <div className="bg-brun rounded-2xl p-5 text-center space-y-2">
              <span className="text-4xl block">🛵</span>
              <h2 className="font-serif text-lg font-black text-or">Inscription via Stuart</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                BoucheriesDelivery utilise Stuart pour gérer ses livraisons. Inscrivez-vous directement sur leur plateforme.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
              {['✅ Inscription 100% gratuite', '✅ Livrez quand vous voulez', '✅ Paiement hebdomadaire', '✅ Support 7j/7'].map(item => (
                <p key={item} className="text-sm text-gray-600">{item}</p>
              ))}
            </div>
            <a href="https://stuart.com/fr/devenir-livreur"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-brun text-white font-bold py-4 rounded-2xl text-sm no-underline font-sans">
              🛵 S'inscrire comme livreur Stuart →
            </a>
            <button className="w-full text-xs text-gray-400 font-sans py-2"
              onClick={() => setSacIsotherme(null)}>← Retour</button>
          </div>
        )}
      </div>
    </PageWrapper>
  )


}

function PartenaireSection({ onBack }: { onBack: () => void }) {
  const { addBoucher } = useAccounts()
  const [step, setStep] = useState<'info'|'form'>('info')
  const [form, setForm] = useState({ prenom:'', nom:'', email:'', tel:'', nom_boutique:'', adresse:'', ville:'', siret:'', specialites:'', message:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [siretVerif, setSiretVerif] = useState<'idle'|'loading'|'ok'|'error'>('idle')
  const [siretMsg, setSiretMsg] = useState('')
  const [officialName, setOfficialName] = useState('')
  const siretOk = /^\d{14}$/.test(form.siret.replace(/\s/g,''))

  // Réinitialiser la vérification si le boucher modifie le SIRET ou le nom
  useEffect(() => {
    setSiretVerif('idle')
    setSiretMsg('')
    setOfficialName('')
  }, [form.nom_boutique, form.siret])

  async function verifierSiret() {
    if (!siretOk || !form.nom_boutique.trim()) return
    setSiretVerif('loading')
    setSiretMsg('')
    setOfficialName('')
    try {
      const res = await fetch('/api/verify-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: form.siret.replace(/\s/g,''), nom_boutique: form.nom_boutique }),
      })
      const data = await res.json()
      if (data.verified) {
        setSiretVerif('ok')
        setOfficialName(data.officialName || '')
      } else {
        setSiretVerif('error')
        setSiretMsg(data.error || 'Le SIRET ou le nom ne correspond pas au registre officiel.')
        setOfficialName(data.officialName || '')
      }
    } catch {
      setSiretVerif('error')
      setSiretMsg('Erreur réseau. Vérifiez votre connexion et réessayez.')
    }
  }

  async function soumettre() {
    setLoading(true); setError('')
    try {
      const createRes = await fetch('/api/boucher', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:form.email, nom:form.nom, prenom:form.prenom, nom_boutique:form.nom_boutique, ville:form.ville }) })
      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Erreur création compte')
      addBoucher({ id:'boucher_'+Date.now(), nom:`${form.prenom} ${form.nom}`.trim(), email:form.email, password:createData.password, nom_boutique:form.nom_boutique, ville:form.ville, createdAt:new Date().toISOString() })
      const res = await fetch('/api/connect/onboard', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:form.email, nom_boutique:form.nom_boutique, ville:form.ville }) })
      const data = await res.json()
      if (data.onboardingUrl) window.location.href = data.onboardingUrl
      else throw new Error(data.error || 'Erreur Stripe')
    } catch (e: any) { setError(`Erreur : ${e?.message}`) }
    finally { setLoading(false) }
  }

  if (step === 'info') return (
    <PageWrapper title="🔪 Devenir partenaire" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-5 text-center"><span className="text-4xl block mb-2">🔪</span><h2 className="font-serif text-lg font-black text-or mb-1">Rejoignez le réseau</h2><p className="text-white/70 text-xs">Développez votre CA sans changer votre façon de travailler.</p></div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
          <p className="font-bold text-green-700 text-sm">🎉 Inscription 100% gratuite</p>
          <p className="text-xs text-green-700">✓ Aucun abonnement, aucun frais cachés</p>
          <p className="text-xs text-green-700">✓ Commission uniquement sur les commandes réalisées</p>
        </div>
        <button className="w-full bg-rouge-vif text-white py-4 rounded-2xl font-bold text-sm font-sans" onClick={() => setStep('form')}>🤝 Je veux rejoindre →</button>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="🔪 Votre candidature" onBack={() => setStep('info')}>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">Votre boucherie</h3>
          {[['nom_boutique','Nom de la boucherie *','Boucherie Dupont'],['adresse','Adresse *','12 rue du Marché'],['ville','Ville *','Paris'],['specialites','Spécialités','Charolais, Wagyu…']].map(([k,l,ph]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun" placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}

          {/* Champ SIRET */}
          <div>
            <label className="text-xs font-bold text-brun block mb-1">SIRET *</label>
            <div className="relative">
              <input
                className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono pr-8 ${form.siret ? (siretOk ? 'border-green-400' : 'border-rouge-vif') : 'border-gray-200 focus:border-brun'}`}
                placeholder="123 456 789 00012"
                value={form.siret}
                onChange={e => setForm(f=>({...f,siret:e.target.value}))}
              />
              {form.siret && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">{siretOk ? '✅' : '❌'}</span>}
            </div>
          </div>

          {/* Bouton de vérification SIRET */}
          {siretOk && form.nom_boutique.trim() && siretVerif === 'idle' && (
            <button
              className="w-full text-xs bg-brun/10 text-brun font-bold py-2.5 rounded-xl font-sans flex items-center justify-center gap-2"
              onClick={verifierSiret}
            >
              🔍 Vérifier dans le registre officiel des entreprises
            </button>
          )}
          {siretVerif === 'loading' && (
            <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
              <span className="inline-block animate-spin">⏳</span> Vérification en cours…
            </div>
          )}
          {siretVerif === 'ok' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-0.5">
              <p className="text-xs font-bold text-green-700">✅ Entreprise vérifiée dans le registre officiel</p>
              {officialName && <p className="text-[11px] text-green-600">Nom officiel : {officialName}</p>}
            </div>
          )}
          {siretVerif === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-bold text-red-700">❌ Vérification échouée</p>
              <p className="text-[11px] text-red-600 leading-relaxed">{siretMsg}</p>
              {officialName && <p className="text-[11px] text-gray-500">Nom trouvé dans le registre : <strong>{officialName}</strong></p>}
              <button className="text-[11px] text-brun font-bold font-sans underline" onClick={verifierSiret}>Réessayer</button>
            </div>
          )}

          <div className="bg-or-pale border border-or/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brun mb-1">💳 Coordonnées bancaires (IBAN)</p>
            <p className="text-xs text-gray-500">Votre IBAN sera collecté directement par <strong>Stripe</strong> lors de l'étape suivante. Virements automatiques chaque lundi.</p>
          </div>
        </div>

<div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">Vos coordonnées</h3>
          <div className="grid grid-cols-2 gap-3">
            {[['prenom','Prénom'],['nom','Nom']].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-bold text-brun block mb-1">{l} *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun" value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
          </div>
          {[['email','Email *','vous@email.fr'],['tel','Téléphone *','+33 6 00 00 00 00']].map(([k,l,ph]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun" placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
        </div>

        {siretVerif !== 'ok' && siretOk && form.nom_boutique && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">Vous devez vérifier votre SIRET avant de pouvoir envoyer votre candidature.</p>
          </div>
        )}

        <button
          className="w-full bg-rouge-vif text-white py-4 rounded-2xl font-bold text-sm font-sans disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!form.nom_boutique||!form.prenom||!form.email||!form.tel||!form.ville||!siretOk||siretVerif!=='ok'||loading}
          onClick={soumettre}
        >
          {loading ? '⏳ Envoi…' : '🤝 Envoyer ma candidature'}
        </button>
        {error && <p className="text-center text-xs text-rouge-vif">{error}</p>}
      </div>
    </PageWrapper>
  )
}
