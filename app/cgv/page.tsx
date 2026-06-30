import Link from 'next/link'

export const metadata = {
  title: 'Conditions Générales de Vente — Côte à Côte',
  description: 'Conditions Générales de Vente applicables aux achats effectués sur la plateforme Côte à Côte.',
}

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-creme">
      {/* Header */}
      <div className="bg-brun text-white px-4 py-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm">
            ←
          </Link>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight">Conditions Générales de Vente</h1>
            <p className="text-white/60 text-xs">En vigueur depuis le 23 juin 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-16">
        {/* Notice */}
        <div className="bg-or-pale border border-or/30 rounded-2xl px-4 py-3">
          <p className="text-xs text-brun font-semibold">Dernière mise à jour : 23 juin 2026</p>
          <p className="text-xs text-brun-clair mt-0.5">
            Ces CGV s'appliquent à toute commande passée sur la plateforme Côte à Côte (application mobile et site web). Veuillez les lire attentivement avant de passer commande.
          </p>
        </div>

        {/* Article 1 */}
        <Article title="Article 1 — Identification du vendeur">
          <Row label="Nom" value="Vincent Baudrant" />
          <Row label="Nom commercial / Enseigne" value="Côte à côte" />
          <Row label="Forme juridique" value="Entrepreneur individuel — Micro-entreprise" />
          <Row label="SIRET" value="106 140 742 00011" />
          <Row label="RNE" value="106140742 (immatriculé le 10/06/2026)" />
          <Row label="Code APE" value="6201Z — Programmation informatique" />
          <Row label="Siège social" value="47 rue Vivienne, 75002 Paris 2e arrondissement" />
          <Row label="TVA" value="Non assujetti — Franchise en base (art. 293 B CGI)" />
          <Row label="Dirigeant" value="Vincent Baudrant" />
          <Row label="Email" value="contact@coteacote.fr" />
          <Row label="Téléphone" value="06 50 29 02 12" />
          <p className="text-xs text-gray-500 leading-relaxed mt-3">
            Côte à côte est une plateforme exploitée par Vincent Baudrant, entrepreneur individuel, mettant en relation des consommateurs et des bouchers artisanaux partenaires (ci-après « les Bouchers »). Chaque Boucher est un professionnel indépendant responsable de ses produits et de leur conformité réglementaire.
          </p>
        </Article>

        {/* Article 2 */}
        <Article title="Article 2 — Champ d'application">
          <p className="text-xs text-gray-500 leading-relaxed">
            Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent exclusivement les ventes de produits de boucherie-charcuterie réalisées via la plateforme Côte à Côte entre les Bouchers partenaires et les consommateurs (ci-après « le Client »). Toute commande implique l'acceptation sans réserve des présentes CGV.
          </p>
        </Article>

        {/* Article 3 */}
        <Article title="Article 3 — Produits et disponibilité">
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            Les produits proposés sont des denrées alimentaires fraîches, élaborées par des bouchers artisanaux. Chaque fiche produit mentionne :
          </p>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li>La dénomination exacte du produit</li>
            <li>Le prix en euros TTC (toutes taxes comprises)</li>
            <li>Le prix au kilogramme le cas échéant</li>
            <li>Les allergènes présents (conformément au règlement INCO n°1169/2011)</li>
            <li>L'origine géographique de la viande</li>
          </ul>
          <p className="text-xs text-gray-500 leading-relaxed mt-2">
            La disponibilité des produits est indiquée en temps réel. Côte à côte ne peut être tenu responsable d'une rupture de stock survenant après validation de la commande ; dans ce cas, le Client est informé et remboursé intégralement.
          </p>
        </Article>

        {/* Article 4 */}
        <Article title="Article 4 — Prix">
          <p className="text-xs text-gray-500 leading-relaxed">
            Les prix affichés sont en euros (€) toutes taxes comprises (TTC), incluant la TVA applicable. Les frais de livraison sont indiqués séparément avant la validation de la commande. Côte à côte se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés au prix en vigueur au moment de la validation de la commande.
          </p>
        </Article>

        {/* Article 5 */}
        <Article title="Article 5 — Commande et processus d'achat">
          <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
            <li>Le Client choisit ses produits et les ajoute au panier.</li>
            <li>Le Client sélectionne le mode de récupération (livraison ou click & collect).</li>
            <li>Le Client vérifie le récapitulatif de commande (article L.221-15 Code de la consommation).</li>
            <li>Le Client accepte les présentes CGV et la Politique de confidentialité.</li>
            <li>Le Client procède au paiement sécurisé via Stripe.</li>
            <li>Un email de confirmation est envoyé immédiatement après validation.</li>
          </ol>
          <p className="text-xs text-gray-500 leading-relaxed mt-2">
            La commande est ferme et définitive dès validation du paiement.
          </p>
        </Article>

        {/* Article 6 */}
        <Article title="Article 6 — Paiement">
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            Le paiement est exigible immédiatement à la commande. Il est effectué de manière sécurisée via Stripe (PCI-DSS Level 1 compliant). Les moyens de paiement acceptés sont :
          </p>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside mb-2">
            <li>Carte bancaire (Visa, Mastercard, American Express)</li>
            <li>Apple Pay / Google Pay</li>
          </ul>
          <p className="text-xs text-gray-500 leading-relaxed">
            Côte à côte ne conserve aucune donnée bancaire. En cas d'échec du paiement, la commande est annulée automatiquement.
          </p>
        </Article>

        {/* Article 7 */}
        <Article title="Article 7 — Livraison">
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            La livraison est effectuée dans les délais indiqués lors de la commande (indicatif : 25 à 55 minutes). La chaîne du froid est garantie tout au long du transport. En cas d'absence du Client à l'adresse indiquée, une nouvelle tentative ou un contact téléphonique sera effectué. Côte à côte ne peut être tenu responsable d'un retard dû à un cas de force majeure ou à une information erronée fournie par le Client.
          </p>
          <div className="bg-rouge-pale border border-rouge/20 rounded-xl p-3">
            <p className="text-xs text-rouge font-semibold">Zones de livraison</p>
            <p className="text-xs text-gray-500 mt-1">Les zones de livraison dépendent de la localisation du boucher partenaire sélectionné. Elles sont indiquées dans l'application.</p>
          </div>
        </Article>

        {/* Article 8 — INCO Allergènes */}
        <Article title="Article 8 — Information sur les allergènes (Règlement INCO)">
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            Conformément au Règlement UE n°1169/2011 relatif à l'information des consommateurs sur les denrées alimentaires (INCO), les 14 allergènes majeurs à déclaration obligatoire sont indiqués sur chaque fiche produit :
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {['Gluten', 'Crustacés', 'Œufs', 'Poissons', 'Arachides', 'Soja', 'Lait', 'Fruits à coque', 'Céleri', 'Moutarde', 'Graines de sésame', 'Sulfites (>10ppm)', 'Lupin', 'Mollusques'].map((a) => (
              <div key={a} className="bg-creme rounded-lg px-2 py-1 text-[11px] text-brun font-medium">
                {a}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mt-2">
            Ces informations sont fournies par chaque Boucher partenaire sous sa responsabilité. En cas de doute ou d'allergie sévère, contactez directement le boucher avant de commander.
          </p>
        </Article>

        {/* Article 9 — Droit de rétractation */}
        <Article title="Article 9 — Droit de rétractation">
          <div className="bg-or-pale border border-or/30 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-brun mb-1">Exclusion applicable aux denrées périssables</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conformément à l'<strong>article L.221-28 alinéa 4 du Code de la consommation</strong>, le droit de rétractation de 14 jours <strong>ne s'applique pas</strong> aux contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">
              Les produits de boucherie-charcuterie frais vendus sur la plateforme Côte à Côte étant des denrées alimentaires périssables, <strong>aucun droit de rétractation ne peut être exercé</strong> après validation de la commande.
            </p>
          </div>
          <div className="bg-white border border-gris-bd rounded-xl p-3">
            <p className="text-xs font-bold text-brun mb-1">Réclamation pour non-conformité</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              En cas de problème de qualité constaté à la livraison (produit avarié, erreur de commande, colis endommagé), le Client dispose de <strong>2 heures</strong> suivant la livraison pour nous contacter à <strong>contact@coteacote.fr</strong> ou via le support en application. Un remboursement ou échange sera proposé après vérification.
            </p>
          </div>
        </Article>

        {/* Article 10 — Nouveau : bouton rétractation en ligne */}
        <Article title="Article 10 — Exercice des droits en ligne">
          <div className="bg-gris-bd rounded-xl p-3 mb-2">
            <p className="text-xs font-bold text-brun mb-1">Nouvelle obligation — Ordonnance du 5 janvier 2026</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Conformément à l'ordonnance n°2026-51 du 5 janvier 2026 transposant la directive européenne 2023/2673, pour toute commande de produit non périssable éventuellement proposé, le Client peut exercer son droit de rétractation directement en ligne depuis son espace « Mes commandes », sans avoir à justifier sa décision, dans un délai de 14 jours.
            </p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Cette fonctionnalité génère automatiquement un accusé de réception horodaté envoyé à l'adresse email du Client.
          </p>
        </Article>

        {/* Article 11 */}
        <Article title="Article 11 — Responsabilités">
          <p className="text-xs text-gray-500 leading-relaxed">
            Côte à côte agit en qualité d'intermédiaire technique entre les Bouchers et les Clients. La responsabilité relative à la qualité, la conformité sanitaire et l'étiquetage des produits incombe en premier lieu au Boucher partenaire. Côte à côte peut être tenu responsable en cas de faute avérée dans la transmission des commandes ou le traitement des paiements. La responsabilité de Côte à côte est limitée au montant de la commande concernée.
          </p>
        </Article>

        {/* Article 12 */}
        <Article title="Article 12 — Protection des données">
          <p className="text-xs text-gray-500 leading-relaxed">
            Les données personnelles collectées lors d'une commande sont traitées conformément à notre Politique de confidentialité (RGPD). Elles sont utilisées exclusivement pour le traitement et le suivi de la commande, la relation client et les obligations légales de conservation (5 ans pour les données de facturation).
          </p>
        </Article>

        {/* Article 13 */}
        <Article title="Article 13 — Médiation et litiges">
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            En cas de litige, le Client est invité à contacter en priorité notre service client (contact@coteacote.fr). En l'absence de résolution amiable dans un délai de 60 jours, le Client consommateur peut recourir gratuitement à un médiateur de la consommation, conformément aux articles L.612-1 et suivants du Code de la consommation.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Plateforme européenne de règlement en ligne des litiges (RLL) : <span className="text-brun font-semibold">https://ec.europa.eu/consumers/odr</span>
          </p>
        </Article>

        {/* Article 14 */}
        <Article title="Article 14 — Droit applicable et juridiction compétente">
          <p className="text-xs text-gray-500 leading-relaxed">
            Les présentes CGV sont soumises au droit français. En cas de litige non résolu par voie amiable ou par médiation, les tribunaux français seront seuls compétents. Pour les litiges avec des consommateurs résidant dans un autre État membre de l'UE, les règles communautaires applicables s'appliqueront.
          </p>
        </Article>

        {/* Links */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-brun mb-3">Documents légaux associés</p>
          <div className="space-y-2">
            {[
              { href: '/mentions-legales', label: '⚖️ Mentions légales' },
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

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gris-bd border-b border-gris-bd">
        <h2 className="font-serif font-bold text-brun text-sm">{title}</h2>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col xs:flex-row xs:gap-2">
      <dt className="text-xs font-bold text-brun min-w-[140px] flex-shrink-0">{label}</dt>
      <dd className={`text-xs leading-relaxed ${highlight ? 'text-rouge-vif font-semibold' : 'text-gray-500'}`}>{value}</dd>
    </div>
  )
}
