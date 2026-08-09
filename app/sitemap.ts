import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config/site'
import { locales, localeMeta, type Locale } from '@/lib/i18n/config'

/**
 * Three URLs — one per market — each with reciprocal hreflang alternates.
 *
 * It used to list twelve: these three plus nine `/movie/[slug]` URLs that all
 * rendered the same landing page with only a different <title>. Submitting near
 * duplicates competes with itself and is what Google classifies as doorway pages,
 * so the sitemap now lists only pages that are genuinely distinct.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = (path: (locale: Locale) => string) => {
    const languages: Record<string, string> = {}
    for (const locale of locales) {
      languages[localeMeta[locale].hreflang] = `${SITE.url}${path(locale)}`
    }
    return { languages }
  }

  return locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
    alternates: alternates((target) => `/${target}`),
  }))
}
