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

/**
 * The footer's legal row, for any page in any market.
 *
 * Built here rather than inline in the footer's two callers so the landing page
 * and the legal pages cannot end up with different link sets — and so the label
 * for each document is read from the same `dict.footer` key that names it
 * everywhere else.
 */
export function legalLinks(
  locale: string,
  labels: Record<LegalSlug, string>,
): { label: string; href: string }[] {
  return LEGAL_SLUGS.map((slug) => ({
    label: labels[slug],
    href: `/${locale}/${slug}`,
  }))
}
