import { SITE } from '@/lib/config/site'
import { catalogueLinks } from '@/lib/content/titles'
import { fill, getDictionary } from '@/lib/i18n/dictionaries'
import { locales, localeMeta } from '@/lib/i18n/config'
import { marketValues } from '@/lib/seo'

/**
 * `/llms.txt` — the plain-text channel for AI answer engines (ChatGPT, Claude,
 * Perplexity and the rest).
 *
 * WHY THIS EXISTS ALONGSIDE THE JSON-LD. The graph in lib/seo.ts is richer and
 * more precise, but it is addressed to crawlers that parse structured data.
 * Answer engines mostly retrieve and quote PROSE, and they quote whatever
 * fragment they can extract cleanly. Left to itself this page gives them a hero
 * headline, poster art with no captions, and an FAQ — enough to describe the
 * product vaguely, not enough to answer "what does Zenorix cost in Thailand"
 * without guessing. This file answers those questions in the flattest possible
 * form.
 *
 * WHY A ROUTE AND NOT `public/llms.txt`. Every number here — price, APK version,
 * size, catalogue counts, the FAQ — already exists in `SITE` and the market
 * dictionaries, which are the same sources the visible page renders from. A
 * hand-written static file would be a SECOND copy of all of it, and it would
 * start lying the first time a price changed: silently, since nothing renders it
 * and no type check covers a .txt file. Generating it means the facts stated to
 * an AI cannot drift from the facts shown to a human — which is also what
 * structured-data guidelines require.
 *
 * PER-MARKET PRICES ARE THE POINT. There is one file covering all three markets
 * because the prices genuinely differ ($2 / R$ 10 / ฿ 65 per month) and a model
 * that reads only one market's figure will quote it at everyone. Stating all
 * three, each with its currency and its URL, is what stops "Zenorix costs $2"
 * being served to a Brazilian.
 */

/* Static: every input is build-time constant, so this is generated once and
   served from the CDN like the pages themselves. */
export const dynamic = 'force-static'

