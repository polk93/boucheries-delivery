'use client'
import { useState } from 'react'
import { useAuth } from '@/store/auth'
import { BOUCHERIES } from '@/lib/data'

interface AuthModalProps {
  onClose: () => void
  defaultRole?: 'client' | 'boucher'
}

export default function AuthModal({ onClose, defaultRole = 'client' }: AuthModalProps) {
  const { login } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'client' | 'boucher'>(defaultRole)
  const [form, setForm] = useState({ nom: '', email: '', password: '', boucherieId: '1' })

  function doLogin() {
    const b = BOUCHERIES.find(b => b.id === parseInt(form.boucherieId))
    login({
      id: 'user_' + Date.now(),
      nom: form.nom || (role === 'boucher' ? 'Jean Dupont — Boucher' : 'Jean Dupont'),
      email: form.email || '',
      role,
      ...(role === 'boucher' && b ? { boucherieId: b.id, boucherieNom: b.nom } : {}),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/65 z-[200] flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>

        {/* Logo */}
        <div className="text-center mb-4">
          <span className="text-3xl">🥩</span>
          <h2 className="font-serif text-xl font-black text-brun mt-1">BoucherieDelivery</h2>
          <p className="text-xs text-gray-400 mt-0.5">Bienvenue !</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border border-gris-bd rounded-xl overflow-hidden">
          <button className={`flex-1 py-2 text-sm font-semibold font-sans transition-all ${tab === 'login' ? 'bg-brun text-white' : 'text-gray-400'}`}
            onClick={() => setTab('login')}>Connexion</button>
          <button className={`flex-1 py-2 text-sm font-semibold font-sans transition-all ${tab === 'register' ? 'bg-brun text-white' : 'text-gray-400'}`}
            onClick={() => setTab('register')}>Inscription</button>
        </div>

        {/* Rôle */}
        <div className="mb-4">
          <p className="text-xs font-bold text-brun mb-2">Je suis…</p>
          <div className="grid grid-cols-2 gap-2">
            {([['client', '🛒', 'Client'], ['boucher', '🔪', 'Boucher']] as const).map(([r, ico, label]) => (
              <button key={r}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all font-sans ${role === r ? 'bg-brun text-white border-brun' : 'bg-white text-gray-400 border-gray-200 hover:border-brun'}`}
                onClick={() => setRole(r)}>
                {ico} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Champs */}
        <div className="space-y-3 mb-4">
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

          {/* Sélection boucherie pour les bouchers */}
          {role === 'boucher' && (
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Votre boucherie</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                value={form.boucherieId} onChange={e => setForm(f => ({ ...f, boucherieId: e.target.value }))}>
                {BOUCHERIES.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
              </select>
            </div>
          )}
        </div>

        <button className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans hover:bg-brun transition-colors"
          onClick={doLogin}>
          {tab === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
        </button>

      
      </div>
    </div>
  )
}
