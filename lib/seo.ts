import type { Metadata } from 'next'
import { identityProfiles, ORG, SITE, SOCIAL } from '@/lib/config/site'
import type { LegalSlug } from '@/lib/content/legal'
import type { TitleRecord } from '@/lib/content/titles'
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
    /* The market's own generic terms FIRST, then the thirty titles the rails
       render this week.

       An ARRAY, not `${dict.meta.keywords}, ${titles.join(', ')}`: Next joins it
       into the meta tag itself, so no separator is hand-built and a title
       containing a comma cannot silently split into two keywords.

       Worth doing even though Google has ignored this tag for years — Baidu still
       reads it, and it is the cheapest place the film names become machine-
       readable at all. The cards render NO title text (the posters carry their own
       lettering), so without this the only copies of these thirty names in the
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
      /* Attributes the card to the brand account, which is what puts "From
         @zenorix_tv" on a shared link instead of leaving it unsourced. Needs the
         leading `@`, which `SOCIAL` deliberately does not store — see the note
         there. */
      site: `@${SOCIAL.x.handle}`,
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
 * `<head>` metadata for one title page.
 *
 * The description is the record's own synopsis, and the title leads with the film
 * name and year rather than the brand. Someone searching a film name wants
 * confirmation they have the right thing; a `<title>` that opens with "Zenorix"
 * answers a question nobody asked and loses the match on the one they did.
 */
export function buildTitleMetadata({
  locale,
  dict,
  record,
  title,
  poster,
}: {
  locale: Locale
  dict: Dictionary
  record: TitleRecord
  /** The display name, from the chart entry — `charts.ts` owns it. */
  title: string
  poster: string
}): Metadata {
  const path = (target: Locale) => `/${target}/titles/${record.slug}`
  const canonical = `${SITE.url}${path(locale)}`
  const year = record.released.slice(0, 4)
  const heading = `${title} (${year}) — ${dict.title.metaSuffix}`
  /* Read once into the market's own language. This used to be `record.synopsis`
     when that field was a lone English string, which meant the `description` here
     — the text a result actually quotes — was English on all three locales while
     `heading` beside it was translated. Every one of the 29 titles therefore
     shipped a byte-identical description to three hreflang-linked URLs. */
  const synopsis = record.synopsis[locale]

  return {
    title: heading,
    description: synopsis,
    alternates: { canonical, ...buildLocaleAlternates(path) },
    openGraph: {
      /* `video.movie` is correct HERE, unlike on the market page where it was
         removed: this URL really is about one title. */
      type: 'video.movie',
      siteName: SITE.name,
      locale: localeMeta[locale].ogLocale,
      url: canonical,
      title: heading,
      description: synopsis,
      /* The poster, not the market share card. A share of this URL should show the
         thing the URL is about. */
      images: [{ url: `${SITE.url}${poster}`, width: 420, height: 630 }],
    },
    robots: { index: true, follow: true },
  }
}

/**
 * JSON-LD for one title: what it is and who made it. Deliberately NOT how critics
 * scored it — see the `aggregateRating` note on the node below.
 *
 * This is the page type where structured data risks the most, so one rule is
 * absolute: every property here describes the WORK, from a field the record
 * actually holds. No ratings, no invented values, nothing this site is not the
 * source of. An earlier version of this comment made "emit a researched
 * aggregator score, with attribution" the rule; that was the wrong reading of the
 * review snippet guidelines and the markup it authorised has been removed.
 *
 * Worth knowing what this node does and does not buy, so nobody expands it
 * expecting search-result decoration it cannot produce: the only rich result fed
 * by `Movie` is the movie carousel, which requires an `ItemList` + `Movie` pairing
 * (a summary page pointing at these detail pages) and is mobile-only. This site's
 * `ItemList` is the chart on the landing page, whose `ListItem`s carry `name` and
 * `url` only, so no carousel is claimed. This node's value is entity
 * understanding — knowledge panels, answer engines, disambiguating one remake from
 * another — not SERP appearance.
 */
