import type { Metadata } from 'next'
import { SITE } from '@/lib/config/site'
import type { Movie } from '@/lib/content/movies'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import { locales, localeMeta, moviePath, type Locale } from '@/lib/i18n/config'

/**
 * Every market page is independently indexable: its own canonical URL, its own
 * localized title/description, and a reciprocal hreflang set pointing at the
 * same film in the other two markets (plus x-default on English).
 */
export function buildLocaleAlternates(
  path: (locale: Locale) => string,
): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[localeMeta[locale].hreflang] = `${SITE.url}${path(locale)}`
  }
  languages['x-default'] = `${SITE.url}${path('en')}`
  return { languages }
}

export function buildMovieMetadata({
  movie,
  locale,
  dict,
  path,
}: {
  movie: Movie
  locale: Locale
  dict: Dictionary
  /** Resolver so the home route and the /movie/[slug] route share this logic. */
  path: (locale: Locale) => string
}): Metadata {
  const copy = movie.copy[locale]
  const values = {
    title: copy.title,
    year: movie.releaseYear,
    country: dict.market.country,
  }
  const title = fill(dict.meta.title, values)
  const description = fill(dict.meta.description, values)
  const canonical = `${SITE.url}${path(locale)}`

  return {
    title,
    description,
    keywords: fill(dict.meta.keywords, values),
    alternates: { canonical, ...buildLocaleAlternates(path) },
    openGraph: {
      type: 'video.movie',
      siteName: SITE.name,
      locale: localeMeta[locale].ogLocale,
      url: canonical,
      title: fill(dict.meta.ogTitle, values),
      description,
      images: [
        {
          url: `${SITE.url}${movie.backdrop}`,
          width: 1536,
          height: 864,
          alt: fill(dict.meta.imageAlt, values),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fill(dict.meta.ogTitle, values),
      description,
      images: [`${SITE.url}${movie.backdrop}`],
    },
    robots: { index: true, follow: true },
  }
}

/**
 * JSON-LD for the three things this page actually is: a film, an installable
 * Android app, and an FAQ. Emitted as one graph so crawlers get all of it.
 */
export function buildStructuredData({
  movie,
  locale,
  dict,
  path,
}: {
  movie: Movie
  locale: Locale
  dict: Dictionary
  path: (locale: Locale) => string
}) {
  const copy = movie.copy[locale]
  const url = `${SITE.url}${path(locale)}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Movie',
        name: copy.title,
        url,
        image: `${SITE.url}${movie.poster}`,
        description: copy.synopsis,
        genre: copy.genres,
        datePublished: String(movie.releaseYear),
        duration: `PT${movie.runtimeMinutes}M`,
        inLanguage: localeMeta[locale].hreflang,
        potentialAction: {
          '@type': 'WatchAction',
          target: url,
          expectsAcceptanceOf: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: dict.market.currency,
            eligibleRegion: dict.market.countryShort,
          },
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: SITE.name,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: `Android ${SITE.minAndroid}+`,
        softwareVersion: SITE.apkVersion,
        fileSize: SITE.apkSize,
        installUrl: `${SITE.url}${SITE.apkUrl}`,
        offers: [
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: dict.market.currency,
            description: dict.faq.items[0].q,
          },
          {
            '@type': 'Offer',
            price: String(dict.market.annualPerMonthValue),
            priceCurrency: dict.market.currency,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: dict.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}

/** Fills every runtime token a market page needs, in one place. */
export function marketValues(dict: Dictionary) {
  return {
    country: dict.market.country,
    countryShort: dict.market.countryShort,
    zero: dict.market.zero,
    monthly: dict.market.monthly,
    annualPerMonth: dict.market.annualPerMonth,
    annualTotal: dict.market.annualTotal,
    size: SITE.apkSize,
    version: SITE.apkVersion,
    minAndroid: SITE.minAndroid,
    movies: SITE.library.movies,
    series: SITE.library.series,
    channels: SITE.library.channels,
    total: SITE.library.total,
  }
}

export { moviePath }
