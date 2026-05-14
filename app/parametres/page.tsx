'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'
import { useAuth } from '@/store/auth'
import AuthModal from '@/components/ui/AuthModal'

type Section =
  | 'profil' | 'adresses' | 'notifs' | 'favoris'
  | 'commandes' | 'avis' | 'paiement'
  | 'support' | 'contact' | 'confidentialite' | 'cgu'
  | 'deconnexion' | null

// ── Wrapper commun ────────────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
export default function ParametresPage() {
  const router = useRouter()
  const { user, logout, isBoucher } = useAuth()
  const [section, setSection] = useState<Section>(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  // Sous-pages
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

  const sections = [
    {
      titre: 'Mon compte',
      items: [
        { ico: '👤', label: 'Mon profil', sub: user?.nom || 'Modifier mes informations', action: () => setSection('profil') },
        { ico: '📍', label: 'Mes adresses', sub: '1 adresse enregistrée', action: () => setSection('adresses') },
        { ico: '🔔', label: 'Notifications', sub: 'Gérer mes préférences', action: () => setSection('notifs') },
        { ico: '❤️', label: 'Boucheries favorites', sub: '2 boucheries sauvegardées', action: () => setSection('favoris') },
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
      titre: 'Application & Aide',
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

      {/* Avatar */}
      <div className="bg-white mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-brun text-white text-2xl flex items-center justify-center flex-shrink-0">
          {!user ? '👤' : isBoucher() ? '🔪' : '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-brun text-sm truncate">
              {user?.nom || 'Non connecté'}
            </p>
            {user?.isDemo && (
              <span className="bg-or/20 border border-or/40 text-or text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">DÉMO</span>
            )}
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

        {/* Connexion / Déconnexion */}
        {!user ? (
          /* Non connecté → bouton Se connecter */
          <button
            className="w-full bg-brun text-white font-bold py-3.5 rounded-2xl text-sm font-sans flex items-center justify-center gap-2"
            onClick={() => setAuthOpen(true)}>
            🔐 Se connecter
          </button>
        ) : !logoutConfirm ? (
          /* Connecté → bouton Se déconnecter */
          <button
            className="w-full bg-rouge-pale text-rouge-vif font-bold py-3.5 rounded-2xl text-sm transition-colors active:bg-red-100 font-sans"
            onClick={() => setLogoutConfirm(true)}>
            🚪 Se déconnecter
          </button>
        ) : (
          /* Confirmation déconnexion */
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-rouge-vif">
            <p className="font-bold text-brun text-sm text-center mb-1">Confirmer la déconnexion ?</p>
            <p className="text-xs text-gray-400 text-center mb-4">Vous devrez vous reconnecter pour passer commande.</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans"
                onClick={() => setLogoutConfirm(false)}>Annuler</button>
              <button className="flex-1 bg-rouge-vif text-white font-bold py-2.5 rounded-xl text-sm font-sans"
                onClick={() => { logout(); setLogoutConfirm(false); router.push('/') }}>
                Déconnecter
              </button>
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
  const [form, setForm] = useState({
    prenom: user?.nom?.split(' ')[0] || '',
    nom: user?.nom?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    tel: '',
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
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}>
          Enregistrer
        </button>
      </div>
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ADRESSES
// ══════════════════════════════════════════════════════════════════════════════
function AdressesSection({ onBack }: { onBack: () => void }) {
  type Adresse = { id: string; label: string; rue: string; cp: string; ville: string; complement: string; defaut: boolean }

  const [adresses, setAdresses] = useState<Adresse[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [ajoutOpen, setAjoutOpen] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({ label: '🏠 Domicile', rue: '', cp: '', ville: '', complement: '' })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  // Géolocalisation → remplit/ajoute l'adresse détectée
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

          // Mettre à jour l'adresse domicile si elle existe, sinon en créer une
          const existingIdx = adresses.findIndex(a => a.label === '🏠 Domicile')
          if (existingIdx >= 0) {
            setAdresses(prev => prev.map((a, i) => i === existingIdx ? { ...a, rue, cp, ville } : a))
          } else {
            setAdresses(prev => [...prev, {
              id: Date.now().toString(), label: '🏠 Domicile',
              rue, cp, ville, complement: '', defaut: prev.length === 0
            }])
          }
          showToast('📍 Adresse mise à jour !')
        } catch {
          showToast('❌ Impossible de récupérer l\'adresse')
        }
        setGeoLoading(false)
      },
      () => { showToast('❌ Géolocalisation refusée'); setGeoLoading(false) },
      { timeout: 8000 }
    )
  }

  function ajouterAdresse() {
    if (!form.rue.trim() || !form.ville.trim()) { showToast('⚠️ Rue et ville sont requises'); return }
    setAdresses(prev => [...prev, {
      id: Date.now().toString(), label: form.label,
      rue: form.rue, cp: form.cp, ville: form.ville, complement: form.complement,
      defaut: prev.length === 0
    }])
    setForm({ label: '🏠 Domicile', rue: '', cp: '', ville: '', complement: '' })
    setAjoutOpen(false)
    showToast('✅ Adresse ajoutée !')
  }

  function sauvegarderEdit(id: string, updated: Partial<Adresse>) {
    setAdresses(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
    setEditId(null)
    showToast('✅ Adresse mise à jour !')
  }

  function supprimerAdresse(id: string) {
    setAdresses(prev => {
      const next = prev.filter(a => a.id !== id)
      if (next.length > 0 && !next.some(a => a.defaut)) next[0].defaut = true
      return next
    })
  }

  function setDefaut(id: string) {
    setAdresses(prev => prev.map(a => ({ ...a, defaut: a.id === id })))
  }

  const LABELS = ['🏠 Domicile', '💼 Bureau', '❤️ Proche', '📍 Autre']

  return (
    <PageWrapper title="📍 Mes adresses" onBack={onBack}>
      <div className="space-y-3">

        {/* Bouton détecter position */}
        <button
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-brun text-brun text-sm font-bold font-sans transition-all active:bg-brun active:text-white ${geoLoading ? 'opacity-60' : ''}`}
          onClick={detecterPosition}
          disabled={geoLoading}>
          {geoLoading ? '⏳ Localisation en cours…' : '📍 Utiliser ma position actuelle'}
        </button>

        {/* Liste adresses */}
        {adresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center text-gray-400 shadow-sm">
            <span className="text-3xl block mb-2">📍</span>
            <p className="text-sm">Aucune adresse enregistrée.<br />Utilisez votre position ou ajoutez-en une manuellement.</p>
          </div>
        ) : adresses.map(a => (
          <div key={a.id}>
            {editId === a.id
              ? <EditAdresseForm
                  adresse={a}
                  labels={LABELS}
                  onSave={updated => sauvegarderEdit(a.id, updated)}
                  onCancel={() => setEditId(null)}
                />
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
                      <button className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-2.5 py-1.5 rounded-xl font-sans"
                        onClick={() => setEditId(a.id)}>✏️</button>
                      <button className="bg-red-50 border border-red-200 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-xl font-sans"
                        onClick={() => supprimerAdresse(a.id)}>🗑️</button>
                    </div>
                  </div>
                  {!a.defaut && (
                    <button className="mt-2 text-xs text-or font-semibold" onClick={() => setDefaut(a.id)}>
                      Définir comme adresse par défaut
                    </button>
                  )}
                </div>
            }
          </div>
        ))}

        {/* Formulaire ajout */}
        {ajoutOpen ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-brun text-base">Nouvelle adresse</h3>

            <div>
              <label className="text-xs font-bold text-brun block mb-1.5">Type</label>
              <div className="flex flex-wrap gap-2">
                {LABELS.map(l => (
                  <button key={l}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all font-sans ${form.label === l ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
                    onClick={() => setForm(f => ({ ...f, label: l }))}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brun block mb-1">Rue et numéro *</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="12 rue de la Roquette"
                value={form.rue} onChange={e => setForm(f => ({ ...f, rue: e.target.value }))} />
            </div>

            <div>
              <label className="text-xs font-bold text-brun block mb-1">Complément</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="Bât. A, 3e étage, digicode…"
                value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Code postal</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="75011" value={form.cp}
                  onChange={e => setForm(f => ({ ...f, cp: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Ville *</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Paris" value={form.ville}
                  onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-2.5 rounded-xl text-sm font-sans"
                onClick={() => setAjoutOpen(false)}>Annuler</button>
              <button className="flex-[2] bg-brun text-white font-bold py-2.5 rounded-xl text-sm font-sans active:bg-rouge-vif"
                onClick={ajouterAdresse}>Ajouter</button>
            </div>
          </div>
        ) : (
          <button
            className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-semibold text-gray-400 font-sans active:border-brun active:text-brun transition-colors"
            onClick={() => setAjoutOpen(true)}>
            + Ajouter une adresse manuellement
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brun text-white px-4 py-2.5 rounded-xl text-sm font-semibold z-50 shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}
    </PageWrapper>
  )
}

// ── Formulaire d'édition inline ───────────────────────────────────────────────
function EditAdresseForm({ adresse, labels, onSave, onCancel }: {
  adresse: { label: string; rue: string; cp: string; ville: string; complement: string }
  labels: string[]
  onSave: (u: any) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...adresse })

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-brun space-y-3">
      <h3 className="font-serif font-bold text-brun text-base">Modifier l'adresse</h3>

      <div className="flex flex-wrap gap-2">
        {labels.map(l => (
          <button key={l}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all font-sans ${form.label === l ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500'}`}
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
          placeholder="Bât., étage, digicode…"
          value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} />
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
  const [prefs, setPrefs] = useState({ livraison: true, promos: true, nouveaux: false, rappels: true })
  const items = [
    { key: 'livraison', label: 'Suivi de livraison', sub: 'Statut en temps réel' },
    { key: 'promos', label: 'Promotions & offres', sub: 'Bons plans des boucheries' },
    { key: 'nouveaux', label: 'Nouvelles boucheries', sub: 'Nouveaux partenaires' },
    { key: 'rappels', label: 'Rappels', sub: 'Re-commander facilement' },
  ]
  return (
    <PageWrapper title="🔔 Notifications" onBack={onBack}>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {items.map((item, i) => (
          <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
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
    </PageWrapper>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FAVORIS
// ══════════════════════════════════════════════════════════════════════════════
function FavorisSection({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const [favoris, setFavoris] = useState([
    { id: 1, nom: 'Maison Dupont', note: 4.9, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=60' },
    { id: 5, nom: 'Bœuf & Tradition', note: 4.9, img: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=200&q=60' },
  ])
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
                    <button className="bg-brun text-white text-xs font-bold px-3 py-1.5 rounded-xl font-sans"
                      onClick={() => router.push('/')}>Commander</button>
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
  { id: '#1038', boucherie: 'Maison Dupont', date: '2026-05-08', total: 46.30, frais: 2.90, creneau: 'Dès que possible',
    items: [{ nom: 'Entrecôte Charolais', icon: '🥩', qty: 2, decoupe: 'Épaisse (2cm) · Marinée herbes' }, { nom: 'Merguez Maison', icon: '🌶️', qty: 1, decoupe: 'Extra-épicées' }] },
  { id: '#1025', boucherie: 'Bœuf & Tradition', date: '2026-04-30', total: 97.40, frais: 3.50, creneau: 'Aujourd\'hui 19h–20h',
    items: [{ nom: 'Wagyu A5 – 200g', icon: '⭐', qty: 1, decoupe: 'Fine (4mm)' }, { nom: 'T-Bone Maturé 60j', icon: '🥩', qty: 1, decoupe: 'Entier' }] },
]

function CommandesSection({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const { isDemo } = useAuth()
  const data = isDemo() ? COMMANDES_DATA : []
  return (
    <PageWrapper title="📦 Mes commandes" onBack={onBack}>
      {data.length === 0
        ? <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-3">📦</span><p className="text-sm">Aucune commande pour l'instant.</p><button className="mt-4 bg-brun text-white px-5 py-2 rounded-xl text-sm font-bold font-sans" onClick={() => router.push('/')}>Découvrir les boucheries</button></div>
        : <div className="space-y-4">
            {data.map(o => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-brun text-sm">{o.id}</p>
                    <p className="text-xs text-gray-400">{new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">✅ Livrée</span>
                </div>
                <p className="text-xs font-semibold text-brun-clair mb-1">🔪 {o.boucherie}</p>
                <p className="text-xs text-or mb-2">🕐 {o.creneau}</p>
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
                  <button className="bg-rouge-vif text-white text-xs font-bold px-4 py-2 rounded-xl font-sans"
                    onClick={() => router.push('/')}>🔄 Re-commander</button>
                </div>
              </div>
            ))}
          </div>
      }
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
  const [avis, setAvis] = useState(isDemo() ? AVIS_DEMO : [])
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
                    <button className="text-gray-300 text-xs" onClick={() => setAvis(prev => prev.filter(x => x.id !== a.id))}>🗑️</button>
                  </div>
                </div>

                {editId === a.id
                  ? <div className="mt-2">
                      <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-sans outline-none focus:border-brun resize-none" rows={3}
                        value={editText} onChange={e => setEditText(e.target.value)} />
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 bg-gris-bd text-brun text-xs font-semibold py-2 rounded-xl font-sans" onClick={() => setEditId(null)}>Annuler</button>
                        <button className="flex-1 bg-brun text-white text-xs font-bold py-2 rounded-xl font-sans"
                          onClick={() => { setAvis(prev => prev.map(x => x.id === a.id ? { ...x, texte: editText } : x)); setEditId(null) }}>
                          Enregistrer
                        </button>
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
  const [cartes, setCartes] = useState<{ id: string; last4: string; expiry: string; type: string; defaut: boolean }[]>([])
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
    setCartes(prev => [...prev, { id: Date.now().toString(), last4, expiry: form.expiry, type, defaut: prev.length === 0 }])
    setForm({ numero: '', titulaire: '', expiry: '', cvv: '' })
    setAjoutOpen(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function supprimerCarte(id: string) {
    setCartes(prev => prev.filter(c => c.id !== id))
  }

  function setDefaut(id: string) {
    setCartes(prev => prev.map(c => ({ ...c, defaut: c.id === id })))
  }

  return (
    <PageWrapper title="💳 Moyens de paiement" onBack={onBack}>
      <div className="space-y-4">

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-green-700 text-sm font-semibold">✅ Carte ajoutée avec succès !</p>
          </div>
        )}

        {/* Cartes enregistrées */}
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
                    {c.defaut
                      ? <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Défaut</span>
                      : <button className="text-xs text-or font-semibold" onClick={() => setDefaut(c.id)}>Définir</button>
                    }
                    <button className="text-gray-300 text-sm" onClick={() => supprimerCarte(c.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))
        }

        {/* Bouton ajouter */}
        {!ajoutOpen && (
          <button className="w-full bg-brun text-white font-bold py-3.5 rounded-2xl text-sm font-sans flex items-center justify-center gap-2"
            onClick={() => setAjoutOpen(true)}>
            + Ajouter une carte
          </button>
        )}

        {/* Formulaire ajout carte */}
        {ajoutOpen && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-brun text-base">Nouvelle carte</h3>

            {/* Visuel carte */}
            <div className="bg-gradient-to-br from-brun to-brun-clair rounded-2xl p-4 text-white">
              <div className="w-8 h-5 bg-or rounded mb-3" />
              <p className="text-base font-bold tracking-widest mb-2 font-mono">
                {form.numero || '•••• •••• •••• ••••'}
              </p>
              <div className="flex justify-between text-xs opacity-75">
                <span>{form.titulaire || 'TITULAIRE'}</span>
                <span>{form.expiry || 'MM/AA'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brun block mb-1">Numéro de carte</label>
              <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono ${errors.numero ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                placeholder="1234 5678 9012 3456" maxLength={19}
                value={form.numero}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                  setForm(f => ({ ...f, numero: v.replace(/(.{4})/g, '$1 ').trim() }))
                }} />
              {errors.numero && <p className="text-red-500 text-xs mt-0.5">{errors.numero}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-brun block mb-1">Titulaire</label>
              <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none ${errors.titulaire ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                placeholder="JEAN DUPONT"
                value={form.titulaire}
                onChange={e => setForm(f => ({ ...f, titulaire: e.target.value.toUpperCase() }))} />
              {errors.titulaire && <p className="text-red-500 text-xs mt-0.5">{errors.titulaire}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Expiration</label>
                <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono ${errors.expiry ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                  placeholder="MM/AA" maxLength={5}
                  value={form.expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2)
                    setForm(f => ({ ...f, expiry: v }))
                  }} />
                {errors.expiry && <p className="text-red-500 text-xs mt-0.5">{errors.expiry}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-brun block mb-1">CVV</label>
                <input className={`w-full border rounded-xl px-3 py-2.5 text-sm font-sans outline-none font-mono ${errors.cvv ? 'border-red-400' : 'border-gray-200 focus:border-brun'}`}
                  placeholder="•••" maxLength={4} type="password"
                  value={form.cvv}
                  onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                {errors.cvv && <p className="text-red-500 text-xs mt-0.5">{errors.cvv}</p>}
              </div>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1">🔒 Vos données sont chiffrées et sécurisées</p>

            <div className="flex gap-3 pt-1">
              <button className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans"
                onClick={() => { setAjoutOpen(false); setErrors({}) }}>Annuler</button>
              <button className="flex-[2] bg-rouge-vif text-white font-bold py-3 rounded-xl text-sm font-sans"
                onClick={ajouterCarte}>Ajouter la carte</button>
            </div>
          </div>
        )}

        {/* Info sécurité */}
        <div className="bg-or-pale rounded-2xl p-3 border border-or/20">
          <p className="text-xs text-brun-clair leading-relaxed">
            🔒 <strong>Paiement sécurisé par Stripe.</strong> Vos coordonnées bancaires ne sont jamais stockées sur nos serveurs. Toutes les transactions sont chiffrées SSL 256 bits.
          </p>
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
    { q: "Quelle est la zone de livraison ?", a: "BoucherieDelivery livre dans un rayon de 10 km autour des boucheries partenaires. Activez la géolocalisation pour voir les boucheries disponibles. Vous pouvez ajuster le rayon de 2 à 10 km." },
    { q: "La chaîne du froid est-elle garantie ?", a: "Oui. Tous nos livreurs utilisent des sacs isothermes réfrigérés homologués. La livraison est effectuée en moins de 45 minutes." },
    { q: "Puis-je personnaliser ma découpe ?", a: "Absolument ! Pour chaque produit, choisissez le type de découpe et la préparation. Vous pouvez aussi laisser une note spécifique au boucher." },
    { q: "Que faire si je ne suis pas satisfait ?", a: "Contactez-nous dans les 2h suivant la livraison via 'Nous contacter'. Nous procéderons à un remboursement ou remplacement selon votre préférence." },
    { q: "Comment modifier ou annuler une commande ?", a: "Une commande peut être annulée dans les 5 minutes suivant sa validation. Après ce délai, contactez le support. Remboursement intégral sous 3-5 jours ouvrés." },
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
              <button className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left font-sans"
                onClick={() => setOpen(open === i ? null : i)}>
                <p className="text-sm font-semibold text-brun flex-1">{faq.q}</p>
                <span className={`text-gray-400 text-base flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {open === i && <div className="px-4 pb-4"><p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>

        <div className="bg-or-pale rounded-2xl p-4 border border-or/20">
          <p className="font-bold text-brun text-sm mb-2">🕐 Horaires du support</p>
          {[['Lun – Ven', '8h – 20h'], ['Samedi', '9h – 18h'], ['Dimanche', '10h – 16h']].map(([j, h]) => (
            <div key={j} className="flex justify-between text-xs text-brun mb-0.5"><span>{j}</span><span className="font-semibold">{h}</span></div>
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
                  <input type="radio" name="sujet" value={s.val} checked={form.sujet === s.val}
                    onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} className="hidden" />
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
              rows={4} placeholder="Décrivez votre demande…"
              value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          </div>

          <button className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans disabled:bg-gray-300"
            disabled={!form.nom || !form.email || !form.message}
            onClick={() => setSent(true)}>✉️ Envoyer</button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {[{ ico: '📧', label: 'Email', val: 'support@boucheriedelivery.fr' }, { ico: '📞', label: 'Téléphone', val: '+33 1 00 00 00 00' }, { ico: '🌐', label: 'Site web', val: 'www.boucheriedelivery.fr' }].map(c => (
            <div key={c.label} className="flex items-center gap-3">
              <span className="text-xl">{c.ico}</span>
              <div><p className="text-xs text-gray-400">{c.label}</p><p className="text-sm font-semibold text-brun">{c.val}</p></div>
            </div>
          ))}
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
        <div className="bg-or-pale border border-or/20 rounded-xl p-3">
          <p className="text-xs text-brun-clair font-semibold">Dernière mise à jour : 13 mai 2026 · Conforme RGPD</p>
        </div>
        {[
          { t: "1. Responsable du traitement", c: "BoucherieDelivery SAS est responsable du traitement de vos données personnelles. Contact : privacy@boucheriedelivery.fr" },
          { t: "2. Données collectées", c: "Nous collectons uniquement les données nécessaires : identité, adresses de livraison, historique de commandes et géolocalisation (avec votre consentement). Vos données bancaires sont gérées exclusivement par Stripe." },
          { t: "3. Finalités", c: "Vos données servent à traiter vos commandes, vous envoyer des notifications, améliorer le service et respecter nos obligations légales." },
          { t: "4. Durée de conservation", c: "Données de compte : 3 ans après suppression. Commandes : 5 ans (obligation légale). Géolocalisation : non conservée, temps réel uniquement." },
          { t: "5. Vos droits", c: "Accès, rectification, effacement, portabilité, opposition. Contactez-nous : privacy@boucheriedelivery.fr. Réclamation possible auprès de la CNIL (www.cnil.fr)." },
          { t: "6. Partage des données", c: "Vos données ne sont jamais vendues. Partagées uniquement avec les boucheries partenaires (pour préparer votre commande), Stripe (paiement) et Supabase (hébergement EU)." },
          { t: "7. Sécurité", c: "Chiffrement SSL/TLS, hébergement en Europe, authentification sécurisée. En cas de violation, vous serez notifié sous 72h." },
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
        <div className="bg-or-pale border border-or/20 rounded-xl p-3">
          <p className="text-xs text-brun-clair font-semibold">En vigueur depuis le 13 mai 2026</p>
        </div>
        {[
          { t: "1. Objet", c: "Les CGU régissent l'utilisation de BoucherieDelivery, accessible via l'app mobile et le site www.boucheriedelivery.fr." },
          { t: "2. Description du service", c: "BoucherieDelivery est une marketplace mettant en relation consommateurs et boucheries artisanales. Nous agissons en intermédiaire et ne sommes pas vendeurs des produits." },
          { t: "3. Inscription", c: "Gratuite, ouverte aux personnes majeures. Vous êtes responsable de vos identifiants. Tout usage frauduleux doit être signalé immédiatement." },
          { t: "4. Commandes & paiement", c: "Prix en euros TTC. Paiement dû à la validation de la commande via Stripe. Commission BoucherieDelivery : 15% par transaction." },
          { t: "5. Livraison", c: "Délais indicatifs (25–55 min). Chaîne du froid garantie. En cas de retard > 30 min, annulation sans frais possible." },
          { t: "6. Droit de rétractation", c: "Non applicable aux denrées périssables (art. L.221-28 Code consommation). En cas de non-conformité, contactez-nous sous 2h après livraison." },
          { t: "7. Responsabilités", c: "BoucherieDelivery garantit l'accessibilité de la plateforme. Les boucheries sont seules responsables de la qualité et conformité sanitaire de leurs produits." },
          { t: "8. Propriété intellectuelle", c: "Tous les éléments de BoucherieDelivery sont protégés. Toute reproduction sans autorisation écrite est interdite." },
          { t: "9. Droit applicable", c: "Droit français. Tribunaux de Paris compétents. Médiation européenne : ec.europa.eu/consumers/odr" },
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
