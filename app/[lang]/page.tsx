import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketLanding } from '@/components/landing/market-landing'
import { getChartTitles } from '@/lib/content/charts'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { buildMarketMetadata } from '@/lib/seo'

type RouteParams = { lang: string }

/**
 * The market page — and the only page. `/en`, `/pt-br` and `/th` are the whole
 * site: one landing page per market, each with its own localized copy, canonical
 * URL and hreflang set.
 *
 * There used to be a second route, `/[lang]/[segment]/[slug]`, rendering this
 * exact same component for three films per market. Because nothing about the film
 * was visible, those nine URLs served byte-identical content under different
 * titles — doorway pages. They are gone; this is the single entry point.
 */
async function resolve(params: Promise<RouteParams>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const locale: Locale = lang
  return { locale, dict: await getDictionary(locale) }
}

/** Each market canonicalizes to itself. */
const homePath = (locale: Locale) => `/${locale}`

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, dict } = await resolve(params)
  return buildMarketMetadata({
    locale,
    dict,
    path: homePath,
    /* Read from the chart module, not duplicated here, so the head's keywords
       list and the rails the page renders can never disagree. */
    titles: getChartTitles(locale),
  })
}

export default async function MarketHomePage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { locale, dict } = await resolve(params)

  return <MarketLanding locale={locale} dict={dict} path={homePath} />
}
