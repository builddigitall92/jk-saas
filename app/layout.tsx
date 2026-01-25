import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

// ✅ Viewport Mobile-First (PRD Responsive)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // CRITIQUE : étend sous notch/barre home iOS
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0b09' },
  ],
}

export const metadata: Metadata = {
  title: 'StockGuard - Gestion des Stocks',
  description: 'Système de gestion des stocks pour restaurants rapides',
  generator: 'v0.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StockGuard',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="antialiased app-container" 
        style={{ fontFamily: "var(--font-sf-pro)" }}
      >
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
