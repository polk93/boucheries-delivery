'use client'
import { useState, useEffect } from 'react'
import { usePanier, type PanierItem } from '@/store/panier'
import { BOUCHERIES } from '@/lib/data'
import { haversine, calculerFrais, GPS_BOUCHERIES } from '@/lib/livraison'

// ── Panier mobile slide-up ────────────────────────────────────────────────────
export default function PanierMobile({ onClose, onCommander }: { onClose: () => void; onCommander: () => void }) {
  const { items, updateQuantite, removeItem, updateItem, sousTotal } = usePanier()
  const [clientGPS, setClientGPS] = useState<{ lat: number; lng: number } | null>(null)

  // État édition inline
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [expandDecoupe, setExpandDecoupe] = useState('')
  const [expandPrep, setExpandPrep] = useState('')
  const [expandNote, setExpandNote] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setClientGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    )
  }, [])

  const boucherieId = items[0]?.boucherie_id
  const gpsBoucherie = boucherieId ? GPS_BOUCHERIES[boucherieId] : null
  const distanceKm = clientGPS && gpsBoucherie
    ? Math.round(haversine(gpsBoucherie.lat, gpsBoucherie.lng, clientGPS.lat, clientGPS.lng) * 10) / 10
    : boucherieId ? ({ 1:1.2, 2:3.5, 3:0.8, 4:5.2, 5:7.1, 6:2.3 } as Record<number,number>)[boucherieId] || 2.5 : 2.5

  const frais = items.length > 0 ? calculerFrais(distanceKm) : 0
  const total = sousTotal() + frais

  function openEdit(item: PanierItem) {
    if (expandedKey === item.cart_key) { setExpandedKey(null); return }
    setExpandedKey(item.cart_key)
    setExpandDecoupe(item.decoupe || '')
    setExpandPrep(item.preparation || '')
    setExpandNote(item.note_boucher || '')
  }

  function saveEdit(item: PanierItem) {
    updateItem(item.cart_key, {
      decoupe: expandDecoupe,
      preparation: expandPrep,
      note_boucher: expandNote || undefined,
    })
    setExpandedKey(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onClose} />

      {/* Panel slide-up */}
      <div className="fixed bottom-0 left-0 right-0 z-[210] flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85dvh] flex flex-col shadow-2xl">

          {/* Handle + Header */}
          <div className="flex-shrink-0">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex justify-between items-center px-5 py-3 border-b border-gris-bd">
              <h2 className="font-serif text-lg font-black text-brun">🛒 Mon Panier</h2>
              <button className="bg-gris-bd rounded-full w-8 h-8 text-sm flex items-center justify-center" onClick={onClose}>✕</button>
            </div>
          </div>

          {/* Corps scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <span className="text-4xl block mb-3">🥩</span>
                <p className="text-sm font-semibold">Votre panier est vide</p>
                <p className="text-xs mt-1">Ajoutez des produits depuis une boucherie.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {items.map((item, i) => {
                  const boucherie = BOUCHERIES.find(b => b.id === item.boucherie_id)
                  const produit = boucherie?.produits.find(p => p.id === item.produit_id)
                  const isExpanded = expandedKey === item.cart_key

                  return (
                    <div key={item.cart_key} className={`py-3 ${i < items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
                      {/* Ligne principale */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brun truncate">{item.nom}</p>
                          {(item.decoupe || item.preparation) && (
                            <p className="text-[11px] text-or font-semibold mt-0.5">
                              ✂️ {[item.decoupe, item.preparation].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {item.note_boucher && (
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">📝 {item.note_boucher}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.boucherie_nom}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-black text-rouge-vif">{(item.prix * item.quantite).toFixed(2)} €</p>
                          <p className="text-[10px] text-gray-300">{item.prix.toFixed(2)} €/u</p>
                        </div>
                      </div>

                      {/* Contrôles quantité + actions */}
                      <div className="flex items-center justify-between mt-2 ml-8">
                        <div className="flex items-center gap-2">
                          <button className="w-7 h-7 rounded-full border-2 border-rouge-vif text-rouge-vif text-sm font-bold flex items-center justify-center active:bg-rouge-vif active:text-white transition-colors"
                            onClick={() => updateQuantite(item.cart_key, -1)}>−</button>
                          <span className="text-sm font-bold text-brun w-5 text-center">{item.quantite}</span>
                          <button className="w-7 h-7 rounded-full border-2 border-brun text-brun text-sm font-bold flex items-center justify-center active:bg-brun active:text-white transition-colors"
                            onClick={() => updateQuantite(item.cart_key, 1)}>+</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className={`border text-xs font-bold px-2.5 py-1.5 rounded-lg font-sans transition-colors ${isExpanded ? 'bg-brun text-white border-brun' : 'bg-or-pale border-or/30 text-brun-clair'}`}
                            onClick={() => openEdit(item)}>
                            ✏️ {isExpanded ? 'Fermer' : 'Modifier'}
                          </button>
                          <button
                            className="bg-red-50 border border-red-200 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-lg font-sans"
                            onClick={() => removeItem(item.cart_key)}>
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Édition inline (accordéon) */}
                      {isExpanded && (
                        <div className="mt-2 ml-8 bg-creme rounded-xl p-3 space-y-3">
                          {produit?.decoupes && produit.decoupes.length > 0 && (
                            <div>
                              <p className="text-[11px] font-bold text-brun mb-1.5">✂️ Découpe</p>
                              <div className="flex flex-wrap gap-1.5">
                                {produit.decoupes.map(d => (
                                  <button key={d} onClick={() => setExpandDecoupe(d)}
                                    className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${expandDecoupe === d ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200'}`}>
                                    {d}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {produit?.preparation && produit.preparation.length > 0 && (
                            <div>
                              <p className="text-[11px] font-bold text-brun mb-1.5">🌿 Préparation</p>
                              <div className="flex flex-wrap gap-1.5">
                                {produit.preparation.map(pr => (
                                  <button key={pr} onClick={() => setExpandPrep(pr)}
                                    className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${expandPrep === pr ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200'}`}>
                                    {pr}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <p className="text-[11px] font-bold text-brun mb-1">📝 Note pour le boucher</p>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-sans outline-none focus:border-brun"
                              placeholder="Ex: sans gras, pour 4 personnes…"
                              value={expandNote}
                              onChange={e => setExpandNote(e.target.value)}
                            />
                          </div>
                          <button
                            className="w-full bg-brun text-white rounded-lg py-2 text-xs font-bold font-sans active:bg-rouge-vif transition-colors"
                            onClick={() => saveEdit(item)}>
                            ✅ Valider les modifications
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer fixe */}
          {items.length > 0 && (
            <div className="flex-shrink-0 px-5 py-4 border-t border-gris-bd bg-white">
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Sous-total ({items.reduce((s, i) => s + i.quantite, 0)} articles)</span>
                  <span>{sousTotal().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Livraison</span>
                  <span>{frais === 0 ? 'Offerte' : `${frais.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-brun pt-1 border-t border-gris-bd">
                  <span>Total</span>
                  <span className="text-rouge-vif">{total.toFixed(2)} €</span>
                </div>
              </div>
              <button
                className="w-full bg-rouge-vif text-white rounded-xl py-3.5 text-sm font-bold font-sans active:bg-brun transition-colors"
                onClick={onCommander}>
                Commander — {total.toFixed(2)} € →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
