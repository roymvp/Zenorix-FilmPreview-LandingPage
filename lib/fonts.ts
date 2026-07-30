import { Roboto, Noto_Sans_Thai } from 'next/font/google'

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

/**
 * Both font variables, for the <html> element. Shared by the two root layouts
 * so every market resolves the identical font stack — see components/site-html.
 */
export const fontVariables = `${roboto.variable} ${notoSansThai.variable}`
