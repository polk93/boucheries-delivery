'use client'
import { useState } from 'react'
import { useAuth, DEMO_CLIENT, DEMO_BOUCHER, isDemoEmail } from '@/store/auth'
import { useAccounts } from '@/store/accounts'

interface AuthModalProps {
  onClose: () => void
  defaultRole?: 'client' | 'boucher'
}

export default function AuthModal({ onClose, defaultRole = 'client' }: AuthModalProps) {
  const { login } = useAuth()
  const { findBoucher } = useAccounts()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'client' | 'boucher'>(defaultRole)
  const [form, setForm] = useState({ nom: '', email: '', password: '' })
  const [error, setError] = useState('')

  function doLogin() {
    setError('')
    const email = form.email.toLowerCase().trim()

    // Compte démo
    if (isDemoEmail(email)) {
      const demoUser = email === DEMO_BOUCHER.email ? DEMO_BOUCHER : DEMO_CLIENT
      login(demoUser)
      onClose()
      return
    }

    if (!form.email.trim()) { setError('Veuillez saisir votre email.'); return }
    if (!form.password.trim()) { setError('Veuillez saisir votre mot de passe.'); return }

    // Vérifier si c'est un compte boucher créé via le formulaire d'inscription
    const boucherAccount = findBoucher(email)
    if (boucherAccount) {
      if (boucherAccount.password !== form.password) {
        setError('Mot de passe incorrect.')
        return
      }
      login({
        id: boucherAccount.id,
        nom: boucherAccount.nom,
        email: boucherAccount.email,
        role: 'boucher',
        isDemo: false,
        boucherieNom: boucherAccount.nom_boutique,
      })
      onClose()
      return
    }

    // Compte client standard
    login({
      id: 'user_' + Date.now(),
      nom: form.nom || form.email.split('@')[0],
      email: form.email.trim(),
      role,
      isDemo: false,
    })
    onClose()
  }

  function doRegister() {
    setError('')
    if (!form.nom.trim()) { setError('Veuillez saisir votre prénom et nom.'); return }
    if (!form.email.trim()) { setError('Veuillez saisir votre email.'); return }
    if (!form.password || form.password.length < 6) { setError('Mot de passe trop court (6 caractères minimum).'); return }

    login({
      id: 'user_' + Date.now(),
      nom: form.nom.trim(),
      email: form.email.trim(),
      role,
      isDemo: false,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/65 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="text-center pt-6 pb-4 px-6 border-b border-gris-bd">
          <span className="text-3xl">🥩</span>
          <h2 className="font-serif text-xl font-black text-brun mt-1">BoucherieDelivery</h2>
        </div>

        <div className="p-5 space-y-4">

          {/* Tabs */}
          <div className="flex border border-gris-bd rounded-xl overflow-hidden">
            <button className={`flex-1 py-2.5 text-sm font-semibold font-sans transition-all ${tab === 'login' ? 'bg-brun text-white' : 'text-gray-400'}`}
              onClick={() => { setTab('login'); setError('') }}>Connexion</button>
            <button className={`flex-1 py-2.5 text-sm font-semibold font-sans transition-all ${tab === 'register' ? 'bg-brun text-white' : 'text-gray-400'}`}
              onClick={() => { setTab('register'); setError('') }}>Inscription</button>
          </div>

          {/* Rôle */}
          <div>
            <p className="text-xs font-bold text-brun mb-2">Je suis…</p>
            <div className="grid grid-cols-2 gap-2">
              {([['client', '🛒', 'Client'], ['boucher', '🔪', 'Boucher']] as const).map(([r, ico, label]) => (
                <button key={r}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all font-sans ${role === r ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-400'}`}
                  onClick={() => { setRole(r); setError('') }}>
                  {ico} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Champs */}
          <div className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="text-xs font-bold text-brun block mb-1">Prénom & Nom</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                  placeholder="Jean Dupont"
                  value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="vous@email.fr"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Mot de passe</label>
              <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-rouge-pale border border-rouge-vif/20 rounded-xl px-3 py-2">
              <p className="text-rouge-vif text-xs font-semibold">⚠️ {error}</p>
            </div>
          )}

          {/* Bouton principal */}
          <button className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans hover:bg-brun transition-colors"
            onClick={tab === 'login' ? doLogin : doRegister}>
            {tab === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
          </button>

          {/* Séparateur + compte démo */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 whitespace-nowrap">ou essayer</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="flex flex-col items-center gap-1 py-3 bg-or-pale border border-or/30 rounded-xl text-xs font-bold text-brun-clair font-sans hover:bg-or hover:text-white transition-all"
              onClick={() => { login(DEMO_CLIENT); onClose() }}>
              <span className="text-base">🛒</span>
              Démo Client
            </button>
            <button
              className="flex flex-col items-center gap-1 py-3 bg-brun/5 border border-brun/20 rounded-xl text-xs font-bold text-brun font-sans hover:bg-brun hover:text-white transition-all"
              onClick={() => { login(DEMO_BOUCHER); onClose() }}>
              <span className="text-base">🔪</span>
              Démo Boucher
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-300">
            Les comptes démo affichent des données fictives uniquement.
          </p>
        </div>
      </div>
    </div>
  )
}
