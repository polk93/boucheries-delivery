'use client'
import { useState } from 'react'
import Link from 'next/link'

interface ConfirmationLegaleProps {
  items: any[]
  sousTotal: number
  frais: number
  reduction: number
  total: number
  mode: string
  adresse?: { rue: string; ville: string }
  onConfirm: () => void
  onBack: () => void
}

export default function ConfirmationLegale({
  items, sousTotal, frais, reduction, total, mode, adresse, onConfirm, onBack
}: ConfirmationLegaleProps) {
  const [cguAccepted, setCguAccepted] = useState(false)
  const [ageChecked,  setAgeChecked]  = useState(false)

  return (
    <div className="space-y-4">
      {/* Récapitulatif légal obligatoire (directive UE 2011/83) */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
          <p className="font-bold text-brun text-sm">📋 Récapitulatif de votre commande</p>
          <p className="text-[10px] text-gray-400">Vérifiez avant de confirmer votre achat</p>
        </div>
        <div className="p-4 space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-start text-sm">
              <div className="flex-1">
                <p className="font-semibold text-brun">{item.icon} {item.nom}</p>
                <p className="text-xs text-gray-400">×{item.quantite} · {item.decoupe || 'Standard'}</p>
              </div>
              <span className="font-bold text-brun ml-2">{(item.prix * item.quantite).toFixed(2)} €</span>
            </div>
          ))}
          <div className="border-t border-gris-bd pt-2 space-y-1.5 mt-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sous-total</span><span>{sousTotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Livraison</span><span>{frais === 0 ? 'Offerte' : frais.toFixed(2) + ' €'}</span>
            </div>
            {reduction > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-semibold">
                <span>🏷️ Réduction</span><span>-{reduction.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-brun border-t border-gris-bd pt-1.5">
              <span>Total à payer</span>
              <span className="text-rouge-vif">{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode de livraison */}
      <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
        <span className="text-xl">{mode === 'livraison' ? '🛵' : '🏪'}</span>
        <div>
          <p className="text-sm font-semibold text-brun">
            {mode === 'livraison' ? 'Livraison à domicile' : 'Click & Collect'}
          </p>
          {adresse && mode === 'livraison' && (
            <p className="text-xs text-gray-400">{adresse.rue}, {adresse.ville}</p>
          )}
        </div>
      </div>

      {/* Politique retour */}
      <div className="bg-or-pale border border-or/20 rounded-xl p-3 space-y-2">
        <p className="text-xs font-bold text-brun">ℹ️ Droit de rétractation</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Conformément à l'<strong>art. L.221-28 du Code de la consommation</strong>, les denrées alimentaires
          périssables sont exclues du droit de rétractation de 14 jours. En cas de problème de qualité,
          contactez-nous dans les 2h suivant la livraison.
        </p>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Ordonnance n°2026-51 du 5 janv. 2026 — pour tout produit non périssable, vous pouvez exercer
          votre droit de rétractation en ligne depuis « Mes commandes ».
        </p>
      </div>

      {/* Checkboxes légales */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${cguAccepted ? 'bg-brun border-brun' : 'border-gray-300'}`}
            onClick={() => setCguAccepted(v => !v)}>
            {cguAccepted && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            J'accepte les{' '}
            <Link href="/cgv" target="_blank" className="text-brun font-semibold underline">Conditions Générales de Vente</Link>
            {' '}et la{' '}
            <Link href="/parametres?section=confidentialite" target="_blank" className="text-brun font-semibold underline">Politique de confidentialité</Link>
            {' '}de Côte à Côte. *
          </p>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${ageChecked ? 'bg-brun border-brun' : 'border-gray-300'}`}
            onClick={() => setAgeChecked(v => !v)}>
            {ageChecked && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Je confirme être majeur(e) et avoir l'autorité pour effectuer cet achat. *
          </p>
        </label>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-gris-bd text-brun font-semibold py-3 rounded-xl text-sm font-sans"
          onClick={onBack}>← Modifier</button>
        <button
          className="flex-[2] bg-rouge-vif text-white font-bold py-3 rounded-xl text-sm font-sans disabled:bg-gray-300"
          disabled={!cguAccepted || !ageChecked}
          onClick={onConfirm}>
          🔒 Payer {total.toFixed(2)} € →
        </button>
      </div>
      <p className="text-[10px] text-gray-300 text-center">Paiement sécurisé SSL · Propulsé par Stripe</p>
    </div>
  )
}
