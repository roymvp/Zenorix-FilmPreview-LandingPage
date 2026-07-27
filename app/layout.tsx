import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import { MaterialWebLoader } from '@/components/material-web-loader'
import { SITE } from '@/lib/config/site'
import './globals.css'
import './landing.css'

/**
 * Subsets must cover every market we ship: `latin-ext` carries Portuguese
 * diacritics and `thai` carries the Thai script. Without the `thai` subset the
 * glyphs are simply absent from the font and Thai copy renders blank.
 */
const roboto = Roboto({
  subsets: ['latin', 'latin-ext', 'thai'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  description: `Watch officially licensed movies, series and live TV in 4K on ${SITE.name}.`,
  applicationName: SITE.name,
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /* Pinch-zoom stays enabled: disabling it is an accessibility failure. */
  maximumScale: 5,
  userScalable: true,
  themeColor: '#060504',
  colorScheme: 'dark light',
}

/**
 * The <html lang> attribute is set per market by app/[lang]/layout.tsx, which
 * rewrites it on the client before paint via a tiny inline script — Next only
 * allows one <html> element, and it lives here.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={`${roboto.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Material Symbols for <md-icon>. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          // Applies the stored theme before first paint to avoid a flash.
          // Dark is the default because the hero is film footage.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <MaterialWebLoader />
        {children}
      </body>
    </html>
  )
}
