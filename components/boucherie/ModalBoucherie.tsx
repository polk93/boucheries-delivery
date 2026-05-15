'use client'
import { useState } from 'react'
import type { Boucherie, Produit } from '@/lib/data'

// ── Filtres carrousel ─────────────────────────────────────────────────────────
const FILTRES = [
  { id:'tous',     label:'Tout',      icon:'🛒' },
  { id:'Bœuf',    label:'Bœuf',      icon:'🥩' },
  { id:'Veau',    label:'Veau',      icon:'🍖' },
  { id:'Agneau',  label:'Agneau',    icon:'🐑' },
  { id:'Volaille',label:'Volaille',  icon:'🐓' },
  { id:'Entrée',  label:'Entrées',   icon:'🧀' },
]

const ESPECES: Array<'Bœuf'|'Veau'|'Agneau'|'Volaille'> = ['Bœuf','Veau','Agneau','Volaille']

// ── Helpers ───────────────────────────────────────────────────────────────────
function stockInfo(qty: number) {
  if (qty === 0) return { label:'Épuisé',       cls:'text-gray-400',   dot:'bg-gray-300'   }
  if (qty <= 4)  return { label:`Plus que ${qty}`,cls:'text-orange-500',dot:'bg-orange-400' }
  return               { label:`En stock (${qty})`,cls:'text-green-600',dot:'bg-green-500'  }
}

