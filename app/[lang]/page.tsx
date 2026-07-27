import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FilmLanding } from '@/components/landing/film-landing'
import { featuredSlug, getMovie } from '@/lib/content/movies'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { buildMovieMetadata } from '@/lib/seo'

type RouteParams = { lang: string }

/**
 * Market home (/en, /pt-br, /th) shows the currently featured film. It reuses
 * the exact same landing composition as the deep movie routes, so there is one
 * conversion funnel to maintain rather than two.
 */
async function resolve(params: Promise<RouteParams>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const locale: Locale = lang
  const movie = getMovie(featuredSlug)
  if (!movie) notFound()

  return { locale, movie, dict: await getDictionary(locale) }
}

/** Home canonicalizes to itself in each market. */
const homePath = (locale: Locale) => `/${locale}`

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, movie, dict } = await resolve(params)
  return buildMovieMetadata({ movie, locale, dict, path: homePath })
}

export default async function MarketHomePage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { locale, movie, dict } = await resolve(params)

  return <FilmLanding movie={movie} locale={locale} dict={dict} path={homePath} />
}
