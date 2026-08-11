import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TitlePage } from '@/components/landing/title-page'
import { getChartEntry } from '@/lib/content/charts'
import { allTitles, getTitleBySlug } from '@/lib/content/titles'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { buildTitleMetadata } from '@/lib/seo'

type RouteParams = { lang: string; slug: string }

/**
 * One page per researched title: `/[lang]/titles/[slug]`.
 *
 * WHY THIS IS NOT THE ROUTE THAT WAS DELETED. `charts.ts` records that a
 * `/movie/[slug]` route existed here and was removed as a doorway page — every URL
 * rendered the same landing page with a swapped `<title>`. Three things make this
 * different, and all three are enforced by code rather than by intent:
 *
 *   1. `getTitleBySlug` resolves against `lib/content/titles.ts`, which holds
 *      researched per-title facts. A slug with no record 404s, so there is no way
 *      to mint a URL that has nothing on it.
 *   2. `TitlePage` renders those facts and nothing shared except one CTA — no FAQ,
 *      no feature grid, no pricing block. Two of these pages have almost no text
 *      in common.
 *   3. The segment is `/titles/`, so these URLs cannot collide with the legal
 *      `/[lang]/[slug]` route above them. Without the extra segment, adding a
 *      title called "terms" would silently shadow the Terms of Service.
 */
async function resolve(params: Promise<RouteParams>) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()

  const record = getTitleBySlug(slug)
  /* No record means no page — see rule 1 above. Deliberately a 404 rather than a
     thin fallback: a page that says only "we have no information" is the doorway
     case in a different costume. */
  if (!record) notFound()

  /* The chart entry owns the display title and the poster (see `getChartEntry`).
     Missing means the pool and the title registry have drifted, which is a
     developer error, not a visitor's — so 404 rather than render half a page. */
  const entry = getChartEntry(record.id)
  if (!entry) notFound()

  const locale: Locale = lang
  return { locale, record, entry, dict: await getDictionary(locale) }
}

/**
 * Every researched title in every market, prerendered.
 *
 * These are static facts, so there is nothing to resolve per request and a crawler
 * following a chart card never waits on a render. The count grows as records are
 * added to `titles.ts` — it is derived, never hand-maintained.
 */
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    allTitles().map((record) => ({ lang, slug: record.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, record, entry, dict } = await resolve(params)
  return buildTitleMetadata({
    locale,
    dict,
    record,
    title: entry.title,
    poster: entry.poster,
  })
}

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { locale, record, entry, dict } = await resolve(params)
  return <TitlePage locale={locale} dict={dict} record={record} entry={entry} />
}
