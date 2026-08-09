import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Roboto, Noto_Sans_Thai, Orbitron } from 'next/font/google'
import { MaterialWebLoader } from '@/components/material-web-loader'
import { SITE } from '@/lib/config/site'
import { isLocale, localeMeta, locales } from '@/lib/i18n/config'
import '../globals.css'
import '../landing.css'

/**
 * THE ROOT LAYOUT. It owns <html> and <body>, and it lives inside `[lang]` on
 * purpose: that is the only way `<html lang>` can be correct in the SERVED
 * markup.
 *
 * There used to be an `app/layout.tsx` above this one that hardcoded
 * `lang="en-US"`, plus a tiny inline script here that corrected the attribute on
 * the client before paint. Two things were wrong with that:
 *   1. the HTML on the wire always said `en-US`, so anything reading the document
 *      without running scripts saw the wrong language on /pt-br and /th;
 *   2. an inline script is precisely what `script-src` blocks — once the CSP in
 *      next.config.mjs is enforced, the correction would silently never run and
 *      the wrong value would become permanent.
 * Rendering the real value server-side removes both, along with the script and
 * the `suppressHydrationWarning` that only existed to permit the rewrite.
 *
 * Every HTML route is under `[lang]` (this segment holds the only page), and
 * robots.ts/sitemap.ts are not documents, so nothing is left without a layout.
 */

/** Every market is prerendered at build time — no request-time work. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

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

/**
 * DISPLAY FACE, wordmark only — the eight letters of `.zx-brand-name` in the top
 * bar, and nothing else. It is not in the body stack and must not be: this is a
 * wide squared techno face, unreadable in a paragraph.
 *
 * ONE weight (900), latin only, so it stays a single small woff2. `display:
 * 'swap'` lets the wordmark paint in Roboto immediately rather than leaving a
 * hole in the bar on a slow connection.
 */
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['900'],
  variable: '--font-orbitron',
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
  /* Paints the mobile browser's own chrome, which sits directly above the top of
     the page — so this has to match whatever the page's first pixels are, or the
     browser UI draws a visible stripe against them. That is the hero's poster
     wall under a dark frosted bar, so it is the canvas black
     (`--md-sys-color-surface`). It has to be a literal — Next serialises it into
     a <meta> tag before any CSS exists. */
  themeColor: '#08090b',
  colorScheme: 'dark',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  /* Also narrows `string` to `Locale` for the `localeMeta` lookup below. */
  if (!isLocale(lang)) notFound()

  return (
    <html
      lang={localeMeta[lang].htmlLang}
      className={`${roboto.variable} ${notoSansThai.variable} ${orbitron.variable}`}
    >
      <head>
        {/* The icon font is served from a second origin, so the connection is
            opened in parallel with this document instead of after the CSS
            arrives. `crossOrigin` is required on the gstatic hint — fonts are
            fetched in CORS mode, and a hint without it opens a connection the
            font request cannot reuse. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols for <md-icon>, SUBSET to the eight glyphs this page
            actually renders (`icon_names`, alphabetical as Google requires).

            Without that parameter Google serves the entire Material Symbols
            library: measured at 3871 KB versus 8 KB for this subset. That full
            download blocked first paint on exactly the mobile connections these
            markets are on, to deliver ~1900 glyphs the page never shows.

            KEEP THIS LIST IN SYNC. An <md-icon> whose name is missing here
            renders as its literal text ("expand_more") rather than a glyph, so
            adding an icon to a component means adding it here too. Current
            users: 4k / high_quality / surround_sound / bolt in the spec grid
            (about-zenorix), arrow_forward (top-chart), check
            (conversion-dialog + language-switcher), expand_more (faq-section +
            language-switcher), verified_user (download-cta).

            The axis ranges are kept so the subset stays a variable font — it
            still advertises `font-weight: 100 700`. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=4k,arrow_forward,bolt,check,expand_more,high_quality,surround_sound,verified_user"
        />
      </head>
      <body>
        <MaterialWebLoader />
        {children}
      </body>
    </html>
  )
}