// ── Carte viande (à la pièce) ─────────────────────────────────────────────────
function CarteViande({ p, onAdd, ouvert }: { p: Produit; onAdd: (p: Produit) => void; ouvert: boolean }) {
  const si = stockInfo(p.stock)
  return (
    <div className="bg-creme rounded-2xl overflow-hidden border border-gris-bd flex flex-col">
      {p.photo
        ? <img src={p.photo} alt={p.nom} className="w-full h-24 object-cover" />
        : <div className="w-full h-24 bg-gris-bd flex items-center justify-center text-4xl">{p.icon}</div>
      }
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-xs font-bold text-brun leading-tight">{p.nom}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight flex-1">{p.desc}</p>
        <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${si.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${si.dot}`}/>{si.label}
        </p>
        {p.decoupes?.length > 0 && (
          <p className="text-[10px] text-or font-semibold mt-0.5">✂️ {p.decoupes.length} découpe{p.decoupes.length > 1 ? 's' : ''}</p>
        )}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gris-bd">
          <span className="text-sm font-bold text-rouge-vif">{p.prix.toFixed(2)} €</span>
          <button
            disabled={p.stock === 0 || !ouvert}
            onClick={() => onAdd(p)}
            className="bg-brun text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 hover:bg-rouge-vif transition-colors font-sans">
            {p.stock === 0 ? 'Épuisé' : '✂️ Choisir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Carte entrée à la pièce (charcuterie tranchée) ───────────────────────────
function CartePiece({ p, onAdd, ouvert }: { p: Produit; onAdd: (p: Produit) => void; ouvert: boolean }) {
  const si = stockInfo(p.stock)
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gris-bd flex flex-col">
      <div className="w-full h-20 bg-gris-bd flex items-center justify-center text-3xl relative">
        {p.icon}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-xs font-bold text-brun leading-tight">{p.nom}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight flex-1">{p.desc}</p>
        <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${si.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${si.dot}`}/>{si.label}
        </p>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gris-bd">
          <span className="text-sm font-bold text-rouge-vif">{p.prix.toFixed(2)} €</span>
          <button
            disabled={p.stock === 0 || !ouvert}
            onClick={() => onAdd(p)}
            className="bg-brun text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 hover:bg-rouge-vif transition-colors font-sans">
            {p.stock === 0 ? 'Épuisé' : '+ Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Carte entrée au poids (salades traiteur) ──────────────────────────────────
function CartePoids({ p, onAdd, ouvert }: { p: Produit; onAdd: (p: Produit) => void; ouvert: boolean }) {
  const [g, setG] = useState(100)
  const si = stockInfo(p.stock)
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gris-bd flex flex-col">
      <div className="w-full h-20 bg-or-pale flex items-center justify-center text-3xl relative">
        {p.icon}
        <span className="absolute top-1.5 right-1.5 bg-or text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">⚖️</span>
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-xs font-bold text-brun leading-tight">{p.nom}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{p.desc}</p>
        <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${si.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${si.dot}`}/>{si.label}
        </p>
        {/* Sélecteur grammes */}
        {p.stock > 0 && (
          <div className="mt-2 bg-or-pale rounded-xl p-2 border border-or/20">
            <div className="flex items-center gap-1.5 mb-1">
              <button onClick={() => setG(q => Math.max(50, q - 50))}
                className="w-6 h-6 rounded-full border border-or/40 text-brun-clair font-bold text-sm flex items-center justify-center font-sans">−</button>
              <span className="flex-1 text-center font-bold text-brun text-xs">{g} g</span>
              <button onClick={() => setG(q => Math.min(1000, q + 50))}
                className="w-6 h-6 rounded-full border border-or/40 text-brun-clair font-bold text-sm flex items-center justify-center font-sans">+</button>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-400">{p.prix.toFixed(2)} €/kg</span>
              <span className="text-xs font-bold text-rouge-vif">{(p.prix * g / 1000).toFixed(2)} €</span>
            </div>
          </div>
        )}
        <button
          disabled={p.stock === 0 || !ouvert}
          onClick={() => onAdd(p)}
          className="w-full mt-2 bg-brun text-white text-[11px] font-bold py-1.5 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 hover:bg-rouge-vif transition-colors font-sans">
          {p.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}

// ── Section Entrées ───────────────────────────────────────────────────────────
function SectionEntrees({ produits, onAdd, ouvert }: { produits: Produit[]; onAdd: (p: Produit) => void; ouvert: boolean }) {
  const piece = produits.filter(p => p.venteType === 'pièce')
  const poids  = produits.filter(p => p.venteType === 'poids')

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entrées</span>
        <div className="flex-1 h-px bg-gris-bd" />
        <span className="text-[10px] text-gray-400">{produits.length} produit{produits.length > 1 ? 's' : ''}</span>
      </div>

      {/* À la pièce */}
      {piece.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-bold text-brun bg-gris-bd px-2.5 py-1 rounded-full">🔢 À la pièce</span>
            <div className="flex-1 h-px bg-gris-bd" />
            <span className="text-[10px] text-gray-400">{piece.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {piece.map(p => <CartePiece key={p.id} p={p} onAdd={onAdd} ouvert={ouvert} />)}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-0.5">Coppa, jambon, saucisson, pâté… vendus en portions.</p>
        </div>
      )}

      {/* Au poids */}
      {poids.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-bold text-brun bg-or-pale px-2.5 py-1 rounded-full">⚖️ Au poids</span>
            <div className="flex-1 h-px bg-gris-bd" />
            <span className="text-[10px] text-gray-400">{poids.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {poids.map(p => <CartePoids key={p.id} p={p} onAdd={onAdd} ouvert={ouvert} />)}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-0.5">Taboulé, carottes râpées, céleri rémoulade… préparés chaque matin.</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
interface ModalBoucherieProps {
  boucherie: Boucherie
  onClose: () => void
  onAddProduit: (prod: Produit) => void
}

export default function ModalBoucherie({ boucherie: b, onClose, onAddProduit }: ModalBoucherieProps) {
  const [filtre, setFiltre] = useState('tous')

  // Ne garder que les filtres ayant des produits dans cette boucherie
  const filtresDispos = FILTRES.filter(f => {
    if (f.id === 'tous') return true
    return b.produits.some(p => p.cat === f.id)
  })

  // Produits par catégorie
  const getProds = (cat: string) => b.produits.filter(p => p.cat === cat)
  const filtres_viande = ESPECES.filter(e => b.produits.some(p => p.cat === e))

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Photo hero ── */}
        <div className="relative flex-shrink-0">
          <img src={b.img} alt={b.nom} className="w-full object-cover rounded-t-3xl" style={{ height: 148 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent rounded-t-3xl" />
          <div className="absolute bottom-3 left-4 right-10">
            <div className="flex flex-wrap gap-1 mb-1">
              {b.tags.map(t => (
                <span key={t} className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
            <h2 className="font-serif text-lg font-black text-white">{b.nom}</h2>
            <p className="text-or text-[11px] font-semibold mt-0.5">
              ⭐ {b.note} · {b.avis} avis · 🕐 {b.livraison} · 🚚 {b.frais === 0 ? 'Gratuit' : `${b.frais.toFixed(2)} €`}
            </p>
            {!b.ouvert && <p className="text-red-400 text-[11px] font-bold mt-0.5">⛔ Boutique fermée</p>}
          </div>
          <button className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-brun text-sm font-bold shadow"
            onClick={onClose}>✕</button>
        </div>

        {/* Description */}
        <p className="text-[11px] text-gray-500 leading-relaxed px-4 pt-3 pb-2 flex-shrink-0">{b.desc}</p>

        {/* ── Carrousel filtres ── */}
        <div className="px-4 pb-2.5 flex-shrink-0 border-b border-gris-bd">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filtresDispos.map(f => {
              const actif = filtre === f.id
              const count = f.id === 'tous'
                ? b.produits.length
                : b.produits.filter(p => p.cat === f.id).length
              return (
                <button key={f.id} onClick={() => setFiltre(f.id)}
                  className={`flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 border-2 transition-all font-sans ${
                    actif
                      ? 'bg-brun border-brun text-white shadow-md'
                      : 'bg-white border-gris-bd text-gray-600'
                  }`}>
                  <span className="text-sm">{f.icon}</span>
                  {f.label}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${actif ? 'bg-white/20 text-white' : 'bg-gris-bd text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Catalogue scrollable ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

          {/* VUE TOUS */}
          {filtre === 'tous' && (<>
            {/* Viandes par espèce */}
            {filtres_viande.map(espece => {
              const prods = getProds(espece)
              return (
                <div key={espece}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{espece}</span>
                    <div className="flex-1 h-px bg-gris-bd" />
                    <span className="text-[10px] text-gray-400">{prods.length} produit{prods.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {prods.map(p => <CarteViande key={p.id} p={p} onAdd={onAddProduit} ouvert={b.ouvert} />)}
                  </div>
                </div>
              )
            })}

            {/* Entrées */}
            {b.produits.some(p => p.cat === 'Entrée') && (
              <SectionEntrees
                produits={b.produits.filter(p => p.cat === 'Entrée')}
                onAdd={onAddProduit}
                ouvert={b.ouvert}
              />
            )}
          </>)}

          {/* VUE ESPÈCE */}
          {ESPECES.includes(filtre as any) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{filtre}</span>
                <div className="flex-1 h-px bg-gris-bd" />
                <span className="text-[10px] text-gray-400">{getProds(filtre).length} produit{getProds(filtre).length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {getProds(filtre).map(p => <CarteViande key={p.id} p={p} onAdd={onAddProduit} ouvert={b.ouvert} />)}
              </div>
            </div>
          )}

          {/* VUE ENTRÉES */}
          {filtre === 'Entrée' && (
            <SectionEntrees
              produits={b.produits.filter(p => p.cat === 'Entrée')}
              onAdd={onAddProduit}
              ouvert={b.ouvert}
            />
          )}
        </div>
      </div>
    </div>
  )
}
