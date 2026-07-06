'use client'
import { useState, useEffect } from 'react'
import type { Produit, Boucherie } from '@/lib/data'

const PAYS_FLAGS: Record<string, string> = {
  'France': '🇫🇷', 'Irlande': '🇮🇪', 'Uruguay': '🇺🇾', 'Argentine': '🇦🇷',
  'Australie': '🇦🇺', 'Espagne': '🇪🇸', 'Pologne': '🇵🇱', 'Allemagne': '🇩🇪',
  'Pays-Bas': '🇳🇱', 'Brésil': '🇧🇷', 'Royaume-Uni': '🇬🇧', 'États-Unis': '🇺🇸',
  'Nouvelle-Zélande': '🇳🇿', 'Canada': '🇨🇦', 'Italie': '🇮🇹', 'Portugal': '🇵🇹',
  'Japon': '🇯🇵', 'Roumanie': '🇷🇴', 'Hongrie': '🇭🇺', 'Autriche': '🇦🇹',
  'Belgique': '🇧🇪', 'Maroc': '🇲🇦',
}

interface AvisItem {
  id: string
  auteur: string
  note: number
  texte: string
  created_at: string
}

interface Props {
  produit: Produit
  boucherie: Boucherie
  onClose: () => void
  onAddProduit: (p: Produit) => void
}

function Stars({ n }: { n: number }) {
  return <span>{Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < n ? 'text-or' : 'text-gray-200'}>★</span>
  ))}</span>
}

function StarsSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={`text-3xl transition-colors ${i <= (hover || value) ? 'text-or' : 'text-gray-200'}`}>★</button>
      ))}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff} jours`
  if (diff < 30) return `Il y a ${Math.floor(diff / 7)} semaine${diff >= 14 ? 's' : ''}`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function FicheProduitModal({ produit: p, boucherie: b, onClose, onAddProduit }: Props) {
  const [tab, setTab] = useState<'detail' | 'avis'>('detail')

  // ── Avis ────────────────────────────────────────────────────────────────────
  const [avis, setAvis] = useState<AvisItem[]>([])
  const [avisLoading, setAvisLoading] = useState(false)
  const [formStep, setFormStep] = useState<'list' | 'form' | 'submitting' | 'success' | 'error'>('list')
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ nom: '', commande_numero: '', note: 5, texte: '' })

  const boucherDbId = String(b.id)

  useEffect(() => {
    if (tab !== 'avis') return
    setAvisLoading(true)
    fetch(`/api/avis?boucher_id=${encodeURIComponent(boucherDbId)}&produit=${encodeURIComponent(p.nom)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setAvis(Array.isArray(data) ? data : []))
      .catch(() => setAvis([]))
      .finally(() => setAvisLoading(false))
  }, [tab, boucherDbId, p.nom])

  async function submitAvis() {
    if (!form.nom.trim() || !form.commande_numero.trim() || !form.texte.trim()) return
    setFormStep('submitting')
    try {
      const res = await fetch('/api/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commande_numero: form.commande_numero.trim(),
          client_nom:      form.nom.trim(),
          boucher_id:      boucherDbId,
          produit:         p.nom,
          note:            form.note,
          texte:           form.texte.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Une erreur est survenue.')
        setFormStep('error')
      } else {
        const newAvis: AvisItem = {
          id: data.avis?.id || String(Date.now()),
          auteur: form.nom.split(' ')[0] + (form.nom.split(' ')[1] ? ' ' + form.nom.split(' ').slice(-1)[0][0] + '.' : ''),
          note: form.note,
          texte: form.texte,
          created_at: new Date().toISOString(),
        }
        setAvis(prev => [newAvis, ...prev])
        setFormStep('success')
      }
    } catch {
      setErrorMsg('Erreur réseau. Vérifiez votre connexion.')
      setFormStep('error')
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const pays = p.pays_origine
  const flag = pays ? (PAYS_FLAGS[pays] ?? '🌍') : null
  const allergenes = (p.allergenes || '').split(',').map(s => s.trim()).filter(Boolean)

  function stockBadge() {
    if (p.stock === 0) return { label: 'Épuisé', cls: 'bg-gray-100 text-gray-500' }
    if (p.stock <= 4) return { label: `Plus que ${p.stock}`, cls: 'bg-orange-50 text-orange-600' }
    return { label: `En stock (${p.stock})`, cls: 'bg-green-50 text-green-600' }
  }
  const si = stockBadge()

  const avgNote = avis.length > 0 ? avis.reduce((s, a) => s + a.note, 0) / avis.length : 0

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Photo hero ── */}
        <div className="relative flex-shrink-0">
          {p.photo
            ? <img src={p.photo} alt={p.nom} className="w-full h-44 object-cover rounded-t-3xl" />
            : <div className="w-full h-36 bg-or-pale flex items-center justify-center text-6xl rounded-t-3xl">{p.icon}</div>
          }
          <button
            className="absolute top-3 right-3 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center text-brun font-bold shadow"
            onClick={onClose}>✕</button>
          <span className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${si.cls}`}>{si.label}</span>
          {b.tags.slice(0, 2).map(t => (
            <span key={t} className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-gris-bd flex-shrink-0">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-black text-brun leading-tight">{p.nom}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{b.nom}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-rouge-vif">{p.prix.toFixed(2)} €</p>
              <p className="text-[10px] text-gray-400">{p.venteType === 'poids' ? 'par kg' : 'par pièce'}</p>
            </div>
          </div>
          {p.desc && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{p.desc}</p>}
        </div>

        {/* ── Onglets ── */}
        <div className="flex border-b border-gris-bd flex-shrink-0">
          {(['detail', 'avis'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === t ? 'text-brun border-b-2 border-brun' : 'text-gray-400'}`}>
              {t === 'detail' ? '📋 Détail produit' : `⭐ Avis${avis.length > 0 ? ` (${avis.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* ── Corps scrollable ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── Onglet détail ── */}
          {tab === 'detail' && (
            <div className="space-y-4">
              {pays && (
                <div className="flex items-center gap-3 bg-creme rounded-xl px-3 py-2.5">
                  <span className="text-2xl">{flag}</span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pays d'origine</p>
                    <p className="text-sm font-bold text-brun">{pays}</p>
                  </div>
                </div>
              )}
              {p.decoupes?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-brun mb-2">✂️ Découpes proposées</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.decoupes.map(d => (
                      <span key={d} className="bg-creme border border-gris-bd px-2.5 py-1 rounded-full text-xs font-semibold text-brun-clair">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {p.preparation?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-brun mb-2">🌿 Préparations proposées</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.preparation.map(pr => (
                      <span key={pr} className="bg-or-pale border border-or/20 px-2.5 py-1 rounded-full text-xs font-semibold text-brun-clair">{pr}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-creme rounded-xl px-3 py-3 space-y-2">
                <p className="text-xs font-bold text-brun">🔪 Infos boucher</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>⭐ {b.note}</span>
                  <span className="text-gris-bd">·</span>
                  <span>{b.avis} avis</span>
                  <span className="text-gris-bd">·</span>
                  <span>🕐 {b.livraison}</span>
                </div>
                {b.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {b.tags.map(t => (
                      <span key={t} className="bg-white border border-gris-bd px-2 py-0.5 rounded-full text-[10px] font-semibold text-brun-clair">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              {allergenes.length > 0 && (
                <div className={`rounded-xl px-3 py-2.5 border ${allergenes.includes('Aucun') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <p className={`text-xs font-bold mb-1.5 ${allergenes.includes('Aucun') ? 'text-green-700' : 'text-yellow-800'}`}>
                    ⚠️ Allergènes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allergenes.map(a => (
                      <span key={a} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${a === 'Aucun' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-yellow-100 border-yellow-300 text-yellow-800'}`}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Onglet avis ── */}
          {tab === 'avis' && (
            <div className="space-y-3">

              {/* ── État : liste ── */}
              {formStep === 'list' && (
                <>
                  {avisLoading && (
                    <div className="text-center py-8 text-gray-400 text-sm">Chargement des avis…</div>
                  )}

                  {!avisLoading && avis.length > 0 && (
                    <div className="bg-creme rounded-xl px-4 py-3 flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-black text-brun">{avgNote.toFixed(1)}</p>
                        <Stars n={Math.round(avgNote)} />
                        <p className="text-[10px] text-gray-400 mt-0.5">{avis.length} avis</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map(s => {
                          const count = avis.filter(a => a.note === s).length
                          return (
                            <div key={s} className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 w-2">{s}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-or h-1.5 rounded-full" style={{ width: avis.length > 0 ? `${(count / avis.length) * 100}%` : '0%' }} />
                              </div>
                              <span className="text-[10px] text-gray-400 w-4 text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {!avisLoading && avis.map(a => (
                    <div key={a.id} className="bg-white border border-gris-bd rounded-xl px-3 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-brun">{a.auteur}</span>
                        <div className="flex items-center gap-1.5">
                          <Stars n={a.note} />
                          <span className="text-[10px] text-gray-400">{formatDate(a.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{a.texte}</p>
                    </div>
                  ))}

                  {!avisLoading && avis.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <span className="text-3xl block mb-2">⭐</span>
                      <p className="text-sm">Aucun avis pour ce produit.</p>
                      <p className="text-xs mt-1">Soyez le premier à en laisser un !</p>
                    </div>
                  )}

                  <button
                    onClick={() => setFormStep('form')}
                    className="w-full bg-or-pale border border-or/30 text-brun font-bold py-3 rounded-xl text-sm">
                    ✍️ Laisser un avis
                  </button>
                </>
              )}

              {/* ── État : formulaire ── */}
              {formStep === 'form' && (
                <div className="space-y-4">
                  <div className="bg-or-pale border border-or/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-brun mb-0.5">🔒 Avis vérifié</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Seuls les clients ayant réellement commandé ce produit peuvent laisser un avis. Entrez votre nom et le numéro de votre commande pour vérification.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brun block mb-1.5">Votre note *</label>
                    <StarsSelector value={form.note} onChange={n => setForm(f => ({ ...f, note: n }))} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brun block mb-1.5">Votre nom complet *</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun"
                      placeholder="Jean Dupont"
                      value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Exactement tel qu'il apparaît dans votre profil (prénom et nom).</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brun block mb-1.5">Numéro de commande *</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans font-mono outline-none focus:border-brun"
                      placeholder="#1234"
                      value={form.commande_numero}
                      onChange={e => setForm(f => ({ ...f, commande_numero: e.target.value }))}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Visible dans Paramètres → Mes commandes.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brun block mb-1.5">Votre avis *</label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none"
                      rows={3}
                      placeholder="Qualité de la viande, découpe, fraîcheur…"
                      value={form.texte}
                      onChange={e => setForm(f => ({ ...f, texte: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans"
                      onClick={() => setFormStep('list')}>
                      ← Retour
                    </button>
                    <button
                      disabled={!form.nom.trim() || !form.commande_numero.trim() || !form.texte.trim()}
                      className="flex-[2] bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans disabled:bg-gray-300 disabled:cursor-not-allowed"
                      onClick={submitAvis}>
                      Envoyer mon avis
                    </button>
                  </div>
                </div>
              )}

              {/* ── État : envoi en cours ── */}
              {formStep === 'submitting' && (
                <div className="text-center py-10 text-gray-400 space-y-2">
                  <span className="text-3xl block animate-spin">⏳</span>
                  <p className="text-sm font-semibold">Vérification de votre commande…</p>
                </div>
              )}

              {/* ── État : succès ── */}
              {formStep === 'success' && (
                <div className="space-y-3">
                  <div className="text-center py-6 space-y-2">
                    <span className="text-4xl block">✅</span>
                    <p className="font-serif font-bold text-brun text-base">Avis publié !</p>
                    <p className="text-xs text-gray-400">Merci pour votre retour. Il est maintenant visible par tous.</p>
                  </div>
                  <button
                    className="w-full bg-creme text-brun font-bold py-3 rounded-xl text-sm"
                    onClick={() => setFormStep('list')}>
                    ← Voir tous les avis
                  </button>
                </div>
              )}

              {/* ── État : erreur ── */}
              {formStep === 'error' && (
                <div className="space-y-3">
                  <div className="bg-rouge-pale border border-rouge/20 rounded-xl p-4 text-center space-y-1.5">
                    <span className="text-2xl block">❌</span>
                    <p className="text-xs font-bold text-rouge-vif">{errorMsg}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans"
                      onClick={() => setFormStep('list')}>
                      Annuler
                    </button>
                    <button
                      className="flex-[2] bg-brun text-white font-bold py-3 rounded-xl text-sm font-sans"
                      onClick={() => setFormStep('form')}>
                      ← Réessayer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer CTA ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gris-bd">
          <button
            disabled={p.stock === 0 || !b.ouvert}
            className="w-full bg-rouge-vif text-white rounded-xl py-3.5 text-sm font-bold font-sans disabled:bg-gray-300 active:bg-brun transition-colors"
            onClick={() => { onClose(); onAddProduit(p) }}>
            {p.stock === 0
              ? 'Produit épuisé'
              : !b.ouvert
              ? 'Boutique fermée'
              : (p.decoupes?.length ?? 0) > 0
              ? '✂️ Choisir ma découpe →'
              : '🛒 Ajouter au panier'}
          </button>
        </div>
      </div>
    </div>
  )
}
