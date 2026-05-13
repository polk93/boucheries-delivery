'use client'
import { usePanier } from '@/store/panier'

export default function Panier({ onCommander }: { onCommander: () => void }) {
  const { items, updateQuantite, sousTotal } = usePanier()
  const frais = items.length > 0 ? 2.90 : 0
  const total = sousTotal() + frais

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
      <h2 className="font-serif text-lg font-bold text-brun mb-4 flex items-center gap-2">🛒 Mon Panier</h2>

      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          <span className="text-4xl block mb-2">🥩</span>
          Votre panier est vide.<br />Ajoutez des produits depuis une boucherie.
        </div>
      ) : (
        <>
          {items.map(item => (
            <div key={item.cart_key} className="flex items-start py-2.5 border-b border-gris-bd gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brun truncate">{item.nom}</p>
                {item.decoupe && <p className="text-[10px] text-or font-semibold">✂️ {item.decoupe}{item.preparation ? ` • ${item.preparation}` : ''}</p>}
                <p className="text-xs text-gray-400">{item.boucherie_nom}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                <button className="w-6 h-6 rounded-full border-[1.5px] border-rouge-vif text-rouge-vif text-sm font-bold flex items-center justify-center hover:bg-rouge-vif hover:text-white transition-colors"
                  onClick={() => updateQuantite(item.cart_key, -1)}>−</button>
                <span className="text-sm font-bold text-brun w-4 text-center">{item.quantite}</span>
                <button className="w-6 h-6 rounded-full border-[1.5px] border-rouge-vif text-rouge-vif text-sm font-bold flex items-center justify-center hover:bg-rouge-vif hover:text-white transition-colors"
                  onClick={() => updateQuantite(item.cart_key, 1)}>+</button>
                <span className="text-sm font-bold text-rouge-vif ml-1 whitespace-nowrap">{(item.prix * item.quantite).toFixed(2)} €</span>
              </div>
            </div>
          ))}

          <div className="mt-3.5 pt-3 border-t-2 border-brun">
            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Sous-total</span><span>{sousTotal().toFixed(2)} €</span></div>
            <div className="flex justify-between text-xs text-gray-400 mb-2"><span>Livraison</span><span>{frais.toFixed(2)} €</span></div>
            <div className="flex justify-between text-sm font-bold text-brun"><span>Total</span><span>{total.toFixed(2)} €</span></div>
          </div>

          <button
            className="w-full bg-rouge-vif text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer mt-3.5 hover:bg-brun transition-colors font-sans"
            onClick={onCommander}>
            Commander →
          </button>
        </>
      )}
    </div>
  )
}
