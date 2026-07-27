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