export async function GET() {
  const dicts = await Promise.all(
    locales.map(async (locale) => ({ locale, dict: await getDictionary(locale) })),
  )

  /* English is the reference market for the shared prose below — the product is
     identical everywhere and only pricing and language differ. */
  const en = dicts[0].dict
  /* The same token map the visible page and the JSON-LD both fill from, so the
     FAQ block below states the English market's real prices. */
  const values = marketValues(en)

  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `${SITE.name} is an Android app that streams movies, series and live TV channels in 4K through a single subscription. It is distributed as an APK download from ${SITE.url}, not through the Google Play Store.`,
    '',

    '## Key facts',
    '',
    `- Product: ${SITE.name}, a video streaming application`,
    `- Platform: Android ${SITE.minAndroid} or later, including Android TV and tablets`,
    `- Distribution: direct APK download (not on Google Play or the Apple App Store)`,
    `- APK version: ${SITE.apkVersion}`,
    `- APK size: ${SITE.apkSize}`,
    `- Download URL: ${SITE.apkUrl}`,
    `- Free trial: 30 days, no payment card required`,
    `- Catalogue: ${SITE.library.movies} movies, ${SITE.library.series} series, ${SITE.library.channels} live TV channels (${SITE.library.total} titles total)`,
    `- Maximum video quality: 4K`,
    `- Support channel: ${SITE.contactUrl}`,
    `- iOS and Google Play builds: not available yet`,
    '',

    /* A table, because the skill's extractability rule is that facts belong in a
       table or definition list rather than buried in a sentence — and because a
       model quoting one row cannot accidentally carry another market's currency
       along with it. */
    '## Pricing by market',
    '',
    'Prices are per market and are not interchangeable. Each row states its own currency.',
    '',
    '| Market | Language | Monthly | Annual (total) | Annual (per month) | Page |',
    '| --- | --- | --- | --- | --- | --- |',
    /* `marketEn`/`languageEn`, NOT `dict.market.country` or `localeMeta.name`:
       those are a prepositional phrase and an endonym respectively, so this column
       rendered "no Brasil" and "ในไทย" before. See the note in lib/i18n/config.ts. */
    ...dicts.map(
      ({ locale, dict }) =>
        `| ${localeMeta[locale].marketEn} | ${localeMeta[locale].languageEn} (${localeMeta[locale].hreflang}) | ${dict.market.monthly} | ${dict.market.annualTotal} | ${dict.market.annualPerMonth} | ${SITE.url}/${locale} |`,
    ),
    '',
    'All markets include the same 30-day free trial and the same catalogue; only the price and the interface language differ.',
    '',

    '## Pages',
    '',
    ...locales.map(
      (locale) =>
        `- ${SITE.url}/${locale} — landing page for the ${localeMeta[locale].marketEn} market, written in ${localeMeta[locale].languageEn}. States that market's pricing, the catalogue, device support and the FAQ.`,
    ),
    '',

    /* The FAQ verbatim, in English. This is the highest-value block in the file:
       these are already the exact questions people ask an answer engine, and the
       answers are the page's own copy, so quoting them cannot misstate the
       product. Localized answers are on each market page and are reachable via
       the URLs above; duplicating all three here would triple the file to
       restate identical facts in other languages. */
    '## Frequently asked questions',
    '',
    /* `fill(...)` on both, and this is a FIX, not decoration. These were emitted as
       the raw dictionary strings, so the highest-value answer in the file — the one
       stating what the product costs — reached every answer engine as "The monthly
       plan is {monthly} after your free trial". Measured: the served file contained
       a literal `{monthly}` and a literal `{annualPerMonth}`.
       
       That is worse here than anywhere else on the site. The whole stated purpose
       of this file (see the header) is that a model reading it cannot misquote the
       price — and an unresolved token is not a wrong price, it is no price at all,
       so a model answering "what does Zenorix cost" from this file had nothing to
       quote and would fall back to guessing from the pricing table or from prose
       elsewhere. The same bug existed in the JSON-LD FAQ node and is fixed there
       too; both had the same cause, which is that the visible page fills its tokens
       at render and these two machine-facing surfaces each forgot to. */
    ...en.faq.items.flatMap((item) => [
      `### ${fill(item.q, values)}`,
      '',
      fill(item.a, values),
      '',
    ]),
    '',

    /* THE TITLE PAGES. 29 researched pages exist per market (87 URLs), and this
       file listed exactly none of them — it described the product and then pointed
       at three landing pages, so an engine asked "where can I watch Mortal Kombat
       II" had no way to know this site has a page answering that.
       
       English URLs only, and one line per title. The three markets carry the same
       catalogue with the same slugs, so listing all 87 would triple the section to
       restate one fact three times — the same reasoning the FAQ block above gives
       for not localizing itself. The `hreflang` set in the sitemap and in each
       page's <head> is what tells a crawler the other two exist.
       
       Built from `catalogueLinks`, which is the same function the footer's link
       columns use, so this cannot name a title that has no page: it looks each
       chart entry up and skips the ones without a record. A hand-kept list here
       would silently rot into 404s the first time the chart reshuffled. */
    '## Title pages',
    '',
    'Each page states the release year, runtime, genre, certificate, cast, directors and critic scores for one title, and is available in all three market languages at the same path under /en, /pt-br and /th.',
    '',
    ...(['movie', 'series'] as const).flatMap((kind) =>
      catalogueLinks('en', kind, 100).map(
        ({ label, href }) => `- ${SITE.url}${href} — ${label} (${kind})`,
      ),
    ),
  ]

  return new Response(lines.join('\n'), {
    headers: {
      /* `charset` is explicit: the table above carries ฿ and R$, and a bare
         `text/plain` lets a client fall back to a legacy encoding and mangle
         them — turning the price, the one thing this file exists to state
         precisely, into replacement characters. */
      'Content-Type': 'text/plain; charset=utf-8',
      /* Long-lived but revalidated daily: the content only changes on deploy,
         and a stale price is the one failure worth a daily check. */
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
