'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'
import { useAuth } from '@/store/auth'
import { useAccounts } from '@/store/accounts'
import AuthModal from '@/components/ui/AuthModal'
import { useUserStore } from '@/store/userStore'
type Section =
  | 'profil' | 'adresses' | 'notifs' | 'favoris'
  | 'commandes' | 'avis' | 'paiement'
  | 'support' | 'contact' | 'confidentialite' | 'cgu'
  | 'livreur' | 'partenaire' | 'parrainage'
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
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null
  const initSection = searchParams?.get('section') as Section || null
  const [section, setSection] = useState<Section>(initSection)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

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
  if (section === 'parrainage')       return <ParrainageSection onBack={() => setSection(null)} />

  const sections = [
    {
      titre: 'Mon compte',
      items: [
        { ico: '👤', label: 'Mon profil', sub: user?.nom || 'Modifier mes informations', action: () => setSection('profil') },
        { ico: '📍', label: 'Mes adresses', sub: '1 adresse enregistrée', action: () => setSection('adresses') },
        { ico: '🔔', label: 'Notifications', sub: 'Gérer mes préférences', action: () => setSection('notifs') },
        { ico: '🎁', label: 'Parrainage', sub: 'Invitez vos amis, gagnez 5 €', action: () => setSection('parrainage') },
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
        {user && (
          <button className="bg-creme border border-gris-bd text-brun text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0"
            onClick={() => setSection('profil')}>Modifier</button>
        )}
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
          <button className="w-full bg-brun text-white font-bold py-3.5 rounded-2xl text-sm font-sans flex items-center justify-center gap-2"
            onClick={() => setAuthOpen(true)}>🔐 Se connecter</button>
        ) : !logoutConfirm ? (
          <button className="w-full bg-rouge-pale text-rouge-vif font-bold py-3.5 rounded-2xl text-sm transition-colors active:bg-red-100 font-sans"
            onClick={() => setLogoutConfirm(true)}>🚪 Se déconnecter</button>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-rouge-vif">
            <p className="font-bold text-brun text-sm text-center mb-1">Confirmer la déconnexion ?</p>
            <p className="text-xs text-gray-400 text-center mb-4">Vous devrez vous reconnecter pour passer commande.</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans"
                onClick={() => setLogoutConfirm(false)}>Annuler</button>
              <button className="flex-1 bg-rouge-vif text-white font-bold py-2.5 rounded-xl text-sm font-sans"
                onClick={() => { logout(); setLogoutConfirm(false); router.push('/') }}>Déconnecter</button>
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

// ══════════════════════════════════════════════════════════════════════════════
// PROFIL
// ══════════════════════════════════════════════════════════════════════════════
function ProfilSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { getProfil, saveProfil } = useUserStore()
  const saved_profil = user?.email ? getProfil(user.email) : null
  const [form, setForm] = useState({
    prenom: saved_profil?.prenom || user?.nom?.split(' ')[0] || '',
    nom:    saved_profil?.nom    || user?.nom?.split(' ').slice(1).join(' ') || '',
    email:  saved_profil?.email  || user?.email || '',
    tel:    saved_profil?.tel    || '',
  })
  const [saved, setSaved] = useState(false)

  return (
    <PageWrapper title="👤 Mon profil" onBack={onBack}>
      <div className="text-center mb-5">
        <div className="w-16 h-16 rounded-full bg-brun text-white text-3xl flex items-center justify-center mx-auto mb-2">👤</div>
        <button className="text-xs text-or font-semibold">Changer la photo</button>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {[['prenom', 'Prénom', 'Jean'], ['nom', 'Nom', 'Dupont'], ['email', 'Email', 'vous@email.fr'], ['tel', 'Téléphone', '+33 6 00 00 00 00']].map(([k, l, ph]) => (
          <div key={k}>
            <label className="text-xs font-bold text-brun block mb-1">{l}</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans"
              placeholder={ph} value={(form as any)[k]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
          </div>
        ))}
        {saved && <p className="text-green-600 text-xs font-semibold text-center">✅ Modifications enregistrées !</p>}
        <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans"
          onClick={() => {
            if (user?.email) saveProfil(user.email, form)
            setSaved(true); setTimeout(() => setSaved(false), 2500)
          }}>Enregistrer</button>
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ADRESSES
// ══════════════════════════════════════════════════════════════════════════════
function AdressesSection({ onBack }: { onBack: () => void }) {
  type Adresse = { id: string; label: string; rue: string; cp: string; ville: string; complement: string; defaut: boolean }

  const { user } = useAuth()
  const { getAdresses, saveAdresses } = useUserStore()
  const [adresses, setAdresses] = useState<Adresse[]>(() => user?.email ? getAdresses(user.email) : [])
  const [editId, setEditId] = useState<string | null>(null)
  const [ajoutOpen, setAjoutOpen] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ label: '🏠 Domicile', rue: '', cp: '', ville: '', complement: '' })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }
  function updateAdresses(fn: (prev: Adresse[]) => Adresse[]) {
    setAdresses(prev => {
      const next = fn(prev)
      if (user?.email) saveAdresses(user.email, next)
      return next
    })
  }

  async function detecterPosition() {
    if (!navigator.geolocation) { showToast('❌ Géolocalisation non disponible'); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          const d = await res.json()
          const addr = d.address || {}
          const rue = [addr.house_number, addr.road].filter(Boolean).join(' ')
          const cp = addr.postcode || ''
          const ville = addr.city || addr.town || addr.village || addr.suburb || ''
          const existingIdx = adresses.findIndex(a => a.label === '🏠 Domicile')
          if (existingIdx >= 0) {
            setAdresses(prev => prev.map((a, i) => i === existingIdx ? { ...a, rue, cp, ville } : a))
          } else {
            updateAdresses(prev => [...prev, { id: Date.now().toString(), label: '🏠 Domicile', rue, cp, ville, complement: '', defaut: prev.length === 0 }])
          }
          showToast('📍 Adresse mise à jour !')
        } catch { showToast('❌ Impossible de récupérer l\'adresse') }
        setGeoLoading(false)
      },
      () => { showToast('❌ Géolocalisation refusée'); setGeoLoading(false) },
      { timeout: 8000 }
    )
  }

  function ajouterAdresse() {
    if (!form.rue.trim() || !form.ville.trim()) { showToast('⚠️ Rue et ville sont requises'); return }
    updateAdresses(prev => [...prev, { id: Date.now().toString(), label: form.label, rue: form.rue, cp: form.cp, ville: form.ville, complement: form.complement, defaut: prev.length === 0 }])
    setForm({ label: '🏠 Domicile', rue: '', cp: '', ville: '', complement: '' })
    setAjoutOpen(false)
    showToast('✅ Adresse ajoutée !')
  }

  function sauvegarderEdit(id: string, updated: Partial<Adresse>) {
    updateAdresses(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
    setEditId(null)
    showToast('✅ Adresse mise à jour !')
  }

  function supprimerAdresse(id: string) {
    updateAdresses(prev => {
      const next = prev.filter(a => a.id !== id)
      if (next.length > 0 && !next.some(a => a.defaut)) next[0].defaut = true
      return next
    })
  }

  function setDefaut(id: string) { updateAdresses(prev => prev.map(a => ({ ...a, defaut: a.id === id }))) }

  const LABELS = ['🏠 Domicile', '💼 Bureau', '❤️ Proche', '📍 Autre']

  return (
    <PageWrapper title="📍 Mes adresses" onBack={onBack}>
      <div className="space-y-3">
        <button
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-brun text-brun text-sm font-bold font-sans transition-all active:bg-brun active:text-white ${geoLoading ? 'opacity-60' : ''}`}
          onClick={detecterPosition} disabled={geoLoading}>
          {geoLoading ? '⏳ Localisation en cours…' : '📍 Utiliser ma position actuelle'}
        </button>

        {adresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center text-gray-400 shadow-sm">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-sm">Aucune adresse enregistrée.</p>
          </div>
        ) : adresses.map(a => (
          <div key={a.id}>
            {editId === a.id
              ? <EditAdresseForm adresse={a} labels={LABELS} onSave={updated => sauvegarderEdit(a.id, updated)} onCancel={() => setEditId(null)} />
              : <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-brun text-sm">{a.label}</p>
                        {a.defaut && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Défaut</span>}
                      </div>
                      <p className="text-xs text-gray-500">{a.rue}</p>
                      {a.complement && <p className="text-xs text-gray-400">{a.complement}</p>}
                      <p className="text-xs text-gray-500">{a.cp} {a.ville}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-2.5 py-1.5 rounded-xl font-sans" onClick={() => setEditId(a.id)}>✏️</button>
                      <button className="bg-red-50 border border-red-200 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-xl font-sans" onClick={() => supprimerAdresse(a.id)}>🗑️</button>
                    </div>
                  </div>
                  {!a.defaut && <button className="mt-2 text-xs text-or font-semibold" onClick={() => setDefaut(a.id)}>Définir comme adresse par défaut</button>}
                </div>
            }
          </div>
        ))}

        {ajoutOpen ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-brun text-base">Nouvelle adresse</h3>
            <div>
              <label className="text-xs font-bold text-brun block mb-1.5">Type</label>
              <div className="flex flex-wrap gap-2">
                {LABELS.map(l => (
                  <button key={l} className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all font-sans ${form.label === l ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                    onClick={() => setForm(f => ({ ...f, label: l }))}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Rue et numéro *</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="12 rue de la Roquette" value={form.rue} onChange={e => setForm(f => ({ ...f, rue: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Complément</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="Bât. A, 3e étage, digicode…" value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Code postal</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="75011" value={form.cp} onChange={e => setForm(f => ({ ...f, cp: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Ville *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Paris" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans" onClick={() => setAjoutOpen(false)}>Annuler</button>
              <button className="flex-[2] bg-brun text-white font-bold py-2.5 rounded-xl text-sm font-sans active:bg-rouge-vif" onClick={ajouterAdresse}>Ajouter</button>
            </div>
          </div>
        ) : (
          <button className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-semibold text-gray-400 font-sans active:border-brun active:text-brun transition-colors"
            onClick={() => setAjoutOpen(true)}>+ Ajouter une adresse manuellement</button>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brun text-white px-4 py-2.5 rounded-xl text-sm font-semibold z-50 shadow-xl whitespace-nowrap">{toast}</div>
      )}
    </PageWrapper>
  )
}

function EditAdresseForm({ adresse, labels, onSave, onCancel }: {
  adresse: { label: string; rue: string; cp: string; ville: string; complement: string }
  labels: string[]; onSave: (u: any) => void; onCancel: () => void
}) {
  const [form, setForm] = useState({ ...adresse })
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-brun space-y-3">
      <h3 className="font-serif font-bold text-brun text-base">Modifier l'adresse</h3>
      <div className="flex flex-wrap gap-2">
        {labels.map(l => (
          <button key={l} className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all font-sans ${form.label === l ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
            onClick={() => setForm(f => ({ ...f, label: l }))}>{l}</button>
        ))}
      </div>
      <div>
        <label className="text-xs font-bold text-brun block mb-1">Rue et numéro</label>
        <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
          value={form.rue} onChange={e => setForm(f => ({ ...f, rue: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-bold text-brun block mb-1">Complément</label>
        <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
          placeholder="Bât., étage, digicode…" value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-brun block mb-1">Code postal</label>
          <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
            value={form.cp} onChange={e => setForm(f => ({ ...f, cp: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-bold text-brun block mb-1">Ville</label>
          <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
            value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans" onClick={onCancel}>Annuler</button>
        <button className="flex-[2] bg-brun text-white font-bold py-2.5 rounded-xl text-sm font-sans" onClick={() => onSave(form)}>Enregistrer</button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function NotifsSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { getNotifPrefs, saveNotifPrefs } = useUserStore()
  const [prefs, setPrefs] = useState(() => user?.email ? getNotifPrefs(user.email) : { livraison: true, promos: true, nouveaux: false, rappels: true, rapport: false })
  const items = [
    { key: 'livraison', label: 'Suivi de livraison',    sub: 'Statut en temps réel de vos commandes' },
    { key: 'promos',    label: 'Promotions & offres',   sub: 'Bons plans des boucheries partenaires' },
    { key: 'nouveaux',  label: 'Nouvelles boucheries',  sub: 'Nouveaux partenaires dans votre quartier' },
    { key: 'rappels',   label: 'Rappels de panier',     sub: 'Panier non finalisé' },
    { key: 'rapport',   label: 'Rapport hebdomadaire',  sub: 'Résumé de vos achats chaque semaine' },
  ]
  const NOTIFS_DEMO = [
    { ico: '🛵', titre: 'Votre livreur est en route !', sub: 'Commande #1042 · Arrivée dans ~8 min', time: 'Il y a 5 min', lu: false },
    { ico: '✅', titre: 'Commande #1041 prête !',       sub: 'Comptoir du Veau · Présentez-vous en caisse', time: 'Il y a 2h', lu: false },
    { ico: '🏷️', titre: '-20% sur le Wagyu ce weekend', sub: 'Bœuf & Tradition · Offre limitée', time: 'Hier', lu: true },
    { ico: '⭐', titre: 'Merci pour votre avis !',       sub: 'Votre avis sur Maison Dupont a été publié', time: 'Il y a 2 jours', lu: true },
  ]
  return (
    <PageWrapper title="🔔 Notifications" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-or-pale border-b border-gris-bd"><p className="text-xs font-bold text-brun">Préférences</p></div>
          {items.map((item, i) => (
            <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brun">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <button
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${(prefs as any)[item.key] ? 'bg-green-400' : 'bg-gray-200'}`}
                onClick={() => setPrefs(p => {
                  const next = { ...p, [item.key]: !(p as any)[item.key] }
                  if (user?.email) saveNotifPrefs(user.email, next)
                  return next
                })}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(prefs as any)[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
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
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FAVORIS
// ══════════════════════════════════════════════════════════════════════════════
function FavorisSection({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const [favoris, setFavoris] = useState<{ id: number; nom: string; note: number; img: string }[]>([])
  return (
    <PageWrapper title="❤️ Boucheries favorites" onBack={onBack}>
      {favoris.length === 0
        ? <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-3">❤️</span><p className="text-sm">Aucune boucherie favorite pour l'instant.</p></div>
        : <div className="space-y-3">
            {favoris.map(f => (
              <div key={f.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex">
                <img src={f.img} alt={f.nom} className="w-20 h-20 object-cover flex-shrink-0" />
                <div className="flex-1 p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brun text-sm">{f.nom}</p>
                    <p className="text-xs text-or">⭐ {f.note}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-xl font-sans" onClick={() => router.push('/')}>Commander</button>
                    <button className="text-red-400 text-lg" onClick={() => setFavoris(prev => prev.filter(x => x.id !== f.id))}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// HISTORIQUE COMMANDES
// ══════════════════════════════════════════════════════════════════════════════
const COMMANDES_DATA = [
  { id: '#1042', boucherie: 'Maison Dupont', date: new Date().toISOString().split('T')[0], total: 46.30, frais: 2.90, creneau: 'Dès que possible', status: 'delivery', mode: 'livraison',
    items: [{ nom: 'Entrecôte Charolais', icon: '🥩', qty: 2, decoupe: 'Épaisse (2cm) · Marinée herbes' }, { nom: 'Merguez Maison', icon: '🌶️', qty: 1, decoupe: 'Extra-épicées' }] },
  { id: '#1041', boucherie: 'Comptoir du Veau', date: new Date().toISOString().split('T')[0], total: 24.50, frais: 0, creneau: 'Aujourd\'hui 12h30', status: 'ready', mode: 'click_collect',
    items: [{ nom: 'Filet de Bœuf', icon: '🍖', qty: 1, decoupe: 'En médaillons · Nature' }] },
  { id: '#1038', boucherie: 'Maison Dupont', date: '2026-05-08', total: 44.80, frais: 2.90, creneau: 'Dès que possible', status: 'done', mode: 'livraison',
    items: [{ nom: 'Côtes de Porc', icon: '🍖', qty: 4, decoupe: 'Avec os · Nature' }] },
  { id: '#1025', boucherie: 'Bœuf & Tradition', date: '2026-04-30', total: 97.40, frais: 3.50, creneau: 'Aujourd\'hui 19h–20h', status: 'done', mode: 'livraison',
    items: [{ nom: 'Wagyu A5 – 200g', icon: '⭐', qty: 1, decoupe: 'Fine (4mm)' }, { nom: 'T-Bone Maturé 60j', icon: '🥩', qty: 1, decoupe: 'Entier' }] },
]

function CommandesSection({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const { isDemo } = useAuth()
  const [filtre, setFiltre] = useState<'toutes'|'encours'|'livrees'>('toutes')
  const data = isDemo() ? COMMANDES_DATA : []
  const filtered = filtre === 'encours' ? data.filter(o => o.status !== 'done') : filtre === 'livrees' ? data.filter(o => o.status === 'done') : data

  return (
    <PageWrapper title="📦 Mes commandes" onBack={onBack}>
      <div className="space-y-4">
        {data.length > 0 && (
          <div className="flex gap-2">
            {([['toutes', 'Toutes'], ['encours', 'En cours'], ['livrees', 'Livrées']] as const).map(([v, l]) => (
              <button key={v}
                className={'flex-1 py-2 rounded-xl text-xs font-bold font-sans border transition-all ' + (filtre === v ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gris-bd')}
                onClick={() => setFiltre(v)}>{l}</button>
            ))}
          </div>
        )}
        {filtered.length === 0
          ? <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">📦</span>
              <p className="text-sm">Aucune commande pour l'instant.</p>
              <button className="mt-4 bg-brun text-white px-5 py-2 rounded-xl text-sm font-bold font-sans" onClick={() => router.push('/')}>Découvrir les boucheries</button>
            </div>
          : filtered.map(o => (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gris-bd flex justify-between items-center">
                <div>
                  <span className="font-black text-brun text-sm">{o.id}</span>
                  <span className="text-gray-400 text-xs ml-2">{new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                </div>
                <span className={'text-[11px] font-bold px-2.5 py-1 rounded-full ' + (o.status === 'done' ? 'bg-gray-100 text-gray-500' : o.status === 'delivery' ? 'bg-orange-100 text-orange-600' : o.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')}>
                  {o.status === 'done' ? '✅ Livrée' : o.status === 'delivery' ? '🛵 En livraison' : o.status === 'ready' ? '📦 Prête' : '🔪 En préparation'}
                </span>
              </div>
              <div className="px-4 py-3 border-b border-gris-bd">
                <p className="text-xs font-semibold text-brun-clair mb-1">🔪 {o.boucherie} · {o.mode === 'livraison' ? '🛵 Livraison' : '🏪 Click & Collect'}</p>
                <p className="text-xs text-or mb-2">🕐 {o.creneau}</p>
                <div className="flex flex-wrap gap-1.5">
                  {o.items.map((it, i) => (
                    <span key={i} className="bg-creme text-brun text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      {it.icon} {it.nom} ×{it.qty}
                      {it.decoupe && <span className="text-or text-[10px]">✂️</span>}
                    </span>
                  ))}
                </div>
                {o.status === 'delivery' && (
                  <div className="bg-or-pale border border-or/20 rounded-xl p-2.5 mt-2 flex items-center gap-2">
                    <span className="text-lg">🛵</span>
                    <div><p className="text-xs font-bold text-brun">Votre livreur est en route</p><p className="text-[10px] text-gray-400">Arrivée estimée dans ~8 min</p></div>
                  </div>
                )}
                {o.status === 'ready' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 mt-2 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <div><p className="text-xs font-bold text-green-700">Votre commande est prête !</p><p className="text-[10px] text-gray-400">Présentez le {o.id} en caisse</p></div>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-brun text-sm">{o.total.toFixed(2)} €</p>
                  <p className="text-xs text-gray-400">dont {o.frais.toFixed(2)} € livraison</p>
                </div>
                <div className="flex gap-2">
                  {o.status === 'delivery' && <button className="bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl font-sans" onClick={() => router.push(`/suivi?numero=${o.id}`)}>🗺️ Suivre</button>}
                  {o.status === 'ready' && <button className="bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl font-sans" onClick={() => router.push(`/confirmation?numero=${o.id}&bid=1`)}>🗺️ Y aller</button>}
                  <button className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-3 py-2 rounded-xl font-sans" onClick={() => router.push('/')}>🔄 Re-commander</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// AVIS
// ══════════════════════════════════════════════════════════════════════════════
const AVIS_DEMO = [
  { id: 'rv1', boucherie: 'Maison Dupont', produit: 'Entrecôte Charolais', note: 5, texte: 'Entrecôte incroyable, fondante et goûteuse. Livraison rapide et viande bien emballée !', date: '2026-05-08' },
  { id: 'rv2', boucherie: 'Bœuf & Tradition', produit: 'Wagyu A5', note: 5, texte: 'Qualité exceptionnelle. Une expérience unique.', date: '2026-04-30' },
]

function AvisSection({ onBack }: { onBack: () => void }) {
  const { user, isDemo } = useAuth()
  const { getAvis, saveAvis } = useUserStore()
  const [avis, setAvis] = useState(() => {
    if (!user?.email) return isDemo() ? AVIS_DEMO : []
    const stored = getAvis(user.email)
    return stored.length > 0 ? stored : (isDemo() ? AVIS_DEMO : [])
  })
  function updateAvis(fn: (prev: typeof avis) => typeof avis) {
    setAvis(prev => { const next = fn(prev); if (user?.email) saveAvis(user.email, next); return next })
  }
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  return (
    <PageWrapper title="⭐ Mes avis" onBack={onBack}>
      {avis.length === 0
        ? <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-3">⭐</span><p className="text-sm">Vous n'avez pas encore laissé d'avis.</p></div>
        : <div className="space-y-4">
            {avis.map(a => (
              <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-bold text-brun text-sm">{a.boucherie}</p>
                    <p className="text-xs text-gray-400">{a.produit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-or text-sm">{'⭐'.repeat(a.note)}</span>
                    <button className="text-gray-300 text-xs" onClick={() => updateAvis(prev => prev.filter(x => x.id !== a.id))}>🗑️</button>
                  </div>
                </div>
                {editId === a.id
                  ? <div className="mt-2">
                      <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans outline-none focus:border-brun resize-none" rows={3}
                        value={editText} onChange={e => setEditText(e.target.value)} />
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 bg-gris-bd text-brun text-xs font-semibold py-2 rounded-xl font-sans" onClick={() => setEditId(null)}>Annuler</button>
                        <button className="flex-1 bg-brun text-white text-xs font-bold py-2 rounded-xl font-sans"
                          onClick={() => { updateAvis(prev => prev.map(x => x.id === a.id ? { ...x, texte: editText } : x)); setEditId(null) }}>Enregistrer</button>
                      </div>
                    </div>
                  : <>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{a.texte}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-300">{new Date(a.date).toLocaleDateString('fr-FR')}</p>
                        <button className="text-xs text-or font-semibold" onClick={() => { setEditId(a.id); setEditText(a.texte) }}>✏️ Modifier</button>
                      </div>
                    </>
                }
              </div>
            ))}
          </div>
      }
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MOYENS DE PAIEMENT
// ══════════════════════════════════════════════════════════════════════════════
function PaiementSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { getCartes, saveCartes } = useUserStore()
  const [cartes, setCartes] = useState<{ id: string; last4: string; expiry: string; type: string; defaut: boolean }[]>(() => user?.email ? getCartes(user.email) : [])
  const [ajoutOpen, setAjoutOpen] = useState(false)
  const [form, setForm] = useState({ numero: '', titulaire: '', expiry: '', cvv: '' })
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (form.numero.replace(/\s/g, '').length !== 16) e.numero = 'Numéro invalide (16 chiffres)'
    if (!form.titulaire.trim()) e.titulaire = 'Requis'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Format MM/AA'
    if (form.cvv.length < 3) e.cvv = 'CVV invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function ajouterCarte() {
    if (!validate()) return
    const last4 = form.numero.replace(/\s/g, '').slice(-4)
    const type = form.numero.startsWith('4') ? 'Visa' : form.numero.startsWith('5') ? 'Mastercard' : 'Carte'
    setCartes(prev => {
      const next = [...prev, { id: Date.now().toString(), last4, expiry: form.expiry, type, defaut: prev.length === 0 }]
      if (user?.email) saveCartes(user.email, next)
      return next
    })
    setForm({ numero: '', titulaire: '', expiry: '', cvv: '' })
    setAjoutOpen(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PageWrapper title="💳 Moyens de paiement" onBack={onBack}>
      <div className="space-y-4">
        {saved && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"><p className="text-green-700 text-sm font-semibold">✅ Carte ajoutée avec succès !</p></div>}
        {cartes.length === 0
          ? <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <span className="text-4xl block mb-3">💳</span>
              <p className="font-bold text-brun text-sm mb-1">Aucune carte enregistrée</p>
              <p className="text-xs text-gray-400 mb-4">Ajoutez une carte pour passer commande rapidement.</p>
            </div>
          : cartes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-br from-brun to-brun-clair rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.type === 'Visa' ? 'VISA' : c.type === 'Mastercard' ? 'MC' : '💳'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-brun text-sm">{c.type} •••• {c.last4}</p>
                  <p className="text-xs text-gray-400">Expire {c.expiry}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.defaut ? <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Défaut</span>
                    : <button className="text-xs text-or font-semibold" onClick={() => setCartes(prev => { const n = prev.map(x => ({ ...x, defaut: x.id === c.id })); if (user?.email) saveCartes(user.email, n); return n })}>Définir</button>}
                  <button className="text-gray-300 text-sm" onClick={() => setCartes(prev => { const n = prev.filter(x => x.id !== c.id); if (user?.email) saveCartes(user.email, n); return n })}>🗑️</button>
                </div>
              </div>
            </div>
          ))
        }
        {!ajoutOpen && <button className="w-full bg-brun text-white font-bold py-3.5 rounded-2xl text-sm font-sans flex items-center justify-center gap-2" onClick={() => setAjoutOpen(true)}>+ Ajouter une carte</button>}
        {ajoutOpen && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-brun text-base">Nouvelle carte</h3>
            <div className="bg-gradient-to-br from-brun to-brun-clair rounded-2xl p-4 text-white">
              <div className="w-8 h-5 bg-or rounded mb-3" />
              <p className="text-base font-bold tracking-widest mb-2 font-mono">{form.numero || '•••• •••• •••• ••••'}</p>
              <div className="flex justify-between text-xs opacity-75">
                <span>{form.titulaire || 'TITULAIRE'}</span>
                <span>{form.expiry || 'MM/AA'}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Numéro de carte</label>
              <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono ${errors.numero ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                placeholder="1234 5678 9012 3456" maxLength={19} value={form.numero}
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setForm(f => ({ ...f, numero: v.replace(/(.{4})/g, '$1 ').trim() })) }} />
              {errors.numero && <p className="text-red-500 text-xs mt-0.5">{errors.numero}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Titulaire</label>
              <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none ${errors.titulaire ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                placeholder="JEAN DUPONT" value={form.titulaire} onChange={e => setForm(f => ({ ...f, titulaire: e.target.value.toUpperCase() }))} />
              {errors.titulaire && <p className="text-red-500 text-xs mt-0.5">{errors.titulaire}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Expiration</label>
                <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono ${errors.expiry ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                  placeholder="MM/AA" maxLength={5} value={form.expiry}
                  onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2); setForm(f => ({ ...f, expiry: v })) }} />
                {errors.expiry && <p className="text-red-500 text-xs mt-0.5">{errors.expiry}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-brun block mb-1">CVV</label>
                <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono ${errors.cvv ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                  placeholder="•••" maxLength={4} type="password" value={form.cvv}
                  onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                {errors.cvv && <p className="text-red-500 text-xs mt-0.5">{errors.cvv}</p>}
              </div>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">🔒 Vos données sont chiffrées et sécurisées</p>
            <div className="flex gap-3 pt-1">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans" onClick={() => { setAjoutOpen(false); setErrors({}) }}>Annuler</button>
              <button className="flex-[2] bg-rouge-vif text-white font-bold py-3 rounded-xl text-sm font-sans" onClick={ajouterCarte}>Ajouter la carte</button>
            </div>
          </div>
        )}
        <div className="bg-or-pale rounded-2xl p-3 border border-or/20">
          <p className="text-xs text-brun-clair leading-relaxed">🔒 <strong>Paiement sécurisé par Stripe.</strong> Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs.</p>
        </div>
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SUPPORT & FAQ
// ══════════════════════════════════════════════════════════════════════════════
function SupportSection({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: "Comment passer ma première commande ?", a: "Ouvrez l'app, activez la géolocalisation, sélectionnez une boucherie, choisissez vos produits et personnalisez votre découpe. Ajoutez au panier, renseignez votre adresse, choisissez un créneau et procédez au paiement sécurisé." },
    { q: "Quelle est la zone de livraison ?", a: "BoucherieDelivery livre dans un rayon de 10 km autour des boucheries partenaires. Activez la géolocalisation pour voir les boucheries disponibles." },
    { q: "La chaîne du froid est-elle garantie ?", a: "Oui. Tous nos livreurs utilisent des sacs isothermes réfrigérés homologués. La livraison est effectuée en moins de 45 minutes." },
    { q: "Puis-je personnaliser ma découpe ?", a: "Absolument ! Pour chaque produit, choisissez le type de découpe et la préparation. Vous pouvez aussi laisser une note spécifique au boucher." },
    { q: "Que faire si je ne suis pas satisfait ?", a: "Contactez-nous dans les 2h suivant la livraison. Nous procéderons à un remboursement ou remplacement selon votre préférence." },
    { q: "Comment annuler une commande ?", a: "Une commande peut être annulée dans les 5 minutes suivant sa validation. Remboursement intégral sous 3-5 jours ouvrés." },
  ]
  return (
    <PageWrapper title="🆘 Support & FAQ" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-4 text-center">
          <p className="text-white font-bold text-sm mb-1">Besoin d'aide immédiate ?</p>
          <p className="text-white/60 text-xs mb-3">Réponse sous 2h en jours ouvrés</p>
          <div className="flex gap-2 justify-center">
            <a href="mailto:support@boucheriedelivery.fr" className="bg-or text-brun text-xs font-bold px-4 py-2 rounded-xl no-underline">✉️ Email</a>
            <a href="tel:+33100000000" className="bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl no-underline">📞 Appel</a>
          </div>
        </div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Questions fréquentes</p>
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

// ══════════════════════════════════════════════════════════════════════════════
// NOUS CONTACTER
// ══════════════════════════════════════════════════════════════════════════════
function ContactSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ sujet: 'commande', nom: user?.nom || '', email: user?.email || '', message: '' })
  const [sent, setSent] = useState(false)

  const sujets = [
    { val: 'commande', label: '📦 Problème avec une commande' },
    { val: 'livraison', label: '🛵 Problème de livraison' },
    { val: 'paiement', label: '💳 Problème de paiement' },
    { val: 'partenariat', label: '🔪 Devenir boucherie partenaire' },
    { val: 'suggestion', label: '💡 Suggestion' },
    { val: 'autre', label: '❓ Autre demande' },
  ]

  if (sent) return (
    <PageWrapper title="✉️ Nous contacter" onBack={onBack}>
      <div className="text-center py-14">
        <span className="text-6xl block mb-4">✅</span>
        <h2 className="font-serif text-xl font-bold text-brun mb-2">Message envoyé !</h2>
        <p className="text-gray-400 text-sm mb-6">Notre équipe vous répondra sous 2h.</p>
        <button className="bg-brun text-white px-6 py-3 rounded-xl font-bold text-sm font-sans" onClick={onBack}>← Retour</button>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="✉️ Nous contacter" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-2xl">💬</span>
          <div>
            <p className="text-white font-bold text-sm">Réponse garantie sous 2h</p>
            <p className="text-white/60 text-xs mt-0.5">Lun–Ven 8h–20h · Sam 9h–18h · Dim 10h–16h</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-brun block mb-2">Sujet</label>
            <div className="space-y-1.5">
              {sujets.map(s => (
                <label key={s.val} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.sujet === s.val ? 'border-brun bg-or-pale' : 'border-gray-100'}`}>
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
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Nom</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="Votre nom" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="vous@email.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-brun block mb-1">Message</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none"
              rows={4} placeholder="Décrivez votre demande…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
          <button className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans disabled:bg-gray-300"
            disabled={!form.nom || !form.email || !form.message} onClick={() => setSent(true)}>✉️ Envoyer</button>
        </div>
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIDENTIALITÉ
// ══════════════════════════════════════════════════════════════════════════════
function ConfidentialiteSection({ onBack }: { onBack: () => void }) {
  return (
    <PageWrapper title="🔒 Confidentialité" onBack={onBack}>
      <div className="space-y-3">
        <div className="bg-or-pale border border-or/20 rounded-xl p-3"><p className="text-xs text-brun-clair font-semibold">Dernière mise à jour : 13 mai 2026 · Conforme RGPD</p></div>
        {[
          { t: "1. Responsable du traitement", c: "BoucherieDelivery SAS est responsable du traitement de vos données personnelles. Contact : privacy@boucheriedelivery.fr" },
          { t: "2. Données collectées", c: "Nous collectons uniquement les données nécessaires : identité, adresses de livraison, historique de commandes et géolocalisation (avec votre consentement). Vos données bancaires sont gérées exclusivement par Stripe." },
          { t: "3. Finalités", c: "Vos données servent à traiter vos commandes, vous envoyer des notifications, améliorer le service et respecter nos obligations légales." },
          { t: "4. Durée de conservation", c: "Données de compte : 3 ans après suppression. Commandes : 5 ans (obligation légale). Géolocalisation : non conservée, temps réel uniquement." },
          { t: "5. Vos droits", c: "Accès, rectification, effacement, portabilité, opposition. Contactez-nous : privacy@boucheriedelivery.fr. Réclamation possible auprès de la CNIL (www.cnil.fr)." },
          { t: "6. Partage des données", c: "Vos données ne sont jamais vendues. Partagées uniquement avec les boucheries partenaires, Stripe (paiement) et Supabase (hébergement EU)." },
          { t: "7. Sécurité", c: "Chiffrement SSL/TLS, hébergement en Europe. En cas de violation, vous serez notifié sous 72h." },
          { t: "8. Contact DPO", c: "Délégué à la Protection des Données : dpo@boucheriedelivery.fr" },
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

// ══════════════════════════════════════════════════════════════════════════════
// CGU
// ══════════════════════════════════════════════════════════════════════════════
function CguSection({ onBack }: { onBack: () => void }) {
  return (
    <PageWrapper title="📋 CGU" onBack={onBack}>
      <div className="space-y-3">
        <div className="bg-or-pale border border-or/20 rounded-xl p-3"><p className="text-xs text-brun-clair font-semibold">En vigueur depuis le 13 mai 2026</p></div>
        {[
          { t: "1. Objet", c: "Les CGU régissent l'utilisation de BoucherieDelivery, accessible via l'app mobile et le site web." },
          { t: "2. Description du service", c: "BoucherieDelivery est une marketplace mettant en relation consommateurs et boucheries artisanales." },
          { t: "3. Inscription", c: "Gratuite, ouverte aux personnes majeures. Vous êtes responsable de vos identifiants." },
          { t: "4. Commandes & paiement", c: "Prix en euros TTC. Paiement dû à la validation de la commande via Stripe." },
          { t: "5. Livraison", c: "Délais indicatifs (25–55 min). Chaîne du froid garantie. En cas de retard > 30 min, annulation sans frais possible." },
          { t: "6. Droit de rétractation", c: "Non applicable aux denrées périssables (art. L.221-28 Code consommation)." },
          { t: "7. Responsabilités", c: "Les boucheries sont seules responsables de la qualité et conformité sanitaire de leurs produits." },
          { t: "8. Propriété intellectuelle", c: "Tous les éléments de BoucherieDelivery sont protégés. Toute reproduction sans autorisation est interdite." },
          { t: "9. Droit applicable", c: "Droit français. Tribunaux de Paris compétents." },
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

// ── Composant upload de document ──────────────────────────────────────────────
function DocUpload({ label, sublabel, required, file, onChange }: {
  label: string; sublabel: string; required?: boolean; file: File | null; onChange: (f: File | null) => void
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <label className="text-xs font-bold text-brun">{label} {required && <span className="text-rouge-vif">*</span>}</label>
          <p className="text-[10px] text-gray-400">{sublabel}</p>
        </div>
        {file && <span className="text-green-500 text-sm flex-shrink-0 ml-2">✅</span>}
      </div>
      {file ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <span className="text-green-600 text-sm">📄</span>
          <span className="text-xs text-green-700 font-semibold flex-1 truncate">{file.name}</span>
          <button className="text-gray-400 text-xs flex-shrink-0 font-sans" onClick={() => onChange(null)}>✕</button>
        </div>
      ) : (
        <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-3 py-3 cursor-pointer hover:border-brun hover:bg-creme transition-all">
          <span className="text-xl">📎</span>
          <span className="text-xs text-gray-400 font-semibold">Choisir un fichier (PDF, JPG, PNG)</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} />
        </label>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DEVENIR LIVREUR
// ══════════════════════════════════════════════════════════════════════════════
function LivreurSection({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    prenom:'', nom:'', email:'', tel:'', ville:'',
    vehicule:'velo_elec', siret:'',
    permis: false, disponibilite:'', message:''
  })
  const [docs, setDocs] = useState<Record<string, File | null>>({ cni: null, siret_doc: null, permis_doc: null, carte_grise: null })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [step, setStep]       = useState<'info'|'form'>('info')
  const [stripeStep, setStripeStep] = useState(false)

  const needsPermis = ['scooter','voiture'].includes(form.vehicule)

  function setDoc(key: string, file: File | null) { setDocs(d => ({ ...d, [key]: file })) }
  function docValide() {
    if (!docs.cni) return false
    if (!docs.siret_doc) return false
    if (needsPermis && (!docs.permis_doc || !docs.carte_grise)) return false
    return true
  }

  const [hParJour, setHParJour] = useState(3)
  const [joursParSemaine, setJours] = useState(5)
  const COURSES_H = 2.5; const BASE_COURSE = 2.85; const KM_MOY = 2.5; const TARIF_KM = 0.80
  const revenus_brut = hParJour * joursParSemaine * 4 * COURSES_H * (BASE_COURSE + KM_MOY * TARIF_KM)
  const cotisations = revenus_brut * 0.22
  const revenus_net = revenus_brut - cotisations

  if (stripeStep) return (
    <PageWrapper title="🛵 Activation paiement" onBack={() => setStripeStep(false)}>
      <div className="text-center py-16 space-y-4">
        <span className="text-6xl block">⏳</span>
        <h2 className="font-serif text-xl font-bold text-brun">Redirection vers Stripe…</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">Configurez votre compte de paiement pour recevoir vos revenus automatiquement chaque semaine.</p>
        <div className="bg-or-pale border border-or/20 rounded-xl p-4 text-left space-y-2 max-w-xs mx-auto">
          <p className="text-xs font-bold text-brun">Stripe va vous demander :</p>
          <p className="text-xs text-gray-500">✓ Vérification d'identité (CNI)</p>
          <p className="text-xs text-gray-500">✓ Votre IBAN pour les virements</p>
          <p className="text-xs text-gray-500">✓ Votre numéro SIRET</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 max-w-xs mx-auto">
          <p className="text-xs font-bold text-green-700">💶 Virement automatique chaque lundi</p>
          <p className="text-xs text-gray-500 mt-0.5">Frais livraison + 100% des pourboires</p>
        </div>
        <p className="text-xs text-gray-300">Sécurisé par Stripe · Données chiffrées</p>
      </div>
    </PageWrapper>
  )

  async function soumettre() {
    setLoading(true); setError('')
    try {
      const { default: emailjs } = await import('@emailjs/browser')
      await emailjs.send('service_uq712ai', 'template_0rdvwq8', {
        subject: `🛵 Nouveau livreur : ${form.prenom} ${form.nom}`,
        message: `CANDIDATURE LIVREUR\nPrénom & Nom : ${form.prenom} ${form.nom}\nEmail : ${form.email}\nTéléphone : ${form.tel}\nVille : ${form.ville}\nVéhicule : ${form.vehicule}\nSIRET : ${form.siret || '—'}\nDisponibilités : ${form.disponibilite}\nMessage : ${form.message || '—'}\nDocuments : CNI ${docs.cni?.name || '—'} · SIRET ${docs.siret_doc?.name || '—'}`.trim(),
      }, 'LbqBSABkR-S5wg9PR')

      setStripeStep(true)
      const res = await fetch('/api/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, nom_boutique: `Livreur — ${form.prenom} ${form.nom}`, ville: form.ville, type: 'livreur' }),
      })
      const data = await res.json()
      if (data.onboardingUrl) { window.location.href = data.onboardingUrl }
      else throw new Error(data.error || 'Erreur Stripe')
    } catch (e: any) {
      setError(`Erreur : ${e?.text || e?.message || JSON.stringify(e)}`)
      setStripeStep(false)
    } finally { setLoading(false) }
  }

  if (step === 'info') return (
    <PageWrapper title="🛵 Devenir livreur" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-5 text-center">
          <span className="text-4xl block mb-2">🛵</span>
          <h2 className="font-serif text-lg font-black text-or mb-1">Livrez à votre rythme</h2>
          <p className="text-white/70 text-xs leading-relaxed">Gagnez un revenu flexible en livrant des produits de boucheries artisanales.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-brun text-sm mb-3">💶 Votre rémunération</p>
          <div className="bg-or-pale rounded-xl p-3 mb-3 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-brun font-semibold">Base fixe</span><span className="font-black text-brun">2,85 €</span></div>
            <div className="flex justify-between text-sm"><span className="text-brun font-semibold">Par kilomètre</span><span className="font-black text-brun">+ 0,80 €/km</span></div>
            <div className="flex justify-between text-sm"><span className="text-brun font-semibold">Exemple (2,5 km)</span><span className="font-black text-rouge-vif">≈ 4,85 €</span></div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-500">
            {[['🙏','Pourboires','100% vous appartiennent'],['⚡','Heures de pointe','Coefficient ×1,1 à ×1,5'],['📅','Paiement','Virement hebdomadaire automatique via Stripe']].map(([ico,t,d]) => (
              <div key={t as string} className="flex gap-2"><span>{ico}</span><div><span className="font-semibold text-brun">{t} — </span>{d}</div></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-brun text-sm mb-3">🧮 Simulateur de revenus</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs text-brun font-semibold">Heures / jour</label><span className="text-xs font-black text-brun">{hParJour}h</span></div>
              <input type="range" min="1" max="10" step="0.5" value={hParJour} className="w-full accent-brun" onChange={e => setHParJour(parseFloat(e.target.value))} />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-xs text-brun font-semibold">Jours / semaine</label><span className="text-xs font-black text-brun">{joursParSemaine}j</span></div>
              <input type="range" min="1" max="7" step="1" value={joursParSemaine} className="w-full accent-brun" onChange={e => setJours(parseInt(e.target.value))} />
            </div>
            <div className="bg-creme rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-xs text-gray-400"><span>CA brut / mois</span><span>{revenus_brut.toFixed(0)} €</span></div>
              <div className="flex justify-between text-xs text-gray-400"><span>Cotisations (22%)</span><span>- {cotisations.toFixed(0)} €</span></div>
              <div className="flex justify-between text-sm font-black text-brun border-t border-gris-bd pt-1.5"><span>Revenu net estimé</span><span className="text-green-600">{revenus_net.toFixed(0)} €/mois</span></div>
            </div>
          </div>
        </div>
        <button className="w-full bg-brun text-white py-4 rounded-2xl font-bold text-sm font-sans" onClick={() => setStep('form')}>🛵 Postuler maintenant →</button>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="🛵 Votre dossier" onBack={() => setStep('info')}>
      <div className="space-y-4">
        <div className="bg-or-pale border border-or/20 rounded-xl p-3">
          <p className="text-xs text-brun font-semibold">Complétez votre dossier. Vous pouvez démarrer dès validation (48h).</p>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">👤 Identité</h3>
          <div className="grid grid-cols-2 gap-3">
            {[['prenom','Prénom *'],['nom','Nom *']].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-bold text-brun block mb-1">{l}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          {[['email','Email *','vous@email.fr'],['tel','Téléphone *','+33 6 00 00 00 00'],['ville','Ville de livraison *','Paris']].map(([k,l,ph]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder={ph as string} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>

        {/* Statut */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">📄 Statut professionnel</h3>
          <div>
            <label className="text-xs font-bold text-brun block mb-1">Numéro SIRET *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun font-mono"
              placeholder="123 456 789 00012" value={form.siret} onChange={e => setForm(f => ({ ...f, siret: e.target.value }))} />
            <p className="text-[10px] text-gray-400 mt-1">Votre numéro de micro-entrepreneur (14 chiffres)</p>
          </div>

          {/* IBAN collecté par Stripe */}
          <div className="bg-or-pale border border-or/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brun mb-1">💳 Coordonnées bancaires (IBAN)</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Votre IBAN sera collecté directement et en toute sécurité par <strong>Stripe</strong> lors de l'étape suivante.
              Vous n'avez rien à saisir ici.
            </p>
          </div>
        </div>

        {/* Véhicule */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">🚲 Votre véhicule</h3>
          <div className="grid grid-cols-2 gap-2">
            {[['velo','🚲','Vélo'],['velo_elec','⚡','Vélo électrique'],['scooter','🛵','Scooter'],['voiture','🚗','Voiture']].map(([v,ico,l]) => (
              <button key={v}
                className={`flex items-center gap-2 py-3 px-3 rounded-xl border-2 text-xs font-bold font-sans transition-all ${form.vehicule === v ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                onClick={() => setForm(f => ({ ...f, vehicule: v }))}>
                <span className="text-lg">{ico}</span>{l}
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-brun">📎 Documents obligatoires</h3>
          <DocUpload label="🪪 Carte d'identité (recto-verso)" sublabel="CNI ou passeport en cours de validité" required file={docs.cni} onChange={f => setDoc('cni', f)} />
          <DocUpload label="📄 Justificatif SIRET" sublabel="Extrait Kbis ou avis de situation INSEE" required file={docs.siret_doc} onChange={f => setDoc('siret_doc', f)} />
          {needsPermis && (<>
            <DocUpload label="🚗 Permis de conduire (recto-verso)" sublabel="Permis B en cours de validité" required file={docs.permis_doc} onChange={f => setDoc('permis_doc', f)} />
            <DocUpload label="📋 Carte grise du véhicule" sublabel="Certificat d'immatriculation à votre nom" required file={docs.carte_grise} onChange={f => setDoc('carte_grise', f)} />
          </>)}
        </div>

        {/* Disponibilités */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">📅 Disponibilités</h3>
          <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
            placeholder="Ex: Lundi–Vendredi 11h–14h, weekend matin"
            value={form.disponibilite} onChange={e => setForm(f => ({ ...f, disponibilite: e.target.value }))} />
          <div>
            <label className="text-xs font-bold text-brun block mb-1">Message (optionnel)</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none" rows={3}
              placeholder="Parlez-nous de vos motivations…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
        </div>

        <button
          className="w-full bg-brun text-white py-4 rounded-2xl font-bold text-sm font-sans disabled:bg-gray-300 active:bg-rouge-vif transition-colors"
          disabled={!form.prenom || !form.email || !form.tel || !form.ville || !form.siret || !form.disponibilite || !docValide() || loading}
          onClick={soumettre}>
          {loading ? '⏳ Envoi en cours…' : '🛵 Envoyer mon dossier'}
        </button>
        {error && <p className="text-center text-xs text-rouge-vif">{error}</p>}
        <p className="text-center text-[10px] text-gray-300">Vos données sont chiffrées · Réponse sous 48h</p>
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DEVENIR PARTENAIRE BOUCHER
// ══════════════════════════════════════════════════════════════════════════════
function PartenaireSection({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ prenom:'', nom:'', email:'', tel:'', nom_boutique:'', adresse:'', ville:'', siret:'', specialites:'', message:'' })
  const [docs, setDocs] = useState<Record<string, File | null>>({ siret_doc: null })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [step, setStep]       = useState<'info'|'form'|'stripe'>('info')

  const { addBoucher } = useAccounts()
  function setDoc(key: string, file: File | null) { setDocs(d => ({ ...d, [key]: file })) }
  function docValide() { return !!docs.siret_doc }

  const siretOk = /^\d{14}$/.test(form.siret.replace(/\s/g, ''))

  if (step === 'stripe') return (
    <PageWrapper title="🔪 Activation Stripe" onBack={() => setStep('form')}>
      <div className="text-center py-16 space-y-4">
        <span className="text-6xl block">⏳</span>
        <h2 className="font-serif text-xl font-bold text-brun">Redirection vers Stripe…</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">Vous allez être redirigé vers Stripe pour configurer votre compte de paiement en 5 minutes.</p>
        <div className="bg-or-pale border border-or/20 rounded-xl p-4 text-left space-y-2 max-w-xs mx-auto">
          <p className="text-xs font-bold text-brun">Stripe va collecter :</p>
          <p className="text-xs text-gray-500">✓ Vérification d'identité (CNI ou passeport)</p>
          <p className="text-xs text-gray-500">✓ Coordonnées bancaires (IBAN) — de façon sécurisée</p>
          <p className="text-xs text-gray-500">✓ Informations professionnelles (SIRET)</p>
        </div>
        <p className="text-xs text-gray-300">Connexion sécurisée SSL · Données protégées par Stripe</p>
      </div>
    </PageWrapper>
  )

  async function soumettre() {
    setLoading(true); setError('')
    try {
      const createRes = await fetch('/api/boucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, nom: form.nom, prenom: form.prenom, nom_boutique: form.nom_boutique, ville: form.ville }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Erreur création compte')

      addBoucher({
        id: 'boucher_' + Date.now(),
        nom: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        password: createData.password,
        nom_boutique: form.nom_boutique,
        ville: form.ville,
        createdAt: new Date().toISOString(),
      })

      const { default: emailjs } = await import('@emailjs/browser')
      await emailjs.send('service_uq712ai', 'template_0rdvwq8', {
        subject: `🔪 Nouveau partenaire : ${form.nom_boutique} (${form.ville})`,
        message: `CANDIDATURE PARTENAIRE\nBoucherie : ${form.nom_boutique}\nAdresse : ${form.adresse}, ${form.ville}\nSIRET : ${form.siret} ${siretOk ? '✅' : '⚠️'}\nSpécialités : ${form.specialites || '—'}\nContact : ${form.prenom} ${form.nom}\nEmail : ${form.email}\nTéléphone : ${form.tel}\nMessage : ${form.message || '—'}\nKbis : ${docs.siret_doc?.name || '—'}\nMot de passe généré : ${createData.password}`.trim(),
      }, 'LbqBSABkR-S5wg9PR')

      setStep('stripe')
      const res = await fetch('/api/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, nom_boutique: form.nom_boutique, ville: form.ville }),
      })
      const data = await res.json()
      if (data.onboardingUrl) { window.location.href = data.onboardingUrl }
      else throw new Error(data.error || 'Erreur Stripe')
    } catch (e: any) {
      setError(`Erreur : ${e?.text || e?.message || JSON.stringify(e)}`)
      setStep('form')
    } finally { setLoading(false) }
  }

  if (step === 'info') return (
    <PageWrapper title="🔪 Devenir partenaire" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-5 text-center">
          <span className="text-4xl block mb-2">🔪</span>
          <h2 className="font-serif text-lg font-black text-or mb-1">Rejoignez le réseau</h2>
          <p className="text-white/70 text-xs leading-relaxed">BoucheriesDelivery connecte vos clients passionnés à votre savoir-faire artisan.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-bold text-brun text-sm">Ce que vous gagnez</p>
          {[
            { ico:'📈', titre:'Nouveaux clients', desc:"Touchez les actifs et les familles qui commandent en ligne." },
            { ico:'💶', titre:'CA supplémentaire', desc:"Nos partenaires génèrent en moyenne 800 à 2 000 € de revenus additionnels dès le 2e mois." },
            { ico:'⚙️', titre:'Zéro contrainte', desc:"Vous recevez les commandes, vous préparez comme d'habitude. On s'occupe du reste." },
          ].map(a => (
            <div key={a.titre} className="flex gap-3 items-start">
              <span className="text-xl flex-shrink-0 mt-0.5">{a.ico}</span>
              <div><p className="text-sm font-bold text-brun">{a.titre}</p><p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{a.desc}</p></div>
            </div>
          ))}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
          <p className="font-bold text-green-700 text-sm">🎉 Inscription 100% gratuite</p>
          <p className="text-xs text-green-700 flex items-start gap-1.5"><span>✓</span>Aucun abonnement, aucun frais cachés</p>
          <p className="text-xs text-green-700 flex items-start gap-1.5"><span>✓</span>Commission uniquement sur les commandes réalisées</p>
          <p className="text-xs text-green-700 flex items-start gap-1.5"><span>✓</span>Résiliable à tout moment</p>
        </div>
        <button className="w-full bg-rouge-vif text-white py-4 rounded-2xl font-bold text-sm font-sans active:bg-brun transition-colors"
          onClick={() => setStep('form')}>🤝 Je veux rejoindre le réseau →</button>
        <p className="text-center text-[10px] text-gray-300">Démonstration gratuite · Sans engagement · Réponse sous 24h</p>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="🔪 Votre candidature" onBack={() => setStep('info')}>
      <div className="space-y-4">
        <div className="bg-or-pale border border-or/20 rounded-xl p-3">
          <p className="text-xs text-brun font-semibold">Notre équipe vous recontacte sous 24h pour une démonstration gratuite.</p>
        </div>

        {/* Boucherie */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">Votre boucherie</h3>
          {[['nom_boutique','Nom de la boucherie *','Boucherie Dupont'],['adresse','Adresse *','12 rue du Marché'],['ville','Ville *','Paris'],['specialites','Vos spécialités','Charolais, Wagyu, Halal…']].map(([k,l,ph]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder={ph as string} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}

          {/* SIRET */}
          <div>
            <label className="text-xs font-bold text-brun block mb-1">Numéro SIRET *</label>
            <div className="relative">
              <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono pr-8 ${form.siret ? (siretOk ? 'border-green-400' : 'border-rouge-vif') : 'border-gray-200 focus:border-brun'}`}
                placeholder="123 456 789 00012" value={form.siret} onChange={e => setForm(f => ({ ...f, siret: e.target.value }))} />
              {form.siret && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">{siretOk ? '✅' : '❌'}</span>}
            </div>
            {form.siret && !siretOk && <p className="text-[11px] text-rouge-vif mt-0.5">Format invalide — 14 chiffres requis</p>}
          </div>

          {/* IBAN collecté par Stripe — plus de champ manuel */}
          <div className="bg-or-pale border border-or/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brun mb-1">💳 Coordonnées bancaires (IBAN)</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Votre IBAN sera collecté directement et en toute sécurité par <strong>Stripe</strong> lors de l'étape suivante.
              Vous n'avez rien à saisir ici — vos virements seront automatiques chaque lundi.
            </p>
          </div>
        </div>

        {/* Document Kbis seulement */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-brun">📎 Document obligatoire</h3>
          <DocUpload
            label="📄 Kbis ou justificatif SIRET"
            sublabel="Extrait Kbis de moins de 3 mois ou avis de situation INSEE"
            required
            file={docs.siret_doc}
            onChange={f => setDoc('siret_doc', f)}
          />
          <div className={`rounded-xl p-3 border ${docValide() && siretOk ? 'bg-green-50 border-green-200' : 'bg-creme border-gris-bd'}`}>
            <p className={`text-xs font-bold mb-1 ${docValide() && siretOk ? 'text-green-700' : 'text-brun'}`}>
              {docValide() && siretOk ? '✅ Dossier complet' : '📋 Vérifications requises'}
            </p>
            {[{ label: 'SIRET valide (14 chiffres)', ok: siretOk }, { label: 'Kbis / justif. SIRET joint', ok: !!docs.siret_doc }].map(d => (
              <p key={d.label} className={`text-[11px] flex items-center gap-1.5 ${d.ok ? 'text-green-600' : 'text-gray-400'}`}>
                <span>{d.ok ? '✓' : '○'}</span>{d.label}
              </p>
            ))}
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-bold text-brun">Vos coordonnées</h3>
          <div className="grid grid-cols-2 gap-3">
            {[['prenom','Prénom'],['nom','Nom']].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-bold text-brun block mb-1">{l} *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          {[['email','Email *','vous@email.fr'],['tel','Téléphone *','+33 6 00 00 00 00']].map(([k,l,ph]) => (
            <div key={k}>
              <label className="text-xs font-bold text-brun block mb-1">{l}</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder={ph as string} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-brun block mb-1">Message (optionnel)</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none" rows={3}
              placeholder="Vos questions, votre situation…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>
        </div>

        <button
          className="w-full bg-rouge-vif text-white py-4 rounded-2xl font-bold text-sm font-sans disabled:bg-gray-300 active:bg-brun transition-colors"
          disabled={!form.nom_boutique || !form.prenom || !form.email || !form.tel || !form.ville || !siretOk || !docValide() || loading}
          onClick={soumettre}>
          {loading ? '⏳ Envoi en cours…' : '🤝 Envoyer ma candidature'}
        </button>
        {error && <p className="text-center text-xs text-rouge-vif">{error}</p>}
        <p className="text-center text-[10px] text-gray-300">Sans engagement · Démonstration gratuite · Réponse sous 24h</p>
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PARRAINAGE
// ══════════════════════════════════════════════════════════════════════════════
function ParrainageSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  function generateCode(email: string) {
    const base = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
    const num = email.length * 7 % 100
    return `${base}${num}`
  }

  const code = user ? generateCode(user.email) : 'MONCODE'
  const lien = `https://boucheries-delivery.vercel.app?ref=${code}`
  const stats = { invites: 3, convertis: 2, gains: 10.00 }

  function copier() {
    navigator.clipboard.writeText(lien)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageWrapper title="🎁 Parrainage" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-5 text-center space-y-2">
          <span className="text-4xl block">🎁</span>
          <h2 className="font-serif text-lg font-black text-or">Parrainez vos amis</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Pour chaque ami qui commande pour la première fois, vous recevez <strong className="text-or">5 €</strong> et lui aussi.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-bold text-brun">Votre code personnel</p>
          <div className="bg-creme rounded-xl p-4 text-center border-2 border-dashed border-or/30">
            <p className="font-mono font-black text-brun text-2xl tracking-widest">{code}</p>
          </div>
          <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans" onClick={copier}>
            {copied ? '✅ Lien copié !' : '📋 Copier le lien de parrainage'}
          </button>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`🥩 Commande chez ton boucher artisan ! -5€ avec mon code : ${lien}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold text-center no-underline font-sans">
              📱 WhatsApp
            </a>
            <a href={`sms:?body=${encodeURIComponent(`Essaie BoucheriesDelivery, -5€ avec mon code : ${lien}`)}`}
              className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold text-center no-underline font-sans">
              💬 SMS
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[{ico:'👥',val:String(stats.invites),label:'Invités'},{ico:'✅',val:String(stats.convertis),label:'Convertis'},{ico:'💶',val:stats.gains.toFixed(2)+'€',label:'Gains'}].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <span className="text-xl block mb-1">{s.ico}</span>
              <p className="font-black text-brun text-base">{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-xs font-bold text-brun">Comment ça marche</p>
          {[
            ['1️⃣','Partagez votre lien ou code à un ami'],
            ['2️⃣','Votre ami crée son compte et commande'],
            ['3️⃣','Vous recevez tous les deux 5€ automatiquement'],
            ['💡','Valable sur la première commande de 20€ minimum'],
          ].map(([ico,t]) => (
            <div key={t as string} className="flex items-start gap-2">
              <span className="flex-shrink-0">{ico}</span>
              <p className="text-xs text-gray-500">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
