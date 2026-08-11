/**
 * The three legal documents, as one registry.
 *
 * These used to be `#privacy`, `#terms` and `#dmca` in the footer — fragments
 * pointing at ids that existed on no page, so all three silently resolved to the
 * top of the landing page. That is three broken links in the one place a visitor
 * (or a reviewer, or a crawler) goes looking for exactly this.
 *
 * `slug` is the URL segment AND the dictionary key under `dict.legal`, so a
 * document cannot exist at a route without copy or vice versa — adding one here
 * is what makes it appear in the footer, the sitemap and the routes at once.
 */
export const LEGAL_SLUGS = ['privacy', 'terms', 'dmca'] as const

export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value)
}
