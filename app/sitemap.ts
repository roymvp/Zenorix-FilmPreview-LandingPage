import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config/site'
import { movies } from '@/lib/content/movies'
import { locales, localeMeta, moviePath, type Locale } from '@/lib/i18n/config'

/**
 * Lists every market page with reciprocal hreflang alternates, so each
 * localized URL is discovered and correctly clustered by search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = (path: (locale: Locale) => string) => {
    const languages: Record<string, string> = {}
    for (const locale of locales) {
      languages[localeMeta[locale].hreflang] = `${SITE.url}${path(locale)}`
    }
    return { languages }
  }

  const homes = locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
    alternates: alternates((target) => `/${target}`),
  }))

  const films = locales.flatMap((locale) =>
    movies.map((movie) => ({
      url: `${SITE.url}${moviePath(locale, movie.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: alternates((target) => moviePath(target, movie.slug)),
    })),
  )

  return [...homes, ...films]
}
