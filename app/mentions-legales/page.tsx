import Link from 'next/link'

export const metadata = {
  title: 'Mentions légales — Côte à Côte',
  description: 'Mentions légales du site côteàcôte.com conformément à la loi LCEN du 21 juin 2004.',
}

const sections = [
  {
    title: '1. Éditeur du site',
    content: [
      { label: 'Dénomination sociale', value: 'Côte à Côte SAS' },
      { label: 'Forme juridique', value: 'Société par Actions Simplifiée (SAS)' },
      { label: 'Capital social', value: '[À COMPLÉTER] €' },
      { label: 'Siège social', value: '[À COMPLÉTER — adresse complète]' },
      { label: 'SIRET', value: '[À COMPLÉTER]' },
      { label: 'RCS', value: '[À COMPLÉTER — ville d\'immatriculation]' },
      { label: 'N° TVA intracommunautaire', value: '[À COMPLÉTER]' },
      { label: 'Directeur de la publication', value: '[À COMPLÉTER — Prénom Nom]' },
      { label: 'Contact', value: 'contact@coteacote.fr' },
    ],
  },
  {
    title: '2. Hébergeur',
    content: [
      { label: 'Hébergeur', value: 'Vercel Inc.' },
      { label: 'Adresse', value: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis' },
      { label: 'Site web', value: 'https://vercel.com' },
    ],
  },
  {
    title: '3. Propriété intellectuelle',
    text: `Le site côteàcôte.com et l'ensemble de son contenu (textes, images, logos, icônes, structure) sont la propriété exclusive de Côte à Côte SAS et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation préalable et écrite de Côte à Côte SAS.`,
  },
  {
    title: '4. Données personnelles',
    text: `Le traitement des données personnelles collectées sur ce site est régi par notre Politique de confidentialité, conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés modifiée. Vous pouvez exercer vos droits (accès, rectification, effacement, portabilité, opposition) en contactant : contact@coteacote.fr. Pour toute réclamation, vous pouvez saisir la CNIL (www.cnil.fr).`,
  },
  {
    title: '5. Cookies',
    text: `Ce site utilise des cookies nécessaires à son bon fonctionnement et, avec votre consentement, des cookies d'analyse d'audience. Vous pouvez gérer vos préférences à tout moment via notre gestionnaire de cookies. Pour en savoir plus, consultez notre Politique de cookies.`,
  },
  {
    title: '6. Responsabilité',
    text: `Côte à Côte SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, la société ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. En conséquence, Côte à Côte SAS décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.`,
  },
  {
    title: '7. Liens hypertextes',
    text: `Le site peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre d'information uniquement. Côte à Côte SAS n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.`,
  },
  {
    title: '8. Droit applicable',
    text: `Le présent site et les présentes mentions légales sont soumis au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.`,
  },
]

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-creme">
      {/* Header */}
      <div className="bg-brun text-white px-4 py-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm">
            ←
          </Link>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight">Mentions légales</h1>
            <p className="text-white/60 text-xs">Conformément à la loi LCEN du 21 juin 2004</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-16">
        {/* Notice */}
        <div className="bg-or-pale border border-or/30 rounded-2xl px-4 py-3">
          <p className="text-xs text-brun font-semibold">
            Dernière mise à jour : 23 juin 2026
          </p>
          <p className="text-xs text-brun-clair mt-0.5">
            Conformément aux articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN).
          </p>
        </div>

        {sections.map((section, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd">
              <h2 className="font-serif font-bold text-brun text-sm">{section.title}</h2>
            </div>
            <div className="p-4">
              {section.content ? (
                <dl className="space-y-2">
                  {section.content.map((item, j) => (
                    <div key={j} className="flex flex-col xs:flex-row xs:gap-2">
                      <dt className="text-xs font-bold text-brun min-w-[160px] flex-shrink-0">{item.label}</dt>
                      <dd className={`text-xs leading-relaxed ${item.value.startsWith('[') ? 'text-rouge-vif font-semibold' : 'text-gray-500'}`}>
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-gray-500 leading-relaxed">{section.text}</p>
              )}
            </div>
          </div>
        ))}

        {/* Links to other legal pages */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-brun mb-3">Documents légaux associés</p>
          <div className="space-y-2">
            {[
              { href: '/cgv', label: '📋 Conditions Générales de Vente (CGV)' },
              { href: '/parametres?section=cgu', label: '📄 Conditions Générales d\'Utilisation (CGU)' },
              { href: '/parametres?section=confidentialite', label: '🔒 Politique de confidentialité' },
              { href: '/politique-cookies', label: '🍪 Politique de cookies' },
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
