import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Roboto, Noto_Sans_Thai, Orbitron } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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

/**
 * Layout-level metadata is FALLBACK ONLY — `[lang]/page.tsx` overrides it per
 * market, verified on the served HTML (the Thai page ships a Thai title and
 * description, not these values).
 *
 * `description` used to be here too: an English sentence about licensed 4K
 * content. It was unreachable — the page always replaces it, and the one route
 * that does not (Next's built-in 404) emits no description at all — so its only
 * possible effect was to mislead the next person into thinking editing it changed
 * the site's snippet. Worse, had anything ever fallen through to it, it would have
 * served English prose on /pt-br and /th. Per-market copy belongs in
 * dictionaries/*.json, which is where it now lives exclusively.
 *
 * `title` stays: it is the brand name, correct in every locale, so it is a safe
 * net if a future route forgets its own metadata. `metadataBase` is load-bearing —
 * it resolves the relative canonical and OG image URLs built in lib/seo.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
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
        {/* NOTE: two `preconnect` hints and a Google Fonts `<link rel="stylesheet">`
            for Material Symbols lived here. They are gone, and the icon font is now
            self-hosted — see the `@font-face` in globals.css for the measurements
            (750ms render-blocking, a 1-day cache TTL we did not control, and no
            `font-display`), and `scripts/build-icon-font.mjs` for the glyph list and
            the hard-won warnings about keeping it in sync.

            The preconnects went with it: with no third-party origin left to reach,
            a hint to open a connection to one is pure overhead. Do not re-add
            either without reading that script's header first.

            Next injects the metadata, and the three TEXT faces come from
            `next/font`, which self-hosts and preloads them automatically. The one
            manual tag below is the icon font, which `next/font` does not manage
            because it is declared as a raw `@font-face` in globals.css. */}

        {/* THE ONE MANUAL PRELOAD, and it shortens the page's longest request chain.
            
            PageSpeed measured a 3-deep critical path: the HTML (408ms) blocked the
            stylesheet (1187ms), which blocked THIS FONT (1595ms). A font referenced
            only from a CSS `url()` cannot be discovered until that CSS has been
            downloaded and parsed, so the browser learned about a 15KB same-origin
            file it could have started immediately about a second late.
            
            `preload` moves the request up to the HTML, in parallel with the CSS
            instead of behind it — the chain becomes 2 deep and the font stops being
            the last thing to arrive.
            
            This is also what makes `font-display: block` on that @font-face a safe
            choice: icons are plain spans now, so a fallback face would render the
            literal ligature names ("expand_more") mid-layout. `block` hides the
            glyph instead, and the preload keeps that window short. The two changes
            are a pair — removing this preload makes `block` the wrong trade.
            
            `crossOrigin` is REQUIRED even though this is same-origin: fonts are
            always fetched in CORS mode, so without it the preload lands in a
            separate cache partition and the file is downloaded TWICE — the classic
            "preloaded resource was not used" warning. */}
        <link
          rel="preload"
          href="/fonts/material-symbols-subset.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <MaterialWebLoader />
        {children}
        {/* Loads the Web Analytics collector, which counts page views on its own
            and is also what makes `trackEvent` in lib/analytics.ts do anything —
            `track()` is a silent no-op when this is absent, so removing it would
            not break a build or a test, it would just stop the funnel data
            without any signal. Mounted in the root layout so it covers all three
            locales from one place.

            It stays out of <head> intentionally: this renders no markup, only a
            deferred same-origin script, so it has no reason to compete with the
            hero for the critical path. Same-origin (`/_vercel/insights/*`) also
            means it needs no new CSP origin. */}
        <Analytics />
      </body>
    </html>
  )
}
