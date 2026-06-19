'use client'
import { useState, useRef, useEffect } from 'react'
import type { Boucherie } from '@/lib/data'

interface Msg { role: 'user' | 'bot'; text: string }

const SUGGESTIONS = ['Que me conseillez-vous ?', 'Quelle cuisson pour l\'entrecôte ?', 'Boucherie la plus rapide ?', 'Différence Charolais / Wagyu ?']

export default function ChatBot({ boucheries, onClose }: { boucheries: Boucherie[]; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'bot', text: 'Bonjour ! 👋 Je suis votre assistant Côte à Côte. Je peux vous conseiller sur les viandes, les cuissons ou vous aider à trouver la bonne boucherie. Que puis-je faire pour vous ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMsgs(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const boucheriesList = boucheries.map(b => `${b.nom} (${b.cat}, note ${b.note}, livraison ${b.livraison})`).join(', ')
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...msgs.slice(-6).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })), { role: 'user', content: msg }],
          boucheriesContext: boucheriesList,
        }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'bot', text: data.reply || 'Désolé, je rencontre un problème.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'bot', text: 'Désolé, une erreur est survenue. Réessayez !' }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed bottom-36 right-5 z-30 w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: 480 }}>
      {/* Header */}
      <div className="bg-brun px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-or flex items-center justify-center text-lg">🤖</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Assistant Côte à Côte</p>
          <p className="text-[11px] text-white/60">Propulsé par Claude IA</p>
        </div>
        <button className="text-white/70 text-lg bg-none border-none cursor-pointer" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-2.5">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'bot' ? 'bg-creme text-brun self-start rounded-bl-sm' : 'bg-brun text-white self-end rounded-br-sm'}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 px-3 py-2 bg-creme rounded-2xl rounded-bl-sm self-start">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {msgs.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
          {SUGGESTIONS.map(s => (
            <button key={s} className="bg-or-pale border border-or/30 text-brun-clair rounded-xl px-3 py-1 text-[11px] font-semibold cursor-pointer hover:bg-or hover:text-white transition-colors"
              onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-gris-bd">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brun font-sans"
          placeholder="Posez votre question…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
        />
        <button className="bg-brun text-white rounded-xl px-3 py-2 text-base cursor-pointer hover:bg-rouge-vif transition-colors"
          onClick={() => send()}>➤</button>
      </div>
    </div>
  )
}
