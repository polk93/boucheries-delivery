'use client'
import { useState } from 'react'
import type { Produit, Boucherie } from '@/lib/data'

const PAYS_FLAGS: Record<string, string> = {
  'France': '🇫🇷', 'Irlande': '🇮🇪', 'Uruguay': '🇺🇾', 'Argentine': '🇦🇷',
  'Australie': '🇦🇺', 'Espagne': '🇪🇸', 'Pologne': '🇵🇱', 'Allemagne': '🇩🇪',
  'Pays-Bas': '🇳🇱', 'Brésil': '🇧🇷', 'Royaume-Uni': '🇬🇧', 'États-Unis': '🇺🇸',
  'Nouvelle-Zélande': '🇳🇿', 'Canada': '🇨🇦', 'Italie': '🇮🇹', 'Portugal': '🇵🇹',
  'Japon': '🇯🇵', 'Roumanie': '🇷🇴', 'Hongrie': '🇭🇺', 'Autriche': '🇦🇹',
  'Belgique': '🇧🇪', 'Maroc': '🇲🇦',
}

const DEMO_AVIS = [
  { id: 1, auteur: 'Marie L.',   note: 5, texte: 'Viande excellente, très tendre et bien persillée.', date: 'Il y a 2 jours' },
  { id: 2, auteur: 'Pierre D.',  note: 4, texte: 'Bonne qualité, découpe précise comme demandé.', date: 'Il y a 1 semaine' },
  { id: 3, auteur: 'Sophie M.',  note: 5, texte: 'Parfait pour le barbecue ! Je recommande.', date: 'Il y a 2 semaines' },
]

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

export default function FicheProduitModal({ produit: p, boucherie: b, onClose, onAddProduit }: Props) {
  const [tab, setTab] = useState<'detail' | 'avis'>('detail')

  const pays = p.pays_origine
  const flag = pays ? (PAYS_FLAGS[pays] ?? '🌍') : null
  const allergenes = (p.allergenes || '').split(',').map(s => s.trim()).filter(Boolean)

  function stockBadge() {
    if (p.stock === 0) return { label: 'Épuisé', cls: 'bg-gray-100 text-gray-500' }
    if (p.stock <= 4) return { label: `Plus que ${p.stock}`, cls: 'bg-orange-50 text-orange-600' }
    return { label: `En stock (${p.stock})`, cls: 'bg-green-50 text-green-600' }
  }
  const si = stockBadge()

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
              {t === 'detail' ? '📋 Détail produit' : `⭐ Avis (${DEMO_AVIS.length})`}
            </button>
          ))}
        </div>

        {/* ── Corps scrollable ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {tab === 'detail' && (
            <div className="space-y-4">
              {/* Pays d'origine */}
              {pays && (
                <div className="flex items-center gap-3 bg-creme rounded-xl px-3 py-2.5">
                  <span className="text-2xl">{flag}</span>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pays d'origine</p>
                    <p className="text-sm font-bold text-brun">{pays}</p>
                  </div>
                </div>
              )}

              {/* Découpes */}
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

              {/* Préparations */}
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

              {/* Infos boucher */}
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

              {/* Allergènes */}
              {allergenes.length > 0 && (
                <div className={`rounded-xl px-3 py-2.5 border ${allergenes.includes('Aucun') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <p className={`text-xs font-bold mb-1.5 ${allergenes.includes('Aucun') ? 'text-green-700' : 'text-yellow-800'}`}>
                    ⚠️ Allergènes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allergenes.map(a => (
                      <span key={a}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${a === 'Aucun' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-yellow-100 border-yellow-300 text-yellow-800'}`}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'avis' && (
            <div className="space-y-3">
              {/* Résumé note */}
              <div className="bg-creme rounded-xl px-4 py-3 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-brun">4.7</p>
                  <Stars n={5} />
                  <p className="text-[10px] text-gray-400 mt-0.5">{DEMO_AVIS.length} avis</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-2">{s}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-or h-1.5 rounded-full" style={{ width: s === 5 ? '70%' : s === 4 ? '25%' : '5%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Liste avis */}
              {DEMO_AVIS.map(avis => (
                <div key={avis.id} className="bg-white border border-gris-bd rounded-xl px-3 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-brun">{avis.auteur}</span>
                    <div className="flex items-center gap-1.5">
                      <Stars n={avis.note} />
                      <span className="text-[10px] text-gray-400">{avis.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{avis.texte}</p>
                </div>
              ))}
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
