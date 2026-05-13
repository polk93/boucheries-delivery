'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePanier } from '@/store/panier'
import type { Produit, Boucherie } from '@/lib/data'

interface Props {
  produit: Produit
  boucherie: Boucherie
  onClose: () => void
}

export default function ModalPersonnalisation({ produit: p, boucherie: b, onClose }: Props) {
  const [decoupe, setDecoupe] = useState(p.decoupes?.[0] ?? '')
  const [preparation, setPreparation] = useState(p.preparation?.[0] ?? '')
  const [noteBoucher, setNoteBoucher] = useState('')
  const { addItem } = usePanier()

  function confirm() {
    addItem({
      produit_id: p.id,
      boucherie_id: b.id,
      boucherie_nom: b.nom,
      nom: p.nom,
      prix: p.prix,
      icon: p.icon,
      quantite: 1,
      decoupe,
      preparation,
      note_boucher: noteBoucher || undefined,
    })
    toast.success(`✅ ${p.nom} ajouté (${decoupe})`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="font-serif text-xl font-black text-brun mb-1">✂️ {p.nom}</h2>
        <p className="text-xs text-gray-400 mb-5">Personnalisez votre découpe avant d'ajouter au panier</p>

        {/* Découpe */}
        {p.decoupes?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-brun mb-2">🔪 Découpe souhaitée</p>
            <div className="flex flex-wrap gap-2">
              {p.decoupes.map(d => (
                <button key={d}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${decoupe === d ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200 hover:border-brun'}`}
                  onClick={() => setDecoupe(d)}>{d}</button>
              ))}
            </div>
          </div>
        )}

        {/* Préparation */}
        {p.preparation?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-brun mb-2">🌿 Préparation</p>
            <div className="flex flex-wrap gap-2">
              {p.preparation.map(pr => (
                <button key={pr}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${preparation === pr ? 'bg-brun text-white border-brun' : 'bg-white text-gray-500 border-gray-200 hover:border-brun'}`}
                  onClick={() => setPreparation(pr)}>{pr}</button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mb-5">
          <p className="text-xs font-bold text-brun mb-2">📝 Note pour le boucher (optionnel)</p>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-sans outline-none focus:border-brun resize-none"
            rows={3}
            placeholder="Ex: Sans gras, bien faisandé, pour 4 personnes…"
            value={noteBoucher}
            onChange={e => setNoteBoucher(e.target.value)}
          />
        </div>

        {/* Prix */}
        <div className="flex justify-between items-center mb-4 p-3 bg-creme rounded-xl">
          <span className="text-sm text-brun">{p.nom}</span>
          <span className="text-base font-black text-rouge-vif">{p.prix.toFixed(2)} €</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-gris-bd text-brun border-none rounded-xl py-3 text-sm font-semibold cursor-pointer font-sans" onClick={onClose}>
            Annuler
          </button>
          <button className="flex-[2] bg-rouge-vif text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer font-sans hover:bg-brun transition-colors" onClick={confirm}>
            🛒 Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  )
}
