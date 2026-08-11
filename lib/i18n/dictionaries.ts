import type { Locale } from '@/lib/i18n/config'
import en from '@/dictionaries/en.json'

/**
 * Strict content/code separation: `en.json` is the schema. Any market file that
 * drifts from it fails the type check, so a missing translation can never ship
 * as an English fallback in production.
 */
export type Dictionary = typeof en

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => en,
  'pt-br': () => import('@/dictionaries/pt-br.json').then((m) => m.default as Dictionary),
  th: () => import('@/dictionaries/th.json').then((m) => m.default as Dictionary),
}

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]()
}

/**
 * Minimal `{token}` interpolation. Deliberately not a runtime i18n library:
 * pages are statically generated, so string assembly happens at build time and
 * ships zero JavaScript.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

/**
 * Picks the singular or plural template for `value`, then fills `{count}`.
 *
 * The form comes from the dictionary rather than from a rule in the component,
 * because the markets do not agree on how many forms exist. English and Portuguese
 * are both "one vs. other"; Thai has no grammatical plural, so `th.json` gives
 * both keys the same string and the choice is a harmless no-op there instead of an
 * English assumption hardcoded into shared code.
 *
 * Two forms rather than `Intl.PluralRules` because two is all the current locales
 * distinguish, and this keeps assembly at build time. If a market with more
 * categories is added (ru, pl, ar) the dictionary keys grow to one/few/many/other
 * and this becomes an `Intl.PluralRules` lookup — the call sites stay as they are.
 */
export function pluralize(
  value: number,
  forms: { one: string; other: string },
): string {
  return fill(value === 1 ? forms.one : forms.other, { count: value })
}
