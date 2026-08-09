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
  /**
   * Bare country name and language name, IN ENGLISH, for machine-readable output
   * that is never shown to a visitor — currently `/llms.txt`.
   *
   * These cannot come from the dictionaries, which is the whole reason they exist
   * here. `dict.market.country` is a PREPOSITIONAL PHRASE built for sentence
   * interpolation ("available {country}"), so its values are "the United States",
   * "no Brasil", "ในไทย" — correct in a sentence, wrong as a label. Dropped into a
   * table's Market column they read "no Brasil" and "ในไทย", and an AI extracting
   * that cell learns the market is called "no Brasil" rather than "Brazil".
   * `localeMeta.name` has the same problem for languages: it is the endonym,
   * deliberately, because it is rendered in the language selector.
   *
   * So: English, no preposition, no article beyond what the name itself carries.
   * Do NOT render these in the UI — visible copy belongs in the dictionaries.
   */
  marketEn: string
  languageEn: string
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
    marketEn: 'United States',
    languageEn: 'English',
    accept: ['en'],
  },
  'pt-br': {
    htmlLang: 'pt-BR',
    hreflang: 'pt-BR',
    ogLocale: 'pt_BR',
    short: 'PT',
    name: 'Português',
    marketEn: 'Brazil',
    languageEn: 'Brazilian Portuguese',
    accept: ['pt-br', 'pt'],
  },
  th: {
    htmlLang: 'th-TH',
    hreflang: 'th-TH',
    ogLocale: 'th_TH',
    short: 'TH',
    name: 'ไทย',
    marketEn: 'Thailand',
    languageEn: 'Thai',
    accept: ['th'],
  },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
