import Link from 'next/link'

export default function LegalFooter() {
  return (
    <footer className="border-t border-gris-bd bg-white px-4 py-6 pb-[calc(72px+env(safe-area-inset-bottom)+1.5rem)]">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Brand */}
        <div className="text-center">
          <p className="font-serif font-black text-brun text-sm">Côte à Côte</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Vos bouchers à vos côtés, où que vous soyez.</p>
        </div>

        {/* Legal links */}
        <nav aria-label="Liens légaux">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {[
              { href: '/mentions-legales', label: 'Mentions légales' },
              { href: '/cgv', label: 'CGV' },
              { href: '/parametres?section=cgu', label: 'CGU' },
              { href: '/parametres?section=confidentialite', label: 'Confidentialité' },
              { href: '/politique-cookies', label: 'Cookies' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[11px] text-gray-400 hover:text-brun transition-colors underline underline-offset-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Médiateur de la consommation — obligation légale LCEN */}
        <div className="bg-creme rounded-xl px-3 py-2 text-center">
          <p className="text-[10px] text-gray-500 font-semibold">⚖️ Médiateur de la consommation</p>
          <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
            En cas de litige non résolu : <span className="text-brun font-semibold">MEDICYS</span> — medicys.fr
            {' '}— Gratuit pour le consommateur (art. L.616-1 C. conso.)
          </p>
        </div>

        {/* Copyright */}
        <p className="text-[10px] text-gray-300 text-center">
          © {new Date().getFullYear()} Vincent Baudrant (Côte à côte) — Tous droits réservés
        </p>
      </div>
    </footer>
  )
}
