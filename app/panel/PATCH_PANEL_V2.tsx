// ════════════════════════════════════════════════════════════════════════════
// PATCH panel/page.tsx — Améliorations boucher
// Ajouter ces éléments dans le fichier existant
// ════════════════════════════════════════════════════════════════════════════

// ── 1. CHAMP ALLERGÈNES dans l'interface ProduitForm ─────────────────────────
// Ajouter dans l'interface ProduitForm :
// allergenes: string   // ex: "Gluten, Sulfites"

// ── 2. CHAMP ALLERGÈNES dans emptyForm() ─────────────────────────────────────
// Ajouter : allergenes: ''

// ── 3. DANS LE MODAL PRODUIT — Ajouter après le champ "Préparations" ────────
{/* Allergènes */}
<div>
  <label className="text-xs font-bold text-brun block mb-1">
    ⚠️ Allergènes <span className="text-rouge-vif">*</span>
    <span className="text-gray-400 font-normal ml-1">(obligatoire)</span>
  </label>
  <div className="flex flex-wrap gap-1.5 mb-2">
    {['Gluten','Crustacés','Œufs','Poisson','Arachides','Soja','Lait','Fruits à coque','Céleri','Moutarde','Sésame','Sulfites','Lupin','Mollusques','Aucun'].map(a => {
      const selected = (modalProd.allergenes || '').split(',').map(s => s.trim()).filter(Boolean).includes(a)
      return (
        <button key={a}
          className={'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all font-sans ' + (selected ? 'bg-brun text-white border-brun' : 'border-gray-200 text-gray-500')}
          onClick={() => {
            const current = (modalProd.allergenes || '').split(',').map(s => s.trim()).filter(Boolean)
            const next = selected
              ? current.filter(x => x !== a)
              : a === 'Aucun' ? ['Aucun'] : [...current.filter(x => x !== 'Aucun'), a]
            setModalProd(f => f ? { ...f, allergenes: next.join(', ') } : f)
          }}>
          {a}
        </button>
      )
    })}
  </div>
  {!(modalProd.allergenes) && (
    <p className="text-[11px] text-rouge-vif">⚠️ Sélectionnez au moins "Aucun" (obligation légale)</p>
  )}
</div>

// ── 4. BOUTON OUVERT/FERMÉ dans le header ────────────────────────────────────
// Dans le header du panel, ajouter à côté du bouton déconnexion :
const [isOpen, setIsOpen] = useState(true)  // à ajouter dans les states

// Dans le header JSX :
<button
  className={'border rounded-xl px-3 py-1.5 text-xs font-bold transition-all ' + (isOpen ? 'bg-green-500 border-green-500 text-white' : 'bg-red-100 border-red-300 text-red-600')}
  onClick={() => { setIsOpen(o => !o); showToast(isOpen ? '🔴 Boutique fermée' : '🟢 Boutique ouverte') }}>
  {isOpen ? '🟢 Ouvert' : '🔴 Fermé'}
</button>

// ── 5. ACCEPTER / REFUSER une commande ───────────────────────────────────────
// Dans la carte commande, remplacer le bouton "Préparer →" par :
{o.status === 'new' && (
  <div className="px-4 pb-4 flex gap-2">
    <button
      className="flex-1 bg-red-50 border border-red-200 text-red-500 text-sm font-bold py-3 rounded-xl font-sans"
      onClick={() => {
        setOrders(prev => prev.filter(x => x.id !== o.id))
        showToast('❌ Commande refusée — client notifié')
      }}>
      Refuser
    </button>
    <button
      className="flex-[2] bg-brun text-white text-sm font-bold py-3 rounded-xl font-sans"
      onClick={() => progress(o.id)}>
      ✅ Accepter →
    </button>
  </div>
)}

// ── 6. STOCK AUTOMATIQUE — dans la fonction progress() ───────────────────────
// Quand une commande passe de 'new' à 'prep', décrémenter le stock
// Ajouter dans progress() après setOrders :
if (o.status === 'new') {
  // Décrémenter le stock des produits commandés
  setProduits(prev => prev.map(p => {
    const ligne = o.lignes.find(l => l.produit === p.nom)
    if (!ligne) return p
    return { ...p, stock: Math.max(0, p.stock - ligne.qty) }
  }))
}

// ── 7. ALERTE PHOTO MANQUANTE dans la liste produits ─────────────────────────
// Dans la liste produits, après le badge stock, ajouter :
{!p.photoUrl && (
  <span className="text-[10px] bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full font-bold">
    📷 Photo manquante
  </span>
)}
