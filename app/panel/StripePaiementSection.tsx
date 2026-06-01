// ── À ajouter dans app/panel/page.tsx ────────────────────────────────────────
// 1. Import en haut : import { useBoucherStore } from '@/store/boucherStore'
// 2. Dans paramsSection === 'main', remplacer la section Paiements par :

// <StripePaiementSection email={user.email} showToast={showToast} />

// 3. Ajouter ce composant avant MdpSection en bas du fichier :

function StripePaiementSection({ email, showToast }: { email: string; showToast: (msg: string) => void }) {
  const boucherStore = useBoucherStore()
  const account = boucherStore.getStripeAccount(email)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function connecterNouveauCompte() {
    setLoading(true)
    try {
      const res = await fetch('/api/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nom_boutique: 'Boucherie',
          ville: '',
          type: 'boucher',
        }),
      })
      const data = await res.json()
      if (data.onboardingUrl) {
        // Supprimer l'ancien compte avant de rediriger
        boucherStore.clearStripeAccount(email)
        window.location.href = data.onboardingUrl
      } else {
        showToast('❌ Erreur Stripe — contactez le support')
      }
    } catch {
      showToast('❌ Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  if (!account) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
          <p className="text-xs font-bold text-brun">💳 Compte Stripe Connect</p>
        </div>
        <div className="p-4 text-center space-y-3">
          <span className="text-3xl block">💳</span>
          <p className="text-sm font-semibold text-brun">Aucun compte Stripe lié</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Configurez votre compte Stripe pour recevoir vos paiements automatiquement chaque lundi.
          </p>
          <button
            className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm font-sans"
            onClick={connecterNouveauCompte}
            disabled={loading}>
            {loading ? '⏳ Chargement…' : '🔗 Connecter mon compte Stripe'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-or-pale border-b border-gris-bd">
        <p className="text-xs font-bold text-brun">💳 Compte Stripe Connect</p>
      </div>
      <div className="p-4 space-y-3">

        {/* Statut */}
        <div className={`rounded-xl p-3 flex items-start gap-3 ${account.chargesEnabled && account.payoutsEnabled ? 'bg-green-50 border border-green-200' : 'bg-or-pale border border-or/20'}`}>
          <span className="text-xl flex-shrink-0">{account.chargesEnabled && account.payoutsEnabled ? '✅' : '⏳'}</span>
          <div>
            <p className={`text-sm font-bold ${account.chargesEnabled && account.payoutsEnabled ? 'text-green-700' : 'text-brun'}`}>
              {account.chargesEnabled && account.payoutsEnabled ? 'Compte actif' : 'Vérification en cours'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{account.businessName || account.email}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Connecté le {new Date(account.linkedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-1.5">
          {[
            { ico: '💳', label: 'Paiements',    val: account.chargesEnabled ? '✅ Activés' : '⏳ En attente' },
            { ico: '🏦', label: 'Virements',    val: account.payoutsEnabled ? '✅ Activés · chaque lundi' : '⏳ En attente' },
            { ico: '📧', label: 'Email Stripe', val: account.email },
            { ico: '🔑', label: 'ID compte',    val: account.accountId.slice(0, 20) + '…' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-2 py-1.5 border-b border-gris-bd last:border-0">
              <span className="text-base flex-shrink-0">{r.ico}</span>
              <span className="text-xs text-gray-400 w-24 flex-shrink-0">{r.label}</span>
              <span className="text-xs font-semibold text-brun truncate">{r.val}</span>
            </div>
          ))}
        </div>

        {/* Changer de compte */}
        {!confirming ? (
          <button
            className="w-full bg-rouge-pale text-rouge-vif border border-rouge-vif/20 py-2.5 rounded-xl text-xs font-bold font-sans"
            onClick={() => setConfirming(true)}>
            🔄 Changer de compte Stripe
          </button>
        ) : (
          <div className="bg-rouge-pale border border-rouge-vif/20 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-rouge-vif">⚠️ Confirmer le changement ?</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              L'ancien compte sera dissocié. Vous serez redirigé vers Stripe pour configurer un nouveau compte. Les virements en attente ne seront pas affectés.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white border border-gray-200 text-brun text-xs font-bold py-2 rounded-xl font-sans"
                onClick={() => setConfirming(false)}>Annuler</button>
              <button className="flex-1 bg-rouge-vif text-white text-xs font-bold py-2 rounded-xl font-sans"
                disabled={loading}
                onClick={connecterNouveauCompte}>
                {loading ? '⏳' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-gray-300 text-center">
          Géré par Stripe · Données sécurisées · Pas d'accès à vos coordonnées bancaires
        </p>
      </div>
    </div>
  )
}
