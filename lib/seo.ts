import type { Metadata } from 'next'
import { SITE } from '@/lib/config/site'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { homePath, locales, localeMeta, type Locale } from '@/lib/i18n/config'

/**
 * Every market page is independently indexable: its own canonical URL, its own
 * localized title/description, and a reciprocal hreflang set pointing at the
 * other two markets (plus x-default on English).
 */
function buildLocaleAlternates(): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[localeMeta[locale].hreflang] = `${SITE.url}${homePath(locale)}`
  }
  languages['x-default'] = `${SITE.url}${homePath('en')}`
  return { languages }
}

/**
 * Metadata for a market home page — the only page type the site has.
 *
 * `canonicalLocale` exists for the root route, which serves the English page at
 * `/` but must point search engines at `/en` so the two are not indexed as
 * duplicates.
 */
export function buildHomeMetadata({
  locale,
  dict,
  canonicalLocale = locale,
}: {
  locale: Locale
  dict: Dictionary
  canonicalLocale?: Locale
}): Metadata {
  const { title, description, imageAlt } = dict.meta
  const canonical = `${SITE.url}${homePath(canonicalLocale)}`
  const image = `${SITE.url}${SITE.ogImage}`

  return {
    title,
    description,
    alternates: { canonical, ...buildLocaleAlternates() },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: localeMeta[locale].ogLocale,
      url: canonical,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  }
}