export function buildTitleStructuredData({
  locale,
  record,
  title,
  poster,
  kind,
}: {
  locale: Locale
  record: TitleRecord
  title: string
  poster: string
  /** From the chart entry, which already decides which rail the title sits in. */
  kind: 'movie' | 'series'
}) {
  const url = `${SITE.url}/${locale}/titles/${record.slug}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        /* `Movie` or `TVSeries` from the chart entry's `kind` rather than from
           `record.runtime` being present — deriving it from the runtime would make
           a second, weaker source of truth for the same fact. */
        '@type': kind === 'series' ? 'TVSeries' : 'Movie',
        '@id': url,
        url,
        name: title,
        /* Must match `inLanguage` on the line below it. While `synopsis` was a
           single English string this node declared `inLanguage: 'th'` around a
           description written in English — the node contradicting its own metadata,
           which is worse than omitting the language. */
        description: record.synopsis[locale],
        image: `${SITE.url}${poster}`,
        inLanguage: localeMeta[locale].hreflang,
        genre: record.genres,
        /* `dateCreated`, which is the property Google's Movie documentation names
           for the release date. `datePublished` was here before and is the wrong
           one for this type — it is what `Article` uses for its publication date,
           so on a `Movie` it states something adjacent to, but not, "this is when
           the film came out". */
        dateCreated: record.released,
        /* The bare rating code, NOT the code plus the descriptor the visible row
           shows: `contentRating` is a coded value crawlers match against a known
           set ("PG-13", "TV-MA"), and appending prose makes it match nothing.
           Omitted, not empty, where the title has no rating yet. */
        ...(record.contentRating ? { contentRating: record.contentRating.value } : {}),
        /* ISO 8601 duration, films only — a series has no single runtime, which is
           why the field is optional on the record. */
        ...(record.runtime ? { duration: `PT${record.runtime}M` } : {}),
        /* `numberOfSeasons` / `numberOfEpisodes` are the schema.org properties for
           a `TVSeries`; there is no equivalent on `Movie`, which is why these ride
           along with the same optional fields the visible page uses. */
        ...(record.seasons ? { numberOfSeasons: record.seasons } : {}),
        ...(record.episodes ? { numberOfEpisodes: record.episodes } : {}),
        /* `director` for a film, `creator` for a series — the two distinct
           schema.org properties, not one relabelled. Emitting `director` for a
           showrunner would assert something the credits do not support. */
        ...(record.directors
          ? { director: record.directors.map((name) => ({ '@type': 'Person', name })) }
          : {}),
        ...(record.creators
          ? { creator: record.creators.map((name) => ({ '@type': 'Person', name })) }
          : {}),
        ...(record.writers
          ? { author: record.writers.map((name) => ({ '@type': 'Person', name })) }
          : {}),
        /* Conditional for the same reason as the three credits above: a
           documentary has no `actor`, and an empty array would assert an empty
           cast rather than an absent one. */
        ...(record.cast
          ? { actor: record.cast.map((name) => ({ '@type': 'Person', name })) }
          : {}),
        productionCompany: record.productionCompanies.map((name) => ({
          '@type': 'Organization',
          name,
        })),
        /* NO `aggregateRating`. The scores this site has are Rotten Tomatoes' and
           Metacritic's, and the review snippet guidelines say plainly: "Don't
           aggregate reviews or ratings from other websites." That is not a
           formatting rule with an attribution escape hatch — the objection is to
           republishing someone else's score as this page's rating data at all.
           Emitting it with `author: Rotten Tomatoes` did not cure the violation, it
           documented it, and `author` is not even a property Google reads on
           `AggregateRating` (only `itemReviewed`, `ratingValue`, `ratingCount`,
           `reviewCount`, `bestRating`, `worstRating`), so it could never have done
           the job the old comment expected of it.

           The exposure was worse than losing a star rating: invalid rating markup
           is in scope for a structured-data manual action, and that gets the WHOLE
           graph on the page ignored — including the `Movie` and `BreadcrumbList`
           nodes that are legitimate.

           The visible scores in the page's critics row STAY. Quoting an aggregator
           in body copy, attributed, is normal citation and is not what this rule
           restricts; the restriction is specifically on feeding it to Google as
           structured rating data. A first-party `aggregateRating` would be fine
           here — this site simply does not collect ratings, so it has none. */
      },
      /* Market page -> this title. Two levels because that is the real depth —
         there is no intermediate index URL to name, and inventing one would put a
         404 in the trail. Last crumb carries no `item`, same as the legal pages.

         Emitted with NO visible trail on the page, also same as the legal pages:
         the two-level version told a reader nothing the top bar's home link does
         not, but a crawler still needs the parent relationship stated somewhere. */
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE.name,
            item: `${SITE.url}/${locale}`,
          },
          { '@type': 'ListItem', position: 2, name: title },
        ],
      },
    ],
  }
}

/**
 * JSON-LD for a legal document: where it sits, and who it binds.
 *
 * These nine URLs were the only pages on the site emitting NO structured data at
 * all, so a crawler saw `/en/dmca` as a flat document with no relationship to the
 * market page above it or the company that wrote it.
 *
 * Deliberately two nodes, not the eight the landing page emits. There is no
 * `SoftwareApplication` and no `AggregateOffer` here: this page sells nothing, and
 * attaching the app's price to a privacy policy is the kind of graph that
 * describes the site instead of the page — the same mistake as the `Movie` node
 * removed from `buildStructuredData`.
 */
export function buildLegalStructuredData({
  locale,
  dict,
  doc,
  lastUpdated,
}: {
  locale: Locale
  dict: Dictionary
  doc: LegalSlug
  /**
   * ISO date the copy last changed. Passed in rather than read from the dictionary
   * because it is not copy — it lives as one constant in `LegalPage`, beside the
   * "Last updated" line it also renders, so the visible date and `dateModified`
   * are the same value by construction.
   */
  lastUpdated: string
}) {
  const copy = dict.legal[doc]
  const url = `${SITE.url}/${locale}/${doc}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      /* The trail: market page -> this document.
         
         Two levels because that is the real depth — these documents hang directly
         off the market page, and there is no intermediate "legal" index to name.
         Inventing one would put a URL in the trail that 404s.
         
         The last item carries a `name` and NO `item`, which is the documented
         pattern for the page you are already on: a self-referential URL in the
         final position is redundant, and Google treats the trailing `item` as
         optional precisely for this case.
         
         Note there is no VISIBLE breadcrumb trail on these pages — the way back up
         is the top bar's home link and the "back to home" line at the end of the
         article, which is the same one-level-up relationship this markup states.
         Worth knowing if a visible trail is ever added: it has to agree with this,
         and this is the side that is already correct. */
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            /* The bare brand, which is the conventional root crumb and needs no
               translation.
               
               NOT `dict.nav.home` or `dict.legal.backToHome`, the two strings that
               label the actual links up to this page: both are written as link
               names and embed the brand already ("Zenorix home", "Back to
               Zenorix"), so either would render as "Zenorix home > Privacy
               Policy". A crumb is a place, not an instruction to go there. */
            name: SITE.name,
            item: `${SITE.url}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            /* The bare document title, NOT the brand-suffixed `<title>` that
               `buildLegalMetadata` builds. A crumb is a position in a hierarchy,
               so "Privacy Policy — Zenorix" would read as the site's name nested
               inside its own trail. */
            name: copy.title,
          },
        ],
      },
      /* The document as a page, tied to the company that is bound by it.
         
         This is the node that makes the visible `<address>` block at the foot of
         the article machine-readable: the page names Zenorix TV Limited, its BVI
         registration number and a notices address, and `publisher` is what states
         that the policy is a commitment BY that entity rather than prose that
         happens to mention it.
         
         `@id` is the same origin-level fragment the landing page's Organization
         node declares, so all twelve pages point at one company. It is a reference
         only — the full Organization is defined once, on the market page, and
         restating its fields here would be a second copy to keep in sync. */
      {
        '@type': 'WebPage',
        url,
        name: copy.title,
        description: copy.description,
        inLanguage: localeMeta[locale].hreflang,
        publisher: { '@id': `${SITE.url}/#organization` },
        dateModified: lastUpdated,
      },
    ],
  }
}

