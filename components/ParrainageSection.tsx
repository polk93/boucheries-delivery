'use client'
import { useState } from 'react'
import { useAuth } from '@/store/auth'

function generateReferralCode(email: string): string {
  // Code basé sur l'email (déterministe)
  const base = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
  const num = email.length * 7 % 100
  return `${base}${num}`
}

export default function ParrainageSection({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const code = user ? generateReferralCode(user.email) : 'MONCODE'
  const lien = `https://boucheries-delivery.vercel.app?ref=${code}`

  function copier() {
    navigator.clipboard.writeText(lien)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simul stats parrainage
  const stats = { invites: 3, convertis: 2, gains: 10.00 }

  return (
    <div className="min-h-screen bg-creme" style={{ paddingBottom: 72 }}>
      <div className="bg-brun px-4 py-3.5 flex items-center gap-3 sticky top-0">
        <button onClick={onBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-lg font-bold text-or">🎁 Parrainage</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Hero */}
        <div className="bg-brun rounded-2xl p-5 text-center space-y-2">
          <span className="text-4xl block">🎁</span>
          <h2 className="font-serif text-lg font-black text-or">Parrainez vos amis</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Pour chaque ami qui commande pour la première fois, vous recevez <strong className="text-or">5 €</strong> et lui aussi.
          </p>
        </div>

        {/* Code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-base font-bold text-brun">Votre code personnel</p>
          <div className="bg-creme rounded-xl p-4 text-center border-2 border-dashed border-or/30">
            <p className="font-mono font-black text-brun text-2xl tracking-widest">{code}</p>
          </div>
          <button
            className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans"
            onClick={copier}>
            {copied ? '✅ Lien copié !' : '📋 Copier le lien de parrainage'}
          </button>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`🥩 Commande chez ton boucher artisan avec BoucheriesDelivery ! -5€ avec mon code : ${lien}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-base font-bold text-center no-underline font-sans">
              📱 WhatsApp
            </a>
            <a href={`sms:?body=${encodeURIComponent(`Essaie BoucheriesDelivery, -5€ avec mon code : ${lien}`)}`}
              className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-base font-bold text-center no-underline font-sans">
              💬 SMS
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { ico:'👥', val: String(stats.invites),  label:'Invités' },
            { ico:'✅', val: String(stats.convertis), label:'Convertis' },
            { ico:'💶', val: stats.gains.toFixed(2)+'€', label:'Gains' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <span className="text-xl block mb-1">{s.ico}</span>
              <p className="font-black text-brun text-base">{s.val}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Règles */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-base font-bold text-brun">Comment ça marche</p>
          {[
            ['1️⃣', 'Partagez votre lien ou code à un ami'],
            ['2️⃣', 'Votre ami crée son compte et commande'],
            ['3️⃣', 'Vous recevez tous les deux 5€ automatiquement'],
            ['💡', 'Valable sur la première commande de 20€ minimum'],
          ].map(([ico, t]) => (
            <div key={t as string} className="flex items-start gap-2">
              <span className="flex-shrink-0">{ico}</span>
              <p className="text-base text-gray-500">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

