import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FilmLanding } from '@/components/landing/film-landing'
import { getMovie, movies } from '@/lib/content/movies'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, localeMeta, locales, moviePath, type Locale } from '@/lib/i18n/config'
import { buildMovieMetadata } from '@/lib/seo'

type RouteParams = { lang: string; segment: string; slug: string }

/**
 * Independent, fully static page per market:
 *   /en/movie/avatar-fire-and-ash
 *   /pt-br/filme/avatar-fire-and-ash
 *   /th/หนัง/avatar-fire-and-ash
 *
 * The localized path segment is part of the URL (not a query flag) so each
 * market accrues its own link equity and reads natively to local users.
 */
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    movies.map((movie) => ({
      lang,
      segment: localeMeta[lang].segment,
      slug: movie.slug,
    })),
  )
}

/** Guards the locale/segment pair so only the canonical URL renders. */
async function resolve(params: Promise<RouteParams>) {
  const { lang, segment, slug } = await params
  if (!isLocale(lang)) notFound()

  const locale: Locale = lang
  if (decodeURIComponent(segment) !== localeMeta[locale].segment) notFound()

  const movie = getMovie(slug)
  if (!movie) notFound()

  return { locale, movie, dict: await getDictionary(locale) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, movie, dict } = await resolve(params)
  return buildMovieMetadata({
    movie,
    locale,
    dict,
    path: (target) => moviePath(target, movie.slug),
  })
}

export default async function MoviePage({ params }: { params: Promise<RouteParams> }) {
  const { locale, movie, dict } = await resolve(params)

  return (
    <FilmLanding
      movie={movie}
      locale={locale}
      dict={dict}
      path={(target) => moviePath(target, movie.slug)}
    />
  )
}
