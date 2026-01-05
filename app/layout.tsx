import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // CRITIQUE : étend sous notch/barre home iOS
}

export const metadata: Metadata = {
  title: 'StockGuard - Gestion des Stocks',
  description: 'Système de gestion des stocks pour restaurants rapides',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <body 
        className="antialiased min-h-dvh" 
        style={{ 
          fontFamily: "var(--font-sf-pro)",
          backgroundColor: "#0a0f0a" // Fond iOS safe area
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
