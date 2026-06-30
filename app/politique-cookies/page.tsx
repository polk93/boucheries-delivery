import Link from 'next/link'
import ResetCookieButton from './ResetCookieButton'

export const metadata = {
  title: 'Politique de cookies — Côte à Côte',
  description: 'Politique de gestion des cookies et traceurs du site côteàcôte.com, conformément aux recommandations de la CNIL.',
}

const cookieTypes = [
  {
    category: 'Cookies strictement nécessaires',
    required: true,
    description: 'Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. Ils sont généralement activés en réponse à des actions que vous avez effectuées (connexion, panier, préférences de paiement).',
    cookies: [
      { name: 'session', provider: 'Côte à Côte', purpose: 'Maintien de la session utilisateur et authentification', duration: 'Session' },
      { name: 'supabase-auth-token', provider: 'Supabase (hébergé en UE)', purpose: 'Authentification sécurisée', duration: '7 jours' },
      { name: 'cookie_consent', provider: 'Côte à Côte', purpose: 'Mémorisation de vos préférences de cookies', duration: '13 mois' },
    ],
  },
  {
    category: 'Cookies de paiement',
    required: true,
    description: 'Ces cookies sont déposés par notre prestataire de paiement Stripe pour sécuriser les transactions. Ils ne peuvent pas être désactivés si vous souhaitez effectuer un achat.',
    cookies: [
      { name: '__stripe_mid', provider: 'Stripe Inc.', purpose: 'Prévention de la fraude lors du paiement', duration: '1 an' },
      { name: '__stripe_sid', provider: 'Stripe Inc.', purpose: 'Sécurisation de la session de paiement', duration: '30 minutes' },
    ],
  },
  {
    category: 'Cookies analytiques',
    required: false,
    description: 'Ces cookies nous permettent de mesurer l\'audience du site et d\'améliorer nos services. Ils ne sont déposés qu\'avec votre consentement. Les données sont anonymisées et agrégées.',
    cookies: [
      { name: '_vercel_analytics', provider: 'Vercel Inc.', purpose: 'Analyse de la performance et du trafic (données anonymisées)', duration: '1 an' },
    ],
  },
]

export default function PolitiqueCookiesPage() {
  return (
    <main className="min-h-screen bg-creme">
      {/* Header */}
      <div className="bg-brun text-white px-4 py-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm">
            ←
          </Link>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight">Politique de cookies</h1>
            <p className="text-white/60 text-xs">Conforme aux recommandations CNIL</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-16">
        {/* Notice CNIL */}
        <div className="bg-or-pale border border-or/30 rounded-2xl px-4 py-3">
          <p className="text-xs text-brun font-semibold">Dernière mise à jour : 23 juin 2026</p>
          <p className="text-xs text-brun-clair mt-1 leading-relaxed">
            Conformément à la délibération CNIL n°2020-091 du 17 septembre 2020 et aux lignes directrices sur les cookies et traceurs, nous vous informons de l'utilisation des cookies sur notre plateforme.
          </p>
        </div>

        {/* Qu'est-ce qu'un cookie */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd">
            <h2 className="font-serif font-bold text-brun text-sm">Qu'est-ce qu'un cookie ?</h2>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de votre visite sur notre site. Il permet à notre site de reconnaître votre navigateur, de mémoriser certaines informations et d'améliorer votre expérience de navigation.
            </p>
          </div>
        </div>

        {/* Cookie types */}
        {cookieTypes.map((type, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd flex items-center justify-between">
              <h2 className="font-serif font-bold text-brun text-sm">{type.category}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${type.required ? 'bg-brun text-white' : 'bg-or-pale text-brun border border-or/30'}`}>
                {type.required ? 'Obligatoires' : 'Soumis au consentement'}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">{type.description}</p>
              <div className="space-y-2">
                {type.cookies.map((cookie, j) => (
                  <div key={j} className="bg-creme rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-brun font-mono">{cookie.name}</span>
                      <span className="text-[10px] text-gray-400 bg-white rounded-full px-2 py-0.5">{cookie.duration}</span>
                    </div>
                    <p className="text-[11px] text-brun-clair font-medium">{cookie.provider}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{cookie.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Gestion des préférences */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd">
            <h2 className="font-serif font-bold text-brun text-sm">Gérer vos préférences</h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Vous pouvez modifier vos préférences de cookies à tout moment. Le bouton ci-dessous vous permet de réouvrir le gestionnaire de consentement.
            </p>
            <ResetCookieButton />
            <div className="bg-or-pale border border-or/20 rounded-xl p-3">
              <p className="text-xs font-bold text-brun mb-1">Via votre navigateur</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Vous pouvez également désactiver les cookies directement dans les paramètres de votre navigateur. Attention : la désactivation des cookies nécessaires peut altérer le fonctionnement du site.
              </p>
            </div>
          </div>
        </div>

        {/* Durée de conservation */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd">
            <h2 className="font-serif font-bold text-brun text-sm">Durée de conservation du consentement</h2>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Votre choix concernant les cookies est mémorisé pendant <strong>13 mois maximum</strong> (conformément aux recommandations CNIL). Au-delà de cette période, votre consentement vous sera à nouveau demandé.
            </p>
          </div>
        </div>

        {/* Contact DPO */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd">
            <h2 className="font-serif font-bold text-brun text-sm">Contact & réclamation</h2>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              Pour toute question relative à notre utilisation des cookies, contactez-nous à <strong className="text-brun">contact@coteacote.fr</strong>.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Vous pouvez également introduire une réclamation auprès de la CNIL :{' '}
              <span className="text-brun font-semibold">www.cnil.fr</span>
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-brun mb-3">Documents légaux associés</p>
          <div className="space-y-2">
            {[
              { href: '/mentions-legales', label: '⚖️ Mentions légales' },
              { href: '/cgv', label: '📋 Conditions Générales de Vente (CGV)' },
              { href: '/parametres?section=confidentialite', label: '🔒 Politique de confidentialité' },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between p-3 bg-creme rounded-xl text-xs font-semibold text-brun hover:bg-gris-bd transition-colors">
                <span>{link.label}</span>
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
