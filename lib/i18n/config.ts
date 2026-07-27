/**
 * i18n routing contract.
 *
 * Each market is a fully independent, statically generated page with its own
 * localized URL path. The language selector is page NAVIGATION, never
 * client-side string swapping — that is what gives every market its own
 * indexable, link-equity-carrying URL.
 *
 *   en    -> /en/movie/[slug]
 *   pt-br -> /pt-br/filme/[slug]
 *   th    -> /th/หนัง/[slug]
 */
export const locales = ['en', 'pt-br', 'th'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export type LocaleMeta = {
  /** Value for <html lang>. */
  htmlLang: string
  /** Value for hreflang / og:locale. */
  hreflang: string
  ogLocale: string
  /** Localized movie path segment. */
  segment: string
  /** Short label shown in the selector. */
  short: string
  /** Endonym shown in the selector menu. */
  name: string
  /** Accept-Language prefixes that resolve to this locale. */
  accept: readonly string[]
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    htmlLang: 'en-US',
    hreflang: 'en-US',
    ogLocale: 'en_US',
    segment: 'movie',
    short: 'EN',
    name: 'English',
    accept: ['en'],
  },
  'pt-br': {
    htmlLang: 'pt-BR',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    segment: 'filme',
    short: 'PT',
    name: 'Português',
    accept: ['pt-br', 'pt'],
  },
  th: {
    htmlLang: 'th-TH',
    hreflang: 'th-TH',
    ogLocale: 'th_TH',
    segment: 'หนัง',
    short: 'TH',
    name: 'ไทย',
    accept: ['th'],
  },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Builds the localized, URL-encoded path for a movie page. */
export function moviePath(locale: Locale, slug: string): string {
  return `/${locale}/${encodeURIComponent(localeMeta[locale].segment)}/${slug}`
}
