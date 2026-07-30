import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Roboto, Noto_Sans_Thai } from 'next/font/google'
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
  weight: ['400', '600', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

/**
 * Noto Sans Thai supplies the Thai glyphs Roboto lacks. It is appended to the
 * global font stack rather than swapped in per locale: browsers resolve
 * font-family per glyph, so Latin still renders in Roboto and only Thai
 * codepoints fall through to this face. Never drop it — many devices have no
 * Thai system font, so Thai copy renders as blank boxes without a webfont that
 * actually contains the script.
 */
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-thai',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  applicationName: SITE.name,
  icons: { icon: SITE.logo, apple: SITE.logo },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /* Pinch-zoom stays enabled: disabling it is an accessibility failure. */
  maximumScale: 5,
  userScalable: true,
  /* Matches `--zx-topbar-surface`, NOT the black canvas: this paints the mobile
     browser's own chrome, which sits directly above the page's light header
     band. Keep it in step with that token — it has to be a literal here because
     Next serialises it into a <meta> tag before any CSS is available. */
  themeColor: '#f3f5f8',
  colorScheme: 'dark',
}

/**
 * The <html lang> attribute is corrected per market by app/[lang]/layout.tsx —
 * Next allows only one <html> element and it lives here.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={`${roboto.variable} ${notoSansThai.variable}`}>
      <body>{children}</body>
    </html>
  )
}
