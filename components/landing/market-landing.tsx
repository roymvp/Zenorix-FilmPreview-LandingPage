import { AboutZenorix } from '@/components/landing/about-zenorix'
import { ConversionDialog } from '@/components/landing/conversion-dialog'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCta } from '@/components/landing/final-cta'
import { HeroBillboard } from '@/components/landing/hero-billboard'
import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { TopChart } from '@/components/landing/top-chart'
import { SITE } from '@/lib/config/site'
import { getMovieChart, getSeriesChart } from '@/lib/content/charts'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import { locales, type Locale } from '@/lib/i18n/config'
import { buildStructuredData, marketValues } from '@/lib/seo'

/**
 * The landing page — the only page, rendered once per market.
 *
 * Section order is the funnel: brand billboard -> what people are watching ->
 * what Zenorix is -> objections -> close, all wired to one download handler.
 *
 * No film is passed in. This component used to take a `movie` that drove nothing
 * visible and existed only to vary the <title> across a set of /movie/[slug]
 * URLs; that route was a doorway page and is gone. The page leads with the brand
 * and the catalogue, and the head now describes exactly that.
 *
 * One DOM for every width. `.zx-page` widens its column in tiers (420 -> 680 ->
 * 1200px) and the sections rearrange in CSS, so no component branches on
 * viewport and nothing is rendered twice to be hidden at one size.
 */
