// Composant à ajouter dans panel/page.tsx avant MdpSection

function CaSelector({ historique }: { historique: Commande[] }) {
  const [periode, setPeriode] = useState<'jour'|'semaine'|'mois'|'annee'>('jour')

  const now = new Date()

  function getDebut(p: typeof periode): Date {
    const d = new Date()
    if (p === 'jour')    { d.setHours(0,0,0,0); return d }
    if (p === 'semaine') { const day = d.getDay(); d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); d.setHours(0,0,0,0); return d }
    if (p === 'mois')    { return new Date(d.getFullYear(), d.getMonth(), 1) }
    return new Date(d.getFullYear(), 0, 1)
  }

  const debut = getDebut(periode)
  const filtered = historique.filter(o => new Date(o.date.split('/').reverse().join('-')) >= debut)
  const ca          = filtered.reduce((s, o) => s + o.lignes.reduce((a, l) => a + l.prix * l.qty, 0) + o.frais, 0)
  const nbCommandes = filtered.length
  const panierMoyen = nbCommandes > 0 ? ca / nbCommandes : 0
  const fraisTotal  = filtered.reduce((s, o) => s + o.frais, 0)

  const PERIODES: { key: typeof periode; label: string }[] = [
    { key: 'jour',    label: "Aujourd'hui" },
    { key: 'semaine', label: 'Cette semaine' },
    { key: 'mois',    label: 'Ce mois' },
    { key: 'annee',   label: 'Cette année' },
  ]

  return (
    <div className="space-y-3">
      {/* Sélecteur */}
      <div className="grid grid-cols-4 gap-1.5 bg-white rounded-2xl p-2 shadow-sm">
        {PERIODES.map(p => (
          <button key={p.key}
            className={'py-2 rounded-xl text-[11px] font-bold font-sans transition-all ' + (periode === p.key ? 'bg-brun text-white' : 'text-gray-400')}
            onClick={() => setPeriode(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* CA principal */}
      <div className="bg-brun rounded-2xl p-5 text-center">
        <p className="text-white/60 text-xs mb-1">Chiffre d'affaires · {PERIODES.find(p => p.key === periode)?.label}</p>
        <p className="text-white font-black text-4xl">{ca.toFixed(2)} €</p>
        {nbCommandes === 0 && <p className="text-white/40 text-xs mt-2">Aucune commande sur cette période</p>}
      </div>

      {/* Stats détaillées */}
      {nbCommandes > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { ico: '📋', val: String(nbCommandes),          label: 'Commandes' },
            { ico: '🧺', val: panierMoyen.toFixed(2) + ' €', label: 'Panier moyen' },
            { ico: '🛵', val: fraisTotal.toFixed(2) + ' €',  label: 'Livraisons' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
              <div className="text-lg mb-0.5">{s.ico}</div>
              <div className="font-black text-brun text-sm">{s.val}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Liste transactions */}
      {nbCommandes > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-or-pale border-b border-gris-bd flex justify-between">
            <p className="text-xs font-bold text-brun">Transactions</p>
            <p className="text-xs text-gray-400">{nbCommandes} commande{nbCommandes > 1 ? 's' : ''}</p>
          </div>
          {filtered.map((o, i) => {
            const total = o.lignes.reduce((s, l) => s + l.prix * l.qty, 0) + o.frais
            return (
              <div key={o.id} className={'px-4 py-3 flex items-center justify-between ' + (i < filtered.length - 1 ? 'border-b border-gris-bd' : '')}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brun">{o.id}</p>
                  <p className="text-xs text-gray-400">{o.date} · {o.client}</p>
                  {o.frais > 0 && <p className="text-[10px] text-gray-300">dont {o.frais.toFixed(2)} € livraison</p>}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-black text-green-600">+{total.toFixed(2)} €</p>
                  <p className="text-[10px] text-gray-400">✅ Encaissé</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
