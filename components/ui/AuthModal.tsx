'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, DEMO_CLIENT, DEMO_BOUCHER, isDemoEmail } from '@/store/auth'
import { useAccounts } from '@/store/accounts'
import EmailVerifyModal from '@/components/EmailVerifyModal'

interface AuthModalProps {
  onClose: () => void
  defaultRole?: 'client' | 'boucher'
}

export default function AuthModal({ onClose, defaultRole = 'client' }: AuthModalProps) {
  const router = useRouter()
  const { login, updateUser } = useAuth()
  const { findBoucher } = useAccounts()
  const [tab,  setTab]  = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'client' | 'boucher'>(defaultRole)
  const [form, setForm] = useState({ nom: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [showVerify, setShowVerify] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)

  function doLogin() {
    setError('')
    const email = form.email.toLowerCase().trim()

    if (isDemoEmail(email)) {
      const demoUser = email === DEMO_BOUCHER.email ? DEMO_BOUCHER : DEMO_CLIENT
      login(demoUser)
      onClose()
      router.refresh()
      if (demoUser.role === 'boucher') router.push('/panel')
      return
    }

    if (!form.email.trim()) { setError('Veuillez saisir votre email.'); return }
    if (!form.password.trim()) { setError('Veuillez saisir votre mot de passe.'); return }

    const boucherAccount = findBoucher(email)
    if (boucherAccount) {
      if (boucherAccount.password !== form.password) { setError('Mot de passe incorrect.'); return }
      login({
        id: boucherAccount.id,
        nom: boucherAccount.nom,
        email: boucherAccount.email,
        role: 'boucher',
        isDemo: false,
        boucherieNom: boucherAccount.nom_boutique,
      })
      onClose()
      router.refresh()
      router.push('/panel')
      return
    }

    login({
      id: 'user_' + Date.now(),
      nom: form.nom || form.email.split('@')[0],
      email: form.email.trim(),
      role,
      isDemo: false,
    })
    onClose()
    router.refresh()
  }

  function doRegister() {
    setError('')
    if (!form.email.trim()) { setError('Email requis.'); return }
    if (!form.password || form.password.length < 6) { setError('Mot de passe minimum 6 caractères.'); return }

    // Déclencher la vérification email avant création du compte
    const newUser = {
      id: 'user_' + Date.now(),
      nom: form.nom || form.email.split('@')[0],
      email: form.email.trim(),
      role,
      isDemo: false,
    }
    setPendingUser(newUser)
    setShowVerify(true)
  }

  function onEmailVerified() {
    setShowVerify(false)
    if (pendingUser) {
      login(pendingUser)
      onClose()
      router.refresh()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/65 z-[200] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* Tabs */}
          <div className="flex border-b border-gris-bd">
            {[['login','Connexion'],['register','Inscription']].map(([t,l]) => (
              <button key={t}
                className={`flex-1 py-3.5 text-sm font-semibold font-sans transition-all ${tab === t ? 'bg-brun text-white' : 'text-gray-400'}`}
                onClick={() => { setTab(t as any); setError('') }}>{l}</button>
            ))}
          </div>

          <div className="p-5 space-y-4">

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

              {/* Boucher inscription → redirection */}
              {tab === 'register' && role === 'boucher' && (
                <div className="mt-3 bg-or-pale border border-or/20 rounded-xl p-4 text-center space-y-3">
                  <p className="text-sm font-bold text-brun">🔪 Vous êtes boucher artisan ?</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    L'inscription se fait via notre formulaire partenaire. Inscription 100% gratuite.
                  </p>
                  <button
                    className="w-full bg-brun text-white py-3 rounded-xl text-sm font-bold font-sans"
                    onClick={() => { onClose(); router.push('/parametres?section=partenaire') }}>
                    Accéder au formulaire →
                  </button>
                </div>
              )}
            </div>

            {/* Champs client */}
            {!(tab === 'register' && role === 'boucher') && (
              <>
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

                {error && (
                  <div className="bg-rouge-pale border border-rouge-vif/20 rounded-xl px-3 py-2">
                    <p className="text-rouge-vif text-xs font-semibold">⚠️ {error}</p>
                  </div>
                )}

                <button
                  className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans hover:bg-brun transition-colors"
                  onClick={tab === 'login' ? doLogin : doRegister}>
                  {tab === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
                </button>

                {/* Comptes démo */}
                <div className="border-t border-gris-bd pt-3">
                  <p className="text-[10px] text-gray-400 text-center mb-2 uppercase tracking-wider">Comptes démo</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-creme border border-gris-bd text-brun font-bold py-2 rounded-xl text-xs font-sans"
                      onClick={() => { login(DEMO_CLIENT); onClose(); router.refresh() }}>
                      🛒 Client démo
                    </button>
                    <button className="flex-1 bg-or-pale border border-or/30 text-brun font-bold py-2.5 rounded-xl text-xs font-sans"
                      onClick={() => { login(DEMO_BOUCHER); onClose(); router.refresh(); router.push('/panel') }}>
                      🔪 Boucher démo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal vérification email */}
      {showVerify && (
        <EmailVerifyModal
          email={form.email}
          onVerified={onEmailVerified}
          onCancel={() => setShowVerify(false)}
        />
      )}
    </>
  )
}