/**
 * JSON-LD for the two things this page actually is: an installable Android app,
 * and an FAQ. Emitted as one graph so crawlers get both.
 *
 * There is deliberately NO `Movie` node. One used to be emitted for a featured
 * film, which told crawlers this URL was a page about that film — a claim the
 * page never backed up, since it shows a chart of thirty titles and an install
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
   *
   * Each entry carries the `href` of its detail page, or `undefined` for a title
   * that has none — which is not a detail but the whole point. The rail renders an
   * `<a>` for a title with a researched record and a dialog `<button>` for one
   * without, so passing the href through is what lets the markup below make the
   * same distinction the DOM makes instead of asserting a uniformity that is false.
   */
  charts: { name: string; titles: { name: string; href?: string }[] }[]
}) {
  const url = `${SITE.url}${path(locale)}`
  const organizationId = `${SITE.url}/#organization`
  /* The SAME token map the visible page fills its copy with — `marketValues` is
     the single source, so any dictionary string rendered into this graph resolves
     exactly as it does on screen. This is what the FAQ node below was missing. */
  const values = marketValues(dict)

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
         
         `sameAs` is now populated, via `identityProfiles()`. It had been left empty
         because every "Zenorix" profile then in the search results belonged to
         somebody else, and pointing Google at one of those would have asserted
         someone else's identity as this company's.
         
         It carries only the brand's own X account. NOT the X community, which is a
         group the company hosts rather than a statement of who the company is, and
         NOT the support Telegram, which is a personal handle. See `SOCIAL` in
         lib/config/site.ts — the allow-list lives there precisely so this stays a
         list of identity profiles. */
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SITE.name,
        /* The registered entity, machine-readable.
           
           This is the strongest single fix available for the disambiguation
           problem described above: "Zenorix" as a bare string collides with six
           other organizations, but `Zenorix TV Limited` incorporated in the BVI
           under a stated registration number is a unique, checkable claim that no
           other holder of the name can match.
           
           It also matters for the SafeSearch flag. Anonymity is one of the signals
           weighed against a cheap streaming site, and every field below is one a
           reviewer can independently verify against a public register — which is
           precisely what makes them worth emitting rather than decorative. */
        legalName: ORG.legalName,
        /* The verifiable cross-reference: a crawler can fetch this profile, see the
           same name, mark and domain, and tie the two together. Combined with
           `legalName` and `identifier` below, this is what separates this Zenorix
           from the six unrelated ones. */
        sameAs: identityProfiles(),
        identifier: {
          '@type': 'PropertyValue',
          name: 'BVI Business Company number',
          value: ORG.registrationNumber,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: ORG.address.street,
          addressLocality: ORG.address.locality,
          addressRegion: ORG.address.region,
          postalCode: ORG.address.postalCode,
          /* ISO 3166-1 alpha-2. schema.org accepts a country name here, but the
             code is unambiguous and is what consumers normalize to anyway. */
          addressCountry: ORG.address.countryCode,
        },
        /* The company address, matching what the legal pages display. A
           `ContactPoint` rather than a bare `email` because the type states what
           the address is FOR — a rights holder or regulator looking for the
           notice channel, not general enquiries, which go to Telegram. */
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'legal',
          email: ORG.email,
          /* All three markets are served by this one address. */
          availableLanguage: ['en', 'pt-BR', 'th'],
        },
        url: SITE.url,
        /* A DEDICATED square PNG, not either of the assets the UI renders.
           `scripts/build-brand-assets.mjs` generates it solely for this field and
           explains the three reasons it differs (square, on the black plate, PNG).

           It points here rather than at `zenorix-mark.webp` because that file is
           sized for its only on-screen job — it never paints wider than ~34 CSS px,
           so it is 128x98, and 98 is UNDER Google's stated 112px minimum. The UI
           asset and this field have genuinely different requirements; sharing one
           file means the stricter of the two loses silently.

           Two failure modes worth naming, because both are invisible:
             - An undersized logo is not an error. The file loads, nothing warns,
               the field is simply ignored.
             - These `width`/`height` are an ASSERTION ABOUT THE FILE. They read
               256x196 for a while after the mark was optimised down to 128x98 —
               correct for a file that no longer existed. The aspect ratio happened
               to stay 4:3, so it survived every visual check.
           If the generated size changes, change SCHEMA_LOGO and these together. */
        logo: {
          '@type': 'ImageObject',
          url: `${SITE.url}/brand/zenorix-logo-square.png`,
          width: 256,
          height: 256,
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
              /* The trial's own note ("No card needed to start."), which is the line
                 the page prints directly under "30 DAYS FREE".
                 
                 This was `dict.faq.items[0].q` — the FAQ's first QUESTION. So the
                 free tier described itself to crawlers as "Do I get full access to
                 everything during the 30 free days?", a question mark and all, in
                 all three markets. A `description` is a statement about the offer;
                 pointing it at the question rather than at its answer inverted the
                 meaning of the field. */
              description: dict.about.trial.note,
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
      /* THE FAQ, WITH ITS TOKENS RESOLVED.
         
         `fill(..., values)` on BOTH the question and the answer, and that is the
         whole point of this node's shape. It used to pass `item.q` / `item.a`
         straight through, which shipped the raw dictionary strings — so the pricing
         answer reached Google as "The monthly plan is {monthly} after your free
         trial" while the visible <details> on the same page said "$2". Verified in
         all three markets before the fix: en had `{monthly}`, pt-BR had `{monthly}`,
         th had `{monthly}` and `{annualPerMonth}`.
         
         That is the one structured-data failure mode with real downside. Google's
         guidelines require the markup to match the visible content, and a literal
         `{monthly}` is not a price at all — it is either ignored, or read as the
         page making an unresolvable claim about cost. Either way the FAQ rich result
         was carrying a broken string in the one answer that states what the product
         costs.
         
         It survived because it is invisible twice over: the page renders correctly
         (the visible FAQ has always filled its tokens), and JSON-LD is not something
         you see. Only diffing the graph against the DOM surfaced it. */
      {
        '@type': 'FAQPage',
        mainEntity: dict.faq.items.map((item) => ({
          '@type': 'Question',
          name: fill(item.q, values),
          acceptedAnswer: { '@type': 'Answer', text: fill(item.a, values) },
        })),
      },
      /* The two chart rails, as ranked lists of names.
         
         This is the honest way to get the film titles into structured data, and it
         is specifically NOT the `Movie` node this file removed: an `ItemList` says
         "this page ranks these thirty titles", which is exactly what the rails do,
         while a top-level `Movie` said "this URL is about one film", which was never
         true. So an answer engine asked what is trending on Zenorix can name them,
         and none of them is presented as this page's subject.
         
         `ListItem` carries no nested `Movie`/`TVSeries`: the rail shows a poster and
         a rank and nothing else — no synopsis, no cast, no year — so a `Movie` node
         here would be a promise of detail THIS document does not contain. That
         reasoning is unchanged.

         `url` IS now emitted, per item, and this is a correction rather than an
         addition. The rule it follows is that a `ListItem` should point at the thing
         it names if such a page exists; when this markup was written none did,
         because the only per-film route was a doorway page that had been deleted.
         Twenty-nine researched detail pages exist now, the rail links to them, and
         the markup kept saying otherwise — a comment describing a fact that had
         expired, which is worse than no comment because it reads as a decision.

         It is conditional because the situation is genuinely mixed: a title without
         a researched record has no page and renders as a dialog button, so it gets
         a bare `name`, exactly as before. Emitting a URL for all thirty would be
         the same class of error in the other direction — pointing a crawler at
         routes that 404.

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
          name: title.name,
          ...(title.href ? { url: `${SITE.url}${title.href}` } : {}),
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
