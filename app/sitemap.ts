import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config/site'
import { homePath, locales, localeMeta } from '@/lib/i18n/config'

/**
 * The three market homes — the only indexable URLs on the site. Each carries
 * reciprocal hreflang alternates so search engines cluster them correctly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[localeMeta[locale].hreflang] = `${SITE.url}${homePath(locale)}`
  }

  return locales.map((locale) => ({
    url: `${SITE.url}${homePath(locale)}`,
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages },
  }))
}
