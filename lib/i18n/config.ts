/**
 * i18n routing contract.
 *
 * Each market is a fully independent, statically generated page with its own
 * URL path (`/en`, `/pt-br`, `/th`). The language selector is page NAVIGATION —
 * plain anchors, never client-side string swapping — so every market keeps its
 * own indexable, link-equity-carrying URL.
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
  /** Endonym, used as the anchor's accessible name. */
  name: string
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    htmlLang: 'en-US',
    hreflang: 'en-US',
    ogLocale: 'en_US',
    short: 'EN',
    name: 'English',
  },
  'pt-br': {
    htmlLang: 'pt-BR',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    short: 'PT',
    name: 'Português',
  },
  th: {
    htmlLang: 'th-TH',
    hreflang: 'th-TH',
    ogLocale: 'th_TH',
    short: 'TH',
    name: 'ไทย',
  },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Every market home, the only route shape the site has. */
export const homePath = (locale: Locale) => `/${locale}`
