import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Roboto, Noto_Sans_Thai } from 'next/font/google'
import { MaterialWebLoader } from '@/components/material-web-loader'
import { SITE } from '@/lib/config/site'
import './globals.css'
import './landing.css'

/**
 * Roboto covers the US and BR markets — `latin-ext` carries the Portuguese
 * diacritics. Roboto ships NO Thai subset on Google Fonts, so it cannot render
 * the TH market at all.
 */
const roboto = Roboto({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

/**
 * Noto Sans Thai supplies the Thai glyphs Roboto lacks. It is appended to the
 * global font stack rather than swapped in per locale: browsers resolve
 * font-family per glyph, so Latin still renders in Roboto and only Thai
 * codepoints fall through to this face. Never drop it — the sandbox (and many
 * devices) have no Thai system font, so Thai copy renders as blank boxes
 * without a webfont that actually contains the script.
 */
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-thai',
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
  colorScheme: 'dark',
}

/**
 * The <html lang> attribute is set per market by app/[lang]/layout.tsx, which
 * rewrites it on the client before paint via a tiny inline script — Next only
 * allows one <html> element, and it lives here. `suppressHydrationWarning`
 * exists for exactly that rewrite; it is not theme-related.
 *
 * No `dark` class: the app is dark-only and the scheme now lives on :root, so
 * there is no class to apply and no pre-paint script needed to avoid a flash.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-US"
      className={`${roboto.variable} ${notoSansThai.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Material Symbols for <md-icon>. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <MaterialWebLoader />
        {children}
      </body>
    </html>
  )
}
