import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { fontVariables } from '@/lib/fonts'
import { SITE } from '@/lib/config/site'

/**
 * The document shell, shared by the app's TWO root layouts (the localized
 * `app/[lang]` tree and the root `/` route).
 *
 * There are two root layouts rather than one because <html lang> must be correct
 * in the STATIC HTML, not patched afterwards: a single shared root layout can
 * only emit one literal lang, and correcting it from a client script leaves the
 * exported `th/index.html` claiming English to crawlers and to anyone with
 * JavaScript off — as well as tripping a hydration mismatch on every non-English
 * market. Each tree renders its own <html> with the right value baked in.
 */
export function SiteHtml({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}

/** Metadata every market shares. Per-page fields come from lib/seo. */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  applicationName: SITE.name,
  icons: { icon: SITE.logo, apple: SITE.logo },
  formatDetection: { telephone: false },
}

export const baseViewport: Viewport = {
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
