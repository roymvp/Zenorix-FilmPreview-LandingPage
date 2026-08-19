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

/**
 * U+FFFD, the Unicode REPLACEMENT CHARACTER — what a decoder writes when it is
 * handed bytes it cannot interpret. It is never a legitimate character in copy.
 */
const REPLACEMENT_CHAR = '\uFFFD'

/** Locales already checked, so the walk below runs once per locale per process. */
const validated = new Set<Locale>()

/**
 * Fails the build if a dictionary contains U+FFFD.
 *
 * This exists because the corruption it catches was REAL, ONGOING, and completely
 * invisible. `th.json` shipped 107 replacement characters across 21 strings and
 * `pt-br.json` one ("possível" -> "poss<?>vel"); the Thai damage included
 * `title.writer` and `title.rated`, two labels that render on all 29 Thai title
 * pages, plus prose in every Thai legal document.
 *
 * The decisive detail is the SHAPE of the history: replaying every commit that
 * touched `th.json` shows the count climbing almost monotonically —
 * 0, 2, 10, 15, 21, 30, 33, 46, 49, 54, 62, 75, 79, 88, 96, 101, 107 — so this was
 * not one bad import that could be fixed and forgotten. Something in the editing
 * path eats a few bytes of multi-byte text on each write, which means repairing the
 * characters WITHOUT this check would only have reset a counter that climbs again.
 * (The repair itself took each broken string from the newest commit where it was
 * still clean, rather than reconstructing Thai by hand.)
 *
 * Why it is enforced HERE, at load, rather than in a lint script: every page calls
 * `getDictionary` while prerendering, so a corrupted file cannot reach a
 * deployment without failing `next build` first. A separate script would only run
 * when someone remembered to run it — and nobody remembers to check for a
 * character they cannot see. Same reasoning as the `Dictionary` type above: make
 * the failure structural, not a convention.
 *
 * Thrown rather than warned deliberately. A warning scrolls past in build output;
 * these strings are a third of the site's markets, and mojibake in a `<title>`,
 * `<h1>` or `meta description` is both a visible defect and an indexed one.
 */
function assertDecodedCleanly(locale: Locale, dict: Dictionary): void {
  if (validated.has(locale)) return

  const damaged: string[] = []
  const walk = (node: unknown, path: string) => {
    if (typeof node === 'string') {
      if (node.includes(REPLACEMENT_CHAR)) damaged.push(path)
    } else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        walk(value, path ? `${path}.${key}` : key)
      }
    }
  }
  walk(dict, '')

  if (damaged.length > 0) {
    throw new Error(
      `dictionaries/${locale}.json contains the Unicode replacement character ` +
        `(U+FFFD) in ${damaged.length} string(s): ${damaged.join(', ')}.\n` +
        `This means text was mangled by a bad encode/decode round-trip, not ` +
        `authored that way. Do NOT hand-retype the affected strings — recover ` +
        `each one from the newest commit where it was still clean:\n` +
        `  git log --format=%h -- dictionaries/${locale}.json\n` +
        `  git show <commit>:dictionaries/${locale}.json`,
    )
  }

  validated.add(locale)
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const dict = await loaders[locale]()
  assertDecodedCleanly(locale, dict)
  return dict
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
