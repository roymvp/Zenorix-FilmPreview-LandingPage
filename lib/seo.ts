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
  titles,
}: {
  locale: Locale
  dict: Dictionary
  /** Resolves this page's URL in any market, for canonical + hreflang. */
  path: (locale: Locale) => string
  /**
   * The chart titles this market's page actually renders, from
   * `getChartTitles`. Appended to `keywords` — see the note there.
   */
  titles: string[]
}): Metadata {
  const values = { country: dict.market.country, countryShort: dict.market.countryShort }
  const description = fill(dict.meta.description, values)
  const canonical = `${SITE.url}${path(locale)}`

  return {
    title: fill(dict.meta.title, values),
    description,
    /* The market's own generic terms FIRST, then the twenty titles the rails
       render this week.

       An ARRAY, not `${dict.meta.keywords}, ${titles.join(', ')}`: Next joins it
       into the meta tag itself, so no separator is hand-built and a title
       containing a comma cannot silently split into two keywords.

       Worth doing even though Google has ignored this tag for years — Baidu still
       reads it, and it is the cheapest place the film names become machine-
       readable at all. The cards render NO title text (the posters carry their own
       lettering), so without this the only copies of these twenty names in the
       document are `aria-label` attributes, which crawlers do not index as
       content. The titles come from the same function that builds the rails, so
       this list cannot name a film the page does not show — the line between
       legitimate keywords and stuffing. */
    keywords: [dict.meta.keywords, ...titles],
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
 * Metadata for one of the three legal documents.
 *
 * Deliberately much thinner than `buildMarketMetadata`: no share card, no
 * keywords, no OpenGraph block. A privacy policy shared into a chat should show a
 * plain link, not the product's price billboard — and these pages are here to be
 * read and crawled, not to convert. What they DO get is the same reciprocal
 * hreflang treatment as the market pages, because each document exists in all
 * three languages and Google has to know the nine are three sets of three rather
 * than nine unrelated URLs.
 */
export function buildLegalMetadata({
  locale,
  dict,
  doc,
}: {
  locale: Locale
  dict: Dictionary
  doc: 'privacy' | 'terms' | 'dmca'
}): Metadata {
  const copy = dict.legal[doc]
  const path = (target: Locale) => `/${target}/${doc}`
  const canonical = `${SITE.url}${path(locale)}`

  return {
    /* Suffixed with the brand because these titles are generic by nature — every
       site has a "Privacy Policy", and the market pages get their brand from
       `dict.meta.title` instead. */
    title: `${copy.title} — ${SITE.name}`,
    description: copy.description,
    alternates: { canonical, ...buildLocaleAlternates(path) },
    /* Indexable. A legal page carries little ranking value of its own, but these
       are what a reviewer looks for to decide the site is a real operation, and
       `follow` passes their link back to the market page. */
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
  charts,
}: {
  locale: Locale
  dict: Dictionary
  path: (locale: Locale) => string
  /**
   * The two rails as rendered, so the `ItemList` nodes below describe the real
   * page. Each rail's heading comes along because it is the list's visible name.
   */
  charts: { name: string; titles: string[] }[]
}) {
  const url = `${SITE.url}${path(locale)}`
  const organizationId = `${SITE.url}/#organization`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      /* The BRAND as an entity, not just a page.
         
         "Zenorix" is a badly contested name: searching it surfaces at least six
         unrelated Zenorix organizations (design agencies, a Salesforce
         consultancy, a holding company) that already own the term, plus a YouTube
         channel belonging to someone else entirely. Every other node in this graph
         describes a PAGE; none of them told Google that a company by this name
         exists at this domain, which is the claim a brand query is actually trying
         to resolve.
         
         `@id` is a fragment URI on the origin, NOT on the localized page: there is
         one company behind all three markets, so all three graphs must point at
         the same identifier or they describe three separate companies.
         
         Deliberately NO `sameAs`. That property is for profiles that unambiguously
         identify this entity, and there are none — the "Zenorix" YouTube channel
         and the zenorix.in site in the search results belong to other people, and
         the support Telegram is a personal handle rather than a brand profile.
         Listing any of them would point Google at somebody else's identity. This
         is the one field that would most help disambiguation, so it is worth
         filling in the moment real official profiles exist. */
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SITE.name,
        url: SITE.url,
        /* The mark rather than the lockup: Google wants a logo that stays legible
           when squared off, and it is served from this origin so it is crawlable
           (robots.txt allows everything). Dimensions are stated because the file is
           256x196 — above Google's 112px floor, but not square, so letting a
           consumer guess risks a stretched render. */
        logo: {
          '@type': 'ImageObject',
          url: `${SITE.url}/brand/zenorix-mark.webp`,
          width: 256,
          height: 196,
        },
      },
      {
        '@type': 'WebSite',
        name: SITE.name,
        url,
        inLanguage: localeMeta[locale].hreflang,
        /* Ties this market page back to the one company above. Without it the
           Organization node floats unconnected to anything the crawler is looking
           at, which is most of the reason a lone Organization node does nothing. */
        publisher: { '@id': organizationId },
        description: fill(dict.meta.description, {
          country: dict.market.country,
          countryShort: dict.market.countryShort,
        }),
      },
      {
        '@type': 'SoftwareApplication',
        name: SITE.name,
        /* Same link as WebSite.publisher: it says this app is published by that
           company, so the brand entity is supported by both nodes rather than
           sitting beside them. */
        publisher: { '@id': organizationId },
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
      /* The two chart rails, as ranked lists of names.
         
         This is the honest way to get the film titles into structured data, and it
         is specifically NOT the `Movie` node this file removed: an `ItemList` says
         "this page ranks these twenty titles", which is exactly what the rails do,
         while a top-level `Movie` said "this URL is about one film", which was never
         true. So an answer engine asked what is trending on Zenorix can name them,
         and none of them is presented as this page's subject.
         
         `ListItem` carries a bare `name` and no nested `Movie`/`TVSeries` and no
         `url`: the page shows a poster and a rank for each title and nothing else —
         no synopsis, no cast, no year, no per-film page to link to (that route was
         a doorway page and was deleted). A `Movie` node here would be a promise of
         detail the document does not contain.
         
         `itemListOrder` is explicit because the order IS the content — it is a
         chart, and each market ranks the same catalogue differently. */
      ...charts.map((chart) => ({
        '@type': 'ItemList',
        name: chart.name,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: chart.titles.length,
        itemListElement: chart.titles.map((title, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: title,
        })),
      })),
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
