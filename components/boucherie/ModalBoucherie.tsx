'use client'
import type { Boucherie, Produit } from '@/lib/data'

// ── ModalBoucherie ───────────────────────────────────────────
interface ModalBoucherieProps {
  boucherie: Boucherie
  onClose: () => void
  onAddProduit: (prod: Produit) => void
}

function stockInfo(qty: number) {
  if (qty === 0) return { label: 'Rupture', cls: 'text-gray-400', dot: 'bg-gray-300' }
  if (qty <= 4) return { label: `Plus que ${qty}`, cls: 'text-orange-500', dot: 'bg-orange-400' }
  return { label: `En stock (${qty})`, cls: 'text-green-600', dot: 'bg-green-500' }
}

export default function ModalBoucherie({ boucherie: b, onClose, onAddProduit }: ModalBoucherieProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <img src={b.img} alt={b.nom} className="w-full h-48 object-cover rounded-t-3xl" />
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="font-serif text-2xl font-black text-brun">{b.nom}</h2>
              <p className="text-or font-semibold text-sm mt-1">
                ⭐ {b.note} · {b.avis} avis · 🕐 {b.livraison} · 🚚 {b.frais === 0 ? 'Gratuit' : `${b.frais.toFixed(2)} €`}
              </p>
              {!b.ouvert && <p className="text-rouge-vif font-bold text-sm mt-1">⛔ Boutique fermée</p>}
            </div>
            <button className="bg-gris-bd border-none rounded-full w-9 h-9 text-base cursor-pointer flex items-center justify-center hover:bg-gray-200"
              onClick={onClose}>✕</button>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-5">{b.desc}</p>

          {/* Produits */}
          <h3 className="font-serif text-base font-bold text-brun mb-3">✂️ Nos produits — personnalisez votre découpe</h3>
          <div className="grid grid-cols-2 gap-3">
            {b.produits.map(p => {
              const si = stockInfo(p.stock)
              return (
                <div key={p.id} className="bg-creme rounded-xl overflow-hidden border-[1.5px] border-transparent hover:border-or transition-colors flex flex-col">
                  {p.photo
                    ? <img src={p.photo} alt={p.nom} className="w-full h-24 object-cover" />
                    : <div className="w-full h-24 bg-gradient-to-br from-gris-bd to-or-pale flex items-center justify-center text-4xl">{p.icon}</div>
                  }
                  <div className="p-2.5">
                    <p className="text-sm font-bold text-brun">{p.nom}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{p.desc}</p>
                    <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${si.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${si.dot}`} />{si.label}
                    </p>
                    {p.decoupes && <p className="text-[10px] text-or font-semibold mt-0.5">✂️ {p.decoupes.length} découpages</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-bold text-rouge-vif">{p.prix.toFixed(2)} €</span>
                      <button
                        className="bg-brun text-white border-none rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-rouge-vif transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={p.stock === 0 || !b.ouvert}
                        onClick={() => onAddProduit(p)}>
                        {p.stock === 0 ? 'Épuisé' : '✂️ Choisir'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
