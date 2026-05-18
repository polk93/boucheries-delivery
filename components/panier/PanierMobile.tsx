'use client'
import { useState, useEffect } from 'react'
import { usePanier, type PanierItem } from '@/store/panier'
import { BOUCHERIES } from '@/lib/data'
import { haversine, calculerFrais, GPS_BOUCHERIES } from '@/lib/livraison'

// ── Modal édition article ─────────────────────────────────────────────────────
function EditItemModal({ item, onClose }: { item: PanierItem; onClose: () => void }) {
  const { updateItem, removeItem } = usePanier()
  const boucherie = BOUCHERIES.find(b => b.id === item.boucherie_id)
  const produit = boucherie?.produits.find(p => p.id === item.produit_id)

  const [decoupe, setDecoupe] = useState(item.decoupe || '')
  const [preparation, setPreparation] = useState(item.preparation || '')
  const [note, setNote] = useState(item.note_boucher || '')
  const [quantite, setQuantite] = useState(item.quantite)

  function save() {
    if (quantite === 0) { removeItem(item.cart_key); onClose(); return }
    updateItem(item.cart_key, { decoupe, preparation, note_boucher: note || undefined, quantite })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[350] flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center px-5 py-4 border-b border-gris-bd sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-serif text-base font-black text-brun">{item.icon} {item.nom}</h3>
            <p className="text-xs text-gray-400">{item.boucherie_nom} · {item.prix.toFixed(2)} € / unité</p>
          </div>
          <button className="bg-gris-bd rounded-full w-8 h-8 text-sm flex items-center justify-center flex-shrink-0" onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Quantité */}
          <div>
            <p className="text-xs font-bold text-brun mb-2">Quantité</p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full border-2 border-rouge-vif text-rouge-vif text-xl font-bold flex items-center justify-center active:bg-rouge-vif active:text-white transition-colors"
                onClick={() => setQuantite(q => Math.max(0, q - 1))}>−</button>
              <span className="text-xl font-black text-brun w-6 text-center">{quantite}</span>
              <button className="w-10 h-10 rounded-full border-2 border-brun text-brun text-xl font-bold flex items-center justify-center active:bg-brun active:text-white transition-colors"
                onClick={() => setQuantite(q => q + 1)}>+</button>
              {quantite === 0 && <span className="text-xs text-rouge-vif font-semibold">→ Sera supprimé</span>}
            </div>
          </div>

          {/* Découpe */}
          {produit?.decoupes && produit.decoupes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-brun mb-2">✂️ Découpe</p>
              <div className="flex flex-wrap gap-2">
                {produit.decoupes.map(d => (
                  <button key={d}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${decoupe === d ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200'}`}
                    onClick={() => setDecoupe(d)}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {/* Préparation */}
          {produit?.preparation && produit.preparation.length > 0 && (
            <div>
              <p className="text-xs font-bold text-brun mb-2">🌿 Préparation</p>
              <div className="flex flex-wrap gap-2">
                {produit.preparation.map(pr => (
                  <button key={pr}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${preparation === pr ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200'}`}
                    onClick={() => setPreparation(pr)}>{pr}</button>
                ))}
              </div>
            </div>
          )}

          {/* Note boucher */}
          <div>
            <p className="text-xs font-bold text-brun mb-2">📝 Note pour le boucher</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none"
              rows={2}
              placeholder="Ex: Sans gras, pour 4 personnes…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Récap */}
          <div className="bg-creme rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">{quantite} × {item.prix.toFixed(2)} €</span>
            <span className="font-black text-rouge-vif">{(item.prix * quantite).toFixed(2)} €</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <button className="flex-1 bg-red-50 text-red-400 border border-red-200 rounded-xl py-3 text-sm font-semibold font-sans"
              onClick={() => { removeItem(item.cart_key); onClose() }}>🗑️ Supprimer</button>
            <button className="flex-[2] bg-brun text-white rounded-xl py-3 text-sm font-bold font-sans active:bg-rouge-vif transition-colors"
              onClick={save}>✅ Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Panier mobile slide-up ────────────────────────────────────────────────────
export default function PanierMobile({ onClose, onCommander }: { onClose: () => void; onCommander: () => void }) {
  const { items, updateQuantite, removeItem, sousTotal } = usePanier()
  const [editItem, setEditItem] = useState<PanierItem | null>(null)
  const [clientGPS, setClientGPS] = useState<{ lat: number; lng: number } | null>(null)

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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onClose} />

      {/* Panel slide-up */}
      <div className="fixed bottom-0 left-0 right-0 z-[210] flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85dvh] flex flex-col shadow-2xl">

          {/* Handle + Header */}
          <div className="flex-shrink-0">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
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
                {items.map((item, i) => (
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

                    {/* Contrôles */}
                    <div className="flex items-center justify-between mt-2 ml-8">
                      {/* Quantité */}
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 rounded-full border-2 border-rouge-vif text-rouge-vif text-sm font-bold flex items-center justify-center active:bg-rouge-vif active:text-white transition-colors"
                          onClick={() => updateQuantite(item.cart_key, -1)}>−</button>
                        <span className="text-sm font-bold text-brun w-5 text-center">{item.quantite}</span>
                        <button className="w-7 h-7 rounded-full border-2 border-brun text-brun text-sm font-bold flex items-center justify-center active:bg-brun active:text-white transition-colors"
                          onClick={() => updateQuantite(item.cart_key, 1)}>+</button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Modifier (découpe/préparation/note) */}
                        <button
                          className="bg-or-pale border border-or/30 text-brun-clair text-xs font-bold px-2.5 py-1.5 rounded-lg active:bg-or active:text-white transition-colors font-sans flex items-center gap-1"
                          onClick={() => setEditItem(item)}>
                          ✏️ Modifier
                        </button>
                        {/* Supprimer */}
                        <button
                          className="bg-red-50 border border-red-200 text-red-400 text-xs font-bold px-2.5 py-1.5 rounded-lg active:bg-red-100 transition-colors font-sans"
                          onClick={() => removeItem(item.cart_key)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer fixe */}
          {items.length > 0 && (
            <div className="flex-shrink-0 px-5 py-4 border-t border-gris-bd bg-white">
              {/* Totaux */}
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

              {/* CTA Commander */}
              <button
                className="w-full bg-rouge-vif text-white rounded-xl py-3.5 text-sm font-bold font-sans active:bg-brun transition-colors"
                onClick={onCommander}>
                Commander — {total.toFixed(2)} € →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal édition article */}
      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} />}
    </>
  )
}
