import { AboutZenorix } from '@/components/landing/about-zenorix'
import { ConversionDialogs } from '@/components/landing/conversion-dialogs'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { FaqSection } from '@/components/landing/faq-section'
import { FinalCta } from '@/components/landing/final-cta'
import { HeroBillboard } from '@/components/landing/hero-billboard'
import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { TopChart } from '@/components/landing/top-chart'
import { SITE } from '@/lib/config/site'
import { getChart, type Movie } from '@/lib/content/movies'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import { locales, type Locale } from '@/lib/i18n/config'
import { buildStructuredData, marketValues } from '@/lib/seo'

/**
 * The landing page itself, shared by the market home route and the localized
 * /movie/[slug] routes.
 *
 * Section order is the funnel: brand billboard -> what people are watching ->
 * what Zenorix is -> objections -> close, all wired to one download handler.
 *
 * `movie` no longer drives anything VISIBLE. The hero used to open with that
 * film's preview player and an info block; the page now opens on the brand and
 * the catalogue, so the film survives only in the head — its title in the
 * metadata and its `Movie` node in the JSON-LD graph — which is what keeps each
 * /movie/[slug] route a distinct, indexable entry point.
 *
 * The layout is mobile-only by design: `.zx-page` caps itself at a phone width
 * and centers, so the page never stretches into a desktop composition.
 */
export function FilmLanding({
  movie,
  locale,
  dict,
  path,
}: {
  movie: Movie
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

  const structuredData = buildStructuredData({ movie, locale, dict, path })

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

        <main id="zx-main">
          <TopChart
            entries={getChart(locale)}
            heading={fill(dict.chart.heading, values)}
            rankLabel={dict.chart.rank}
            moreLabel={dict.chart.more}
            moreHint={dict.chart.moreHint}
          />

          {/* Sits after the Top 10: the platform wall and the price both land
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
        />

        <ConversionDialogs
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
