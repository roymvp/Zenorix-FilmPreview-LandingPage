import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config/site'
import { LEGAL_SLUGS } from '@/lib/content/legal'
import { locales, type Locale } from '@/lib/i18n/config'
import { buildLocaleAlternates } from '@/lib/seo'

/**
 * Twelve URLs: three market pages plus the three legal documents in each market.
 *
 * The count was twelve once before, for the wrong reason — nine of those were
 * `/movie/[slug]` URLs rendering the identical landing page under different
 * titles, which is the definition of a doorway page, and they were deleted. These
 * nine are the opposite case: a privacy policy, terms of service and a DMCA
 * statement are substantially different documents from each other and from the
 * landing page, so they are the first genuinely distinct pages this domain has
 * had.
 *
 * That matters beyond tidiness. A three-URL sitemap describes a brochure; the
 * strongest competitor for this brand name ranks third with a leftover WordPress
 * title and no favicon, and its one real advantage is having actual pages and
 * internal links to them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /* Shared with the `<head>` alternates via `buildLocaleAlternates`, and
     deliberately not a second local copy of that logic. This file used to build
     its own `languages` map, and the two had already drifted: the helper adds
     `x-default` (the page Google serves to visitors whose language matches none of
     the three markets) and this one did not. Google reads hreflang from both the
     head and the sitemap, so the two were making different claims about the same
     URLs. Import it so that can no longer happen. */
  const alternates = (path: (locale: Locale) => string) =>
    buildLocaleAlternates(path) as { languages: Record<string, string> }

  const markets: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
    alternates: alternates((target) => `/${target}`),
  }))

  /* Lower priority and a yearly cadence: these are worth indexing, but they are
     not what the site is for, and claiming daily changes on fixed copy spends
     crawl budget the market pages should be getting.

     `lastModified` is the date the copy was written, NOT `new Date()`. Restamping
     unchanged legal text on every deploy is exactly what teaches a crawler to stop
     believing the field — and it is the one field a reader checks to see whether a
     policy is current. */
  const legal: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    LEGAL_SLUGS.map((slug) => ({
      url: `${SITE.url}/${locale}/${slug}`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: alternates((target) => `/${target}/${slug}`),
    })),
  )

  return [...markets, ...legal]
}

/** Matches `LAST_UPDATED` in `components/landing/legal-page.tsx`. */
const LEGAL_UPDATED = new Date('2026-02-11')
