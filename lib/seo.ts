import type { Metadata } from 'next'
import { SITE } from '@/lib/config/site'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import { locales, localeMeta, type Locale } from '@/lib/i18n/config'

/**
 * The share card for a market, built by `scripts/build-share-cards.mjs`.
 *
 * One card PER MARKET, because the card's headline is the price and the price is
 * different in each ($1.25 / R$ 6,20 / 43 บาท per month). A single shared card
 * quoted one market's currency to all three.
 */
const shareCard = (locale: Locale) => `/media/share/zenorix-${locale}.jpg`

/** Matches the `WIDTH`/`HEIGHT` the generator writes. A mismatch makes scrapers
    reserve the wrong box and crop the card. */
const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const

/**
 * Every market page is independently indexable: its own canonical URL, its own
 * localized title/description, and a reciprocal hreflang set pointing at the
 * same page in the other two markets (plus x-default on English).
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

/**
 * Metadata for a market page.
 *
 * There are exactly three of these — `/en`, `/pt-br`, `/th` — and each describes
 * the product, not a film. An earlier version keyed this off a featured `Movie`,
 * which meant the title of the whole site changed with whichever film sat first
 * in an array, and promised a specific film to anyone who saw the link.
 */
export function buildMarketMetadata({
  locale,
  dict,
  path,
}: {
  locale: Locale
  dict: Dictionary
  /** Resolves this page's URL in any market, for canonical + hreflang. */
  path: (locale: Locale) => string
}): Metadata {
  const values = { country: dict.market.country, countryShort: dict.market.countryShort }
  const description = fill(dict.meta.description, values)
  const canonical = `${SITE.url}${path(locale)}`

  return {
    title: fill(dict.meta.title, values),
    description,
    keywords: dict.meta.keywords,
    alternates: { canonical, ...buildLocaleAlternates(path) },
    openGraph: {
      /* `website`, not `video.movie`: this page is the product's home, and
         claiming a film type made scrapers look for a film the page never had. */
      type: 'website',
      siteName: SITE.name,
      locale: localeMeta[locale].ogLocale,
      url: canonical,
      title: fill(dict.meta.ogTitle, values),
      description,
      images: [
        {
          url: `${SITE.url}${shareCard(locale)}`,
          ...SHARE_CARD_SIZE,
          alt: dict.meta.imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fill(dict.meta.ogTitle, values),
      description,
      images: [`${SITE.url}${shareCard(locale)}`],
    },
    robots: { index: true, follow: true },
  }
}

/**
 * JSON-LD for the two things this page actually is: an installable Android app,
 * and an FAQ. Emitted as one graph so crawlers get both.
 *
 * There is deliberately NO `Movie` node. One used to be emitted for a featured
 * film, which told crawlers this URL was a page about that film — a claim the
 * page never backed up, since it shows a chart of twenty titles and an install
 * pitch. Structured data has to describe what is actually on the page.
 */
export function buildStructuredData({
  locale,
  dict,
  path,
}: {
  locale: Locale
  dict: Dictionary
  path: (locale: Locale) => string
}) {
  const url = `${SITE.url}${path(locale)}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE.name,
        url,
        inLanguage: localeMeta[locale].hreflang,
        description: fill(dict.meta.description, {
          country: dict.market.country,
          countryShort: dict.market.countryShort,
        }),
      },
      {
        '@type': 'SoftwareApplication',
        name: SITE.name,
        applicationCategory: 'MultimediaApplication',
        /* Bare "Android" — this is the value crawlers match against, so the
           minimum version moves to `softwareRequirements` rather than being
           baked into the string as "Android 8.0+", which matches nothing. */
        operatingSystem: 'Android',
        softwareRequirements: `Android ${SITE.minAndroid} or later`,
        /* The APK's real MIME type. schema.org defines `fileFormat` as a MIME
           type, so this is the machine-readable form of "it's an APK" — the
           bare string "APK" is not a registered format and parses as free text. */
        fileFormat: 'application/vnd.android.package-archive',
        softwareVersion: SITE.apkVersion,
        fileSize: SITE.apkSize,
        /* Used BARE, not joined to `SITE.url`: the APK lives on its own update
           host, so prefixing the site origin would emit a broken
           "https://zenorix.apphttps://update.vinextv.co/..." here. */
        installUrl: SITE.apkUrl,
        /* AggregateOffer rather than a bare Offer list: this app has THREE price
           points per market (free trial, monthly, annual) and an aggregate is the
           only shape that states the range explicitly. `lowPrice: 0` is what lets
           an AI answer engine say "there is a free tier" without inferring it, and
           every figure carries the market's own currency so the US, BR and TH
           graphs never report each other's numbers.
           All values come from `dict.market.*Value` — the same numbers the visible
           pricing UI renders — so the schema cannot drift from the page copy. */
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: dict.market.currency,
          lowPrice: '0',
          highPrice: String(dict.market.annualTotalValue),
          offerCount: 3,
          offers: [
            {
              '@type': 'Offer',
              /* `trial.value` is the literal offer ("30 DAYS FREE"); `trial.label`
                 beside it is a marketing eyebrow ("Easy Try") and would be wrong
                 here. The paid tiers below carry no `name` for the same reason —
                 their only labels in the dictionary are marketing copy, and a
                 billing period states what they are more precisely anyway. */
              name: dict.about.trial.value,
              price: '0',
              priceCurrency: dict.market.currency,
              description: dict.faq.items[0].q,
            },
            {
              '@type': 'Offer',
              price: String(dict.market.monthlyValue),
              priceCurrency: dict.market.currency,
              /* Explicit unit so "2" is never read as a one-off charge. */
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: String(dict.market.monthlyValue),
                priceCurrency: dict.market.currency,
                billingDuration: 1,
                billingIncrement: 1,
                unitCode: 'MON',
              },
            },
            {
              '@type': 'Offer',
              price: String(dict.market.annualTotalValue),
              priceCurrency: dict.market.currency,
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: String(dict.market.annualTotalValue),
                priceCurrency: dict.market.currency,
                billingDuration: 12,
                billingIncrement: 1,
                unitCode: 'MON',
              },
            },
          ],
        },
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
    downloads: SITE.apkDownloads,
    version: SITE.apkVersion,
    minAndroid: SITE.minAndroid,
    movies: SITE.library.movies,
    series: SITE.library.series,
    channels: SITE.library.channels,
    total: SITE.library.total,
  }
}