export function MarketLanding({
  locale,
  dict,
  path,
}: {
  locale: Locale
  dict: Dictionary
  /** Resolves this same page's URL in any market, for hreflang + the selector. */
  path: (locale: Locale) => string
}) {
  const values = marketValues(dict)

  const localeHrefs = {
    en: path('en'),
    'pt-br': path('pt-br'),
    th: path('th'),
  } as const

  /* Resolved ONCE and shared between the rails below and the JSON-LD, so the
     `ItemList` in the head is literally the array the rails render rather than a
     second call that could be reordered independently. */
  const movies = getMovieChart(locale)
  const series = getSeriesChart(locale)

  const structuredData = buildStructuredData({
    locale,
    dict,
    path,
    charts: [
      { name: dict.chart.headingMovies, titles: movies.map((e) => e.title) },
      { name: dict.chart.headingSeries, titles: series.map((e) => e.title) },
    ],
  })

  return (
    <ConversionProvider>
      <script
        type="application/ld+json"
        // Emitted server-side; the object is built from typed content, not input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Prerenders the OTHER two markets of this same page. The language switcher
          is the only in-page navigation that leaves the document, and switching
          market is a deliberate act — so by the time a pointer reaches the control,
          the destination can already be fully rendered.

          `eagerness: "moderate"` is the hover/pointerdown trigger rather than
          `"eager"`: prerendering all locales on load would run two extra full page
          renders for every visitor, when most never switch. It is scoped to an
          explicit `urls` list, NOT a `where` selector, so it can never speculate
          the APK download link or an external href.

          Emitted as a plain script tag because speculation rules must be in the raw
          HTML payload to be parsed — a browser that does not support them ignores
          the type and the switcher just navigates normally. */}
      <script
        type="speculationrules"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            prerender: [
              {
                source: 'list',
                urls: locales
                  .filter((other) => other !== locale)
                  .map((other) => path(other)),
                eagerness: 'moderate',
              },
            ],
          }),
        }}
      />

      <a className="zx-visually-hidden" href="#zx-main">
        {dict.a11y.skipToContent}
      </a>

      <div className="zx-page">
        {/* The hero is a <section> outside <main> and holds the top bar, because
            the bar is layered over the poster wall rather than sitting above it. */}
        <section className="zx-hero" aria-labelledby="zx-hero-headline">
          <TopBar
            locale={locale}
            homeHref={`/${locale}`}
            homeLabel={dict.nav.home}
            languageMenuLabel={dict.nav.languageMenu}
            localeHrefs={localeHrefs}
            contact={{ aria: dict.contact.aria }}
          />

          <HeroBillboard
            headline={dict.hero.headline}
            price={fill(dict.hero.price, values)}
            priceNote={dict.hero.priceNote}
            cta={dict.hero.cta}
            ctaMeta={fill(dict.hero.ctaMeta, values)}
            stores={dict.hero.stores}
          />
        </section>

        {/* `tabIndex={-1}` is what makes the skip link above actually work, and it
            is not decorative. <main> is not natively focusable, so activating
            `#zx-main` only SCROLLED the page while keyboard focus stayed on the
            body — measured in-browser: `document.activeElement` was still BODY
            after following the link. The next Tab therefore walked back into the
            top bar, meaning the skip link moved the viewport but skipped nothing,
            for exactly the keyboard and screen-reader users it exists to serve.

            -1 keeps it out of the tab order (it must not become a stop of its own)
            while still accepting fragment and programmatic focus. */}
        <main id="zx-main" tabIndex={-1}>
          {/* Films first, then shows: the film rail leads with the biggest
              theatrical titles, which is the strongest hook this page has.

              Only the SHOWS rail carries the tail CTA. Both rails sell the same
              install, so a button under each was one offer made twice — and the
              first one broke the browse before the second rail had argued for it.
              Headings take no `fill`: they hold no placeholders now. */}
          <TopChart
            id="movies"
            entries={movies}
            heading={dict.chart.headingMovies}
            rankLabel={dict.chart.rank}
            posterAlt={dict.a11y.posterAlt}
          />

          <TopChart
            id="series"
            entries={series}
            heading={dict.chart.headingSeries}
            rankLabel={dict.chart.rank}
            posterAlt={dict.a11y.posterAlt}
            more={{ label: dict.chart.more, hint: dict.chart.moreHint }}
          />

          {/* Sits after the charts: the platform wall and the price both land
              harder once the catalogue has been shown than they would next to a
              single film. */}
          <AboutZenorix
            heading={dict.about.heading}
            apps={dict.about.apps}
            price={{
              label: dict.about.price.label,
              ourLabel: dict.about.price.ourLabel,
              value: fill(dict.about.price.value, values),
              rivalLabel: dict.about.price.rivalLabel,
              rivalValue: dict.about.price.rivalValue,
              vs: dict.about.price.vs,
              perMonth: dict.about.price.perMonth,
              // Bar widths come from the numeric market values, not from the
              // formatted strings, so currency symbols and separators (R$, บาท,
              // "~ ") never have to be parsed back out.
              ourAmount: dict.market.annualPerMonthValue,
              rivalAmount: dict.about.price.rivalAmount,
            }}
            viewing={dict.about.viewing}
            trial={dict.about.trial}
            cta={dict.about.cta}
            ctaMeta={fill(dict.about.ctaMeta, values)}
            contact={dict.contact}
          />

          <FaqSection
            heading={dict.faq.heading}
            items={dict.faq.items.map((item) => ({
              q: fill(item.q, values),
              a: fill(item.a, values),
            }))}
          />

          <FinalCta
            srHeading={dict.finalCta.srHeading}
            cta={dict.finalCta.cta}
            meta={fill(dict.finalCta.meta, values)}
          />
        </main>

        <SiteFooter
          links={[
            { label: dict.footer.privacy, href: `/${locale}#privacy` },
            { label: dict.footer.terms, href: `/${locale}#terms` },
            { label: dict.footer.dmca, href: `/${locale}#dmca` },
          ]}
          copyright={fill(dict.footer.copyright, { year: 2026 })}
          contact={{ label: dict.contact.label, aria: dict.contact.aria }}
        />

        <ConversionDialog
          copy={{
            heading: dict.modals.content.heading,
            body: dict.modals.content.body,
            bullets: dict.modals.content.bullets.map((b) => fill(b, values)),
            cta: dict.modals.content.cta,
            ctaMeta: fill(dict.modals.content.ctaMeta, values),
          }}
        />
      </div>

      <span className="zx-visually-hidden">
        {SITE.name} {SITE.apkVersion}
      </span>
    </ConversionProvider>
  )
}
