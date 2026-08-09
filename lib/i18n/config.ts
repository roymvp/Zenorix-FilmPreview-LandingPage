/**
 * i18n routing contract.
 *
 * Each market is a fully independent, statically generated page with its own
 * localized URL path. The language selector is page NAVIGATION, never
 * client-side string swapping — that is what gives every market its own
 * indexable, link-equity-carrying URL.
 *
 *   en    -> /en
 *   pt-br -> /pt-br
 *   th    -> /th
 *
 * That is the complete route table. A localized `/movie/[slug]` tier used to sit
 * under each market (with a translated path segment: movie / filme / หนัง), but
 * every one of those URLs rendered the identical landing page under a different
 * title, so the tier — and the `segment` field that localized it — is gone.
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
    short: 'EN',
    name: 'English',
    accept: ['en'],
  },
  'pt-br': {
    htmlLang: 'pt-BR',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    short: 'PT',
    name: 'Português',
    accept: ['pt-br', 'pt'],
  },
  th: {
    htmlLang: 'th-TH',
    hreflang: 'th-TH',
    ogLocale: 'th_TH',
    short: 'TH',
    name: 'ไทย',
    accept: ['th'],
  },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
