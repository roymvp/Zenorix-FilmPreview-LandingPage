import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Roboto, Noto_Sans_Thai, Orbitron } from 'next/font/google'
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

/**
 * DISPLAY FACE, wordmark only — the eight letters of `.zx-brand-name` in the top
 * bar, and nothing else. It is not in the body stack and must not be: this is a
 * wide squared techno face, unreadable in a paragraph.
 *
 * Why a third webfont at all: the hero no longer renders the raster lockup, so
 * the top bar's live-text wordmark is the only place the brand is stated. In
 * Roboto Bold it read as a generic app header rather than as the logo it sits
 * next to. Orbitron is the closest match on Google Fonts to the lockup's
 * lettering (wide, geometric, squared counters, very heavy).
 *
 * ONE weight (900), latin only — that keeps it to a single small woff2, and it
 * roughly offsets the 172px lockup image the hero just stopped requesting.
 * `display: 'swap'` so the wordmark paints in Roboto immediately rather than
 * leaving a hole in the bar on a slow connection.
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
     browser UI draws a visible stripe against them.

     That is now the hero's poster wall under a dark frosted bar, so it is the
     canvas black (`--md-sys-color-surface`). It was #f3f5f8 for as long as the bar
     was an opaque near-white island; before that it was a warm near-black. It has
     to be a literal — Next serialises it into a <meta> tag before any CSS
     exists. */
  themeColor: '#08090b',
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
      className={`${roboto.variable} ${notoSansThai.variable} ${orbitron.variable}`}
      suppressHydrationWarning
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
            (conversion-dialogs + language-switcher), expand_more (faq-section +
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
