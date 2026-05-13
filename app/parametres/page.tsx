'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavClient from '@/components/ui/BottomNavClient'

type Section = 'profil' | 'adresses' | 'notifs' | 'support' | 'contact' | 'confidentialite' | 'cgu' | null

export default function ParametresPage() {
  const router = useRouter()
  const [section, setSection] = useState<Section>(null)

  if (section === 'profil')         return <ProfilSection onBack={() => setSection(null)} />
  if (section === 'adresses')       return <AdressesSection onBack={() => setSection(null)} />
  if (section === 'notifs')         return <NotifsSection onBack={() => setSection(null)} />
  if (section === 'support')        return <SupportSection onBack={() => setSection(null)} />
  if (section === 'contact')        return <ContactSection onBack={() => setSection(null)} />
  if (section === 'confidentialite') return <ConfidentialiteSection onBack={() => setSection(null)} />
  if (section === 'cgu')            return <CguSection onBack={() => setSection(null)} />

  const sections = [
    {
      titre: 'Mon compte',
      items: [
        { ico: '👤', label: 'Mon profil', sub: 'Jean Dupont · jean@email.fr', action: () => setSection('profil') },
        { ico: '📍', label: 'Mes adresses', sub: '1 adresse enregistrée', action: () => setSection('adresses') },
        { ico: '🔔', label: 'Notifications', sub: '2 non lues', action: () => setSection('notifs') },
        { ico: '❤️', label: 'Boucheries favorites', sub: '2 boucheries sauvegardées', action: () => {} },
      ],
    },
    {
      titre: 'Mes achats',
      items: [
        { ico: '📦', label: 'Historique des commandes', sub: '2 commandes passées', action: () => router.push('/commandes') },
        { ico: '⭐', label: 'Mes avis', sub: '1 avis laissé', action: () => {} },
        { ico: '💳', label: 'Moyens de paiement', sub: 'Carte •••• 4242', action: () => {} },
      ],
    },
    {
      titre: 'Espace Boucher',
      items: [
        { ico: '🔪', label: 'Tableau de bord', sub: 'Gérer commandes & stocks', action: () => router.push('/panel') },
        { ico: '🛍️', label: 'Gérer mes produits', sub: 'Photos, prix, découpes', action: () => router.push('/panel') },
        { ico: '💶', label: 'Mes revenus Stripe', sub: 'Voir les paiements reçus', action: () => {} },
      ],
    },
    {
      titre: 'Application & Aide',
      items: [
        { ico: '🆘', label: 'Support & FAQ', sub: 'Questions fréquentes, aide', action: () => setSection('support') },
        { ico: '✉️', label: 'Nous contacter', sub: 'Envoyer un message à l\'équipe', action: () => setSection('contact') },
        { ico: '🔒', label: 'Politique de confidentialité', sub: 'Données personnelles & RGPD', action: () => setSection('confidentialite') },
        { ico: '📋', label: 'Conditions d\'utilisation', sub: 'CGU & CGV', action: () => setSection('cgu') },
        { ico: '🌍', label: 'Langue', sub: 'Français', action: () => {} },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4">
        <h1 className="font-serif text-xl font-bold text-or">⚙️ Paramètres</h1>
      </div>

      {/* Avatar rapide */}
      <div className="bg-white mx-5 mt-5 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-brun text-white text-2xl flex items-center justify-center flex-shrink-0">👤</div>
        <div className="flex-1">
          <p className="font-bold text-brun text-base">Jean Dupont</p>
          <p className="text-xs text-gray-400">jean@email.fr · Client</p>
        </div>
        <button className="bg-creme border border-gris-bd text-brun text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => setSection('profil')}>Modifier</button>
      </div>

      <div className="px-5 mt-5 space-y-5 max-w-lg mx-auto">
        {sections.map(sec => (
          <div key={sec.titre}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{sec.titre}</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {sec.items.map((item, i) => (
                <button key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-creme transition-colors ${i < sec.items.length - 1 ? 'border-b border-gris-bd' : ''}`}
                  onClick={item.action}>
                  <span className="text-xl flex-shrink-0">{item.ico}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brun">{item.label}</p>
                    <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full bg-rouge-pale text-rouge-vif font-bold py-3.5 rounded-2xl text-sm hover:bg-red-100 transition-colors font-sans">
          Se déconnecter
        </button>
        <p className="text-center text-xs text-gray-300 pb-2">BoucherieDelivery v1.0.0</p>
      </div>

      <BottomNavClient currentPage="settings" />
    </div>
  )
}

// ── Wrapper commun ────────────────────────────────────────────────────────────
function PageWrapper({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-creme pb-24">
      <div className="bg-brun px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white text-xl bg-transparent border-none cursor-pointer">←</button>
        <h1 className="font-serif text-xl font-bold text-or">{title}</h1>
      </div>
      <div className="max-w-lg mx-auto px-5 py-6">{children}</div>
      <BottomNavClient currentPage="settings" />
    </div>
  )
}

// ── Profil ────────────────────────────────────────────────────────────────────
function ProfilSection({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ prenom: 'Jean', nom: 'Dupont', email: 'jean@email.fr', tel: '06 12 34 56 78' })
  const [saved, setSaved] = useState(false)

  return (
    <PageWrapper title="👤 Mon profil" onBack={onBack}>
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-brun text-white text-4xl flex items-center justify-center mx-auto mb-3">👤</div>
        <button className="text-xs text-or font-semibold">Changer la photo</button>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        {[['prenom','Prénom'],['nom','Nom'],['email','Email'],['tel','Téléphone']].map(([k, l]) => (
          <div key={k}>
            <label className="text-xs font-bold text-brun block mb-1">{l}</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans"
              value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
          </div>
        ))}
        {saved && <p className="text-green-600 text-xs font-semibold text-center">✅ Modifications enregistrées !</p>}
        <button className="w-full bg-brun text-white py-3 rounded-xl font-bold text-sm hover:bg-rouge-vif transition-colors font-sans"
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
          Enregistrer
        </button>
      </div>
    </PageWrapper>
  )
}

// ── Adresses ──────────────────────────────────────────────────────────────────
function AdressesSection({ onBack }: { onBack: () => void }) {
  const [adresses] = useState([
    { id: '1', label: '🏠 Domicile', detail: '12 rue de la Roquette, 75011 Paris', defaut: true },
    { id: '2', label: '💼 Bureau', detail: "45 avenue de l'Opéra, 75002 Paris", defaut: false },
  ])
  return (
    <PageWrapper title="📍 Mes adresses" onBack={onBack}>
      <div className="space-y-3">
        {adresses.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-brun text-sm">{a.label}</p>
                {a.defaut && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Par défaut</span>}
              </div>
              <p className="text-xs text-gray-400">{a.detail}</p>
            </div>
            <button className="text-gray-300 text-sm hover:text-rouge-vif transition-colors">✏️</button>
          </div>
        ))}
        <button className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-semibold text-gray-400 hover:border-brun hover:text-brun transition-colors font-sans">
          + Ajouter une adresse
        </button>
      </div>
    </PageWrapper>
  )
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotifsSection({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({ livraison: true, promos: true, nouveaux: false, rappels: true })
  const items = [
    { key: 'livraison', label: 'Suivi de livraison', sub: 'Statut de vos commandes en temps réel' },
    { key: 'promos', label: 'Promotions & offres', sub: 'Bons plans et réductions des boucheries' },
    { key: 'nouveaux', label: 'Nouvelles boucheries', sub: "Quand un nouveau partenaire s'installe" },
    { key: 'rappels', label: 'Rappels de commande', sub: 'Pour ne pas oublier de re-commander' },
  ]
  return (
    <PageWrapper title="🔔 Notifications" onBack={onBack}>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {items.map((item, i) => (
          <div key={item.key} className={`flex items-center gap-3 px-4 py-4 ${i < items.length - 1 ? 'border-b border-gris-bd' : ''}`}>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brun">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <button
              className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${(prefs as any)[item.key] ? 'bg-green-400' : 'bg-gray-200'}`}
              onClick={() => setPrefs(p => ({ ...p, [item.key]: !(p as any)[item.key] }))}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(prefs as any)[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}

// ── Support & FAQ ─────────────────────────────────────────────────────────────
function SupportSection({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: "Comment passer ma première commande ?", a: "Ouvrez l'application, activez la géolocalisation pour voir les boucheries proches de vous. Sélectionnez une boucherie, choisissez vos produits et personnalisez votre découpe. Ajoutez au panier, renseignez votre adresse, choisissez un créneau de livraison et procédez au paiement sécurisé." },
    { q: "Quelle est la zone de livraison ?", a: "BoucherieDelivery livre dans un rayon de 10 km autour des boucheries partenaires. Activez la géolocalisation pour voir les boucheries disponibles près de chez vous. Vous pouvez ajuster le rayon de recherche entre 2 et 10 km." },
    { q: "Comment la viande est-elle transportée ?", a: "Tous nos livreurs utilisent des sacs isothermes réfrigérés homologués pour le transport de denrées carnées. La chaîne du froid est maintenue de la boucherie jusqu'à votre porte. La livraison est effectuée en moins de 45 minutes." },
    { q: "Puis-je personnaliser ma découpe ?", a: "Oui ! C'est l'une des grandes forces de BoucherieDelivery. Pour chaque produit, vous pouvez choisir votre type de découpe (fine, épaisse, en médaillons…) et votre préparation (nature, marinée, panée…). Vous pouvez même laisser une note spécifique au boucher." },
    { q: "Que faire si je ne suis pas satisfait ?", a: "Votre satisfaction est notre priorité. En cas de problème avec votre commande (produit manquant, qualité insuffisante, erreur de découpe), contactez-nous dans les 2h suivant la livraison via le bouton 'Nous contacter'. Nous procéderons à un remboursement ou un remplacement selon votre préférence." },
    { q: "Comment puis-je devenir boucherie partenaire ?", a: "Vous êtes boucher artisan et souhaitez rejoindre BoucherieDelivery ? Contactez-nous via le formulaire 'Nous contacter' en précisant 'Partenariat boucher' dans l'objet. Notre équipe commerciale vous recontacte sous 24h pour une démonstration gratuite. Les 50 premières boucheries bénéficient de 3 mois d'abonnement offerts." },
    { q: "Comment modifier ou annuler une commande ?", a: "Une commande peut être modifiée ou annulée dans les 5 minutes suivant sa validation, avant que la boucherie commence la préparation. Après ce délai, contactez directement le support. En cas d'annulation, vous êtes remboursé intégralement sous 3-5 jours ouvrés." },
    { q: "Quels moyens de paiement sont acceptés ?", a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via Stripe, notre partenaire de paiement sécurisé. Vos données bancaires ne sont jamais stockées sur nos serveurs. Apple Pay et Google Pay sont également disponibles." },
  ]

  return (
    <PageWrapper title="🆘 Support & FAQ" onBack={onBack}>
      <div className="space-y-4">
        {/* Contact rapide */}
        <div className="bg-brun rounded-2xl p-4 text-center">
          <p className="text-white font-bold text-sm mb-1">Besoin d'aide immédiate ?</p>
          <p className="text-white/60 text-xs mb-3">Notre équipe répond en moins de 2h</p>
          <div className="flex gap-2 justify-center">
            <a href="mailto:support@boucheriedelivery.fr" className="bg-or text-brun text-xs font-bold px-4 py-2 rounded-xl no-underline">✉️ Email</a>
            <a href="tel:0600000000" className="bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl no-underline">📞 Appel</a>
          </div>
        </div>

        {/* FAQ */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Questions fréquentes</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className={i < faqs.length - 1 ? 'border-b border-gris-bd' : ''}>
              <button
                className="w-full flex items-start justify-between gap-3 px-4 py-4 text-left hover:bg-creme transition-colors font-sans"
                onClick={() => setOpen(open === i ? null : i)}>
                <p className="text-sm font-semibold text-brun flex-1">{faq.q}</p>
                <span className={`text-gray-400 text-base flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {open === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horaires support */}
        <div className="bg-or-pale rounded-2xl p-4 border border-or/20">
          <p className="font-bold text-brun text-sm mb-2">🕐 Horaires du support</p>
          <div className="space-y-1">
            {[['Lun – Ven', '8h – 20h'], ['Samedi', '9h – 18h'], ['Dimanche', '10h – 16h']].map(([j, h]) => (
              <div key={j} className="flex justify-between text-xs text-brun"><span>{j}</span><span className="font-semibold">{h}</span></div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Nous contacter ────────────────────────────────────────────────────────────
function ContactSection({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ sujet: 'commande', nom: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const sujets = [
    { val: 'commande', label: '📦 Problème avec une commande' },
    { val: 'livraison', label: '🛵 Problème de livraison' },
    { val: 'paiement', label: '💳 Problème de paiement' },
    { val: 'partenariat', label: '🔪 Devenir boucherie partenaire' },
    { val: 'suggestion', label: '💡 Suggestion d\'amélioration' },
    { val: 'autre', label: '❓ Autre demande' },
  ]

  if (sent) return (
    <PageWrapper title="✉️ Nous contacter" onBack={onBack}>
      <div className="text-center py-16">
        <span className="text-6xl block mb-4">✅</span>
        <h2 className="font-serif text-xl font-bold text-brun mb-2">Message envoyé !</h2>
        <p className="text-gray-400 text-sm mb-6">Notre équipe vous répondra sous 2h en jours ouvrés.</p>
        <button className="bg-brun text-white px-6 py-3 rounded-xl font-bold text-sm font-sans" onClick={onBack}>← Retour</button>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="✉️ Nous contacter" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-brun rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-2xl">💬</span>
          <div>
            <p className="text-white font-bold text-sm">Réponse garantie sous 2h</p>
            <p className="text-white/60 text-xs mt-0.5">Du lundi au vendredi 8h–20h · Sam 9h–18h · Dim 10h–16h</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-brun block mb-2">Sujet de votre demande</label>
            <div className="space-y-2">
              {sujets.map(s => (
                <label key={s.val} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.sujet === s.val ? 'border-brun bg-or-pale' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="sujet" value={s.val} checked={form.sujet === s.val}
                    onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.sujet === s.val ? 'border-brun bg-brun' : 'border-gray-300'}`}>
                    {form.sujet === s.val && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-brun">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Votre nom</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans"
                placeholder="Jean Dupont" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-brun block mb-1">Votre email</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans"
                placeholder="vous@email.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-brun block mb-1">Votre message</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brun font-sans resize-none"
              rows={5}
              placeholder="Décrivez votre demande en détail…"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>

          <button
            className="w-full bg-rouge-vif text-white py-3 rounded-xl font-bold text-sm font-sans hover:bg-brun transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!form.nom || !form.email || !form.message}
            onClick={() => setSent(true)}>
            ✉️ Envoyer le message
          </button>
        </div>

        {/* Autres canaux */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-brun text-sm mb-3">Autres façons de nous joindre</p>
          <div className="space-y-3">
            {[
              { ico: '📧', label: 'Email', val: 'support@boucheriedelivery.fr' },
              { ico: '📞', label: 'Téléphone', val: '06 00 00 00 00' },
              { ico: '🌐', label: 'Site web', val: 'boucheries-delivery.vercel.app' },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xl">{c.ico}</span>
                <div>
                  <p className="text-xs text-gray-400">{c.label}</p>
                  <p className="text-sm font-semibold text-brun">{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Confidentialité ───────────────────────────────────────────────────────────
function ConfidentialiteSection({ onBack }: { onBack: () => void }) {
  return (
    <PageWrapper title="🔒 Politique de confidentialité" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-or-pale border border-or/20 rounded-2xl p-4">
          <p className="text-xs text-brun-clair font-semibold">Dernière mise à jour : 13 mai 2026 · Conforme au RGPD</p>
        </div>

        {[
          {
            titre: "1. Qui sommes-nous ?",
            contenu: "BoucherieDelivery est une plateforme de mise en relation entre consommateurs et boucheries artisanales françaises. Le responsable du traitement des données est BoucherieDelivery SAS, joignable à : contact@boucheriedelivery.fr."
          },
          {
            titre: "2. Données collectées",
            contenu: "Nous collectons uniquement les données nécessaires au fonctionnement du service :\n\n• Données d'identification : nom, prénom, adresse email, numéro de téléphone\n• Données de livraison : adresse(s) de livraison\n• Données de commande : historique des achats, préférences de découpe\n• Données de géolocalisation : position approximative pour afficher les boucheries proches (uniquement avec votre consentement explicite)\n• Données de paiement : traitées directement par Stripe — nous ne stockons jamais vos coordonnées bancaires"
          },
          {
            titre: "3. Finalités du traitement",
            contenu: "Vos données sont utilisées pour :\n\n• Traiter et livrer vos commandes\n• Vous envoyer des notifications relatives à vos commandes\n• Améliorer notre service et personnaliser votre expérience\n• Respecter nos obligations légales et comptables\n• Vous envoyer des communications marketing (avec votre consentement préalable)"
          },
          {
            titre: "4. Durée de conservation",
            contenu: "• Données de compte : conservées pendant toute la durée de votre inscription + 3 ans après suppression du compte\n• Données de commandes : 5 ans (obligation légale comptable)\n• Données de géolocalisation : non conservées, utilisées uniquement en temps réel\n• Cookies : 13 mois maximum"
          },
          {
            titre: "5. Vos droits (RGPD)",
            contenu: "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :\n\n• Droit d'accès à vos données personnelles\n• Droit de rectification des données inexactes\n• Droit à l'effacement (\"droit à l'oubli\")\n• Droit à la portabilité de vos données\n• Droit d'opposition au traitement\n• Droit à la limitation du traitement\n\nPour exercer ces droits, contactez-nous à : privacy@boucheriedelivery.fr. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr)."
          },
          {
            titre: "6. Partage des données",
            contenu: "Nous ne vendons jamais vos données personnelles. Nous partageons uniquement les données strictement nécessaires avec :\n\n• Les boucheries partenaires : nom, adresse de livraison et instructions pour préparer votre commande\n• Stripe : pour le traitement sécurisé des paiements\n• Supabase : hébergement sécurisé des données (serveurs en Europe)\n• Les livreurs partenaires : nom, adresse et numéro de téléphone uniquement"
          },
          {
            titre: "7. Cookies",
            contenu: "Nous utilisons des cookies essentiels au fonctionnement du service (session utilisateur, panier) et des cookies analytiques anonymes pour améliorer l'application. Aucun cookie publicitaire tiers n'est utilisé. Vous pouvez gérer vos préférences cookies depuis les paramètres de votre navigateur."
          },
          {
            titre: "8. Sécurité",
            contenu: "Vos données sont protégées par chiffrement SSL/TLS. L'accès est contrôlé par authentification sécurisée. Nos serveurs sont hébergés en Europe (Supabase EU West). En cas de violation de données, vous serez notifié sous 72h conformément au RGPD."
          },
          {
            titre: "9. Contact",
            contenu: "Pour toute question relative à cette politique de confidentialité :\n\nEmail : privacy@boucheriedelivery.fr\nCourrier : BoucherieDelivery SAS, [Adresse], France\n\nDélégué à la Protection des Données (DPO) : dpo@boucheriedelivery.fr"
          },
        ].map((section, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-serif text-base font-bold text-brun mb-2">{section.titre}</h2>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{section.contenu}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}

// ── CGU ───────────────────────────────────────────────────────────────────────
function CguSection({ onBack }: { onBack: () => void }) {
  return (
    <PageWrapper title="📋 Conditions d'utilisation" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-or-pale border border-or/20 rounded-2xl p-4">
          <p className="text-xs text-brun-clair font-semibold">Version en vigueur depuis le 13 mai 2026</p>
        </div>

        {[
          {
            titre: "1. Objet",
            contenu: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme BoucherieDelivery, accessible via l'application mobile et le site web boucheries-delivery.vercel.app. En utilisant notre service, vous acceptez sans réserve ces conditions."
          },
          {
            titre: "2. Description du service",
            contenu: "BoucherieDelivery est une marketplace mettant en relation des consommateurs avec des boucheries artisanales partenaires. BoucherieDelivery agit en qualité d'intermédiaire et n'est pas vendeur des produits. Les boucheries partenaires sont seules responsables de la qualité et de la conformité des produits vendus."
          },
          {
            titre: "3. Inscription et compte utilisateur",
            contenu: "L'inscription est gratuite et ouverte à toute personne majeure. Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute utilisation frauduleuse de votre compte doit être signalée immédiatement. BoucherieDelivery se réserve le droit de suspendre tout compte en cas de violation des présentes CGU."
          },
          {
            titre: "4. Commandes et paiement",
            contenu: "Les prix affichés sont en euros TTC. Le paiement est dû intégralement au moment de la validation de la commande. La commande est confirmée après acceptation du paiement par Stripe. BoucherieDelivery prélève une commission de 15% sur chaque transaction au titre de la mise en relation."
          },
          {
            titre: "5. Livraison",
            contenu: "Les délais de livraison sont indicatifs (généralement 25 à 55 minutes). BoucherieDelivery s'engage à maintenir la chaîne du froid pendant le transport. En cas de retard supérieur à 30 minutes, vous serez notifié et pourrez annuler sans frais. La livraison s'effectue à l'adresse indiquée lors de la commande."
          },
          {
            titre: "6. Droit de rétractation",
            contenu: "Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux denrées périssables. Cependant, en cas de non-conformité du produit (erreur de commande, problème de qualité), vous disposez de 2h après livraison pour nous contacter afin d'obtenir un remboursement ou un remplacement."
          },
          {
            titre: "7. Responsabilités",
            contenu: "BoucherieDelivery s'engage à maintenir la plateforme accessible et sécurisée. Notre responsabilité est limitée aux dommages directs et exclut les dommages indirects. Les boucheries partenaires sont seules responsables de la qualité, de la traçabilité et de la conformité sanitaire de leurs produits. BoucherieDelivery ne peut être tenu responsable des retards dus à des cas de force majeure."
          },
          {
            titre: "8. Propriété intellectuelle",
            contenu: "L'ensemble des éléments de BoucherieDelivery (logo, design, code, textes, photos) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable. Les marques et logos des boucheries partenaires restent leur propriété exclusive."
          },
          {
            titre: "9. Modification des CGU",
            contenu: "BoucherieDelivery se réserve le droit de modifier les présentes CGU à tout moment. Vous serez notifié de toute modification substantielle par email. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions."
          },
          {
            titre: "10. Droit applicable",
            contenu: "Les présentes CGU sont régies par le droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Paris seront seuls compétents. Pour tout litige de consommation, vous pouvez également recourir à la médiation via la plateforme européenne de résolution en ligne des litiges : ec.europa.eu/consumers/odr"
          },
        ].map((section, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-serif text-base font-bold text-brun mb-2">{section.titre}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{section.contenu}</p>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
