import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import PushAutoSubscriber from './components/PushAutoSubscriber'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3D2012',
}

export const metadata: Metadata = {
  title: 'BoucherieDelivery — La meilleure viande livrée chez vous',
  description: 'Commandez chez les meilleures boucheries artisanales de votre quartier. Livraison rapide, découpe sur mesure.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BoucherieDelivery',
  },
  openGraph: {
    title: 'BoucherieDelivery',
    description: 'La meilleure viande artisanale livrée chez vous',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="shortcut icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BoucherieDelivery" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        {children}
        <PushAutoSubscriber />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#3D2012',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 10,
              fontSize: 13,
            },
          }}
        />
      </body>
    </html>
  )
}
