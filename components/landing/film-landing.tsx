import { ConversionDialogs } from '@/components/landing/conversion-dialogs'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { FaqSection } from '@/components/landing/faq-section'
import { FilmInfo } from '@/components/landing/film-info'
import { FinalCta } from '@/components/landing/final-cta'
import { ImmersivePlayer } from '@/components/landing/immersive-player'
import { PriceCompare, type CompareRow } from '@/components/landing/price-compare'
import { SiteFooter } from '@/components/landing/site-footer'
import { StickyDownloadBar } from '@/components/landing/sticky-download-bar'
import { TopBar } from '@/components/landing/top-bar'
import { TopChart } from '@/components/landing/top-chart'
import { ValueProps } from '@/components/landing/value-props'
import { SITE } from '@/lib/config/site'
import { getChart, type Movie } from '@/lib/content/movies'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { buildStructuredData, marketValues } from '@/lib/seo'

/**
 * The landing page itself, shared by the market home route and the localized
 * /movie/[slug] routes.
 *
 * Section order is the funnel: cinematic hook -> what it is -> social proof ->
 * why switch -> price proof -> objections -> close. A download CTA appears in
 * six of those seven zones, all wired to one handler.
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
  const copy = movie.copy[locale]
  const values = { ...marketValues(dict), title: copy.title, year: movie.releaseYear }

  const localeHrefs = {
    en: path('en'),
    'pt-br': path('pt-br'),
    th: path('th'),
  } as const

  const runtimeSeconds = movie.runtimeMinutes * 60
  const previewMinutes = Math.round(movie.previewLimitSeconds / 60)

  const compareRows: CompareRow[] = dict.compare.rows.map((row) => ({
    service: row.service,
    price: fill(row.price, values),
    titles: row.titles,
    liveTv: row.liveTv,
    quality: row.quality,
    highlight: 'highlight' in row ? Boolean(row.highlight) : false,
  }))

  const structuredData = buildStructuredData({ movie, locale, dict, path })

  return (
    <ConversionProvider>
      <script
        type="application/ld+json"
        // Emitted server-side; the object is built from typed content, not input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <a className="zx-visually-hidden" href="#zx-details">
        {dict.a11y.skipToContent}
      </a>

      <div className="zx-page">
        <section className="zx-hero">
          <TopBar
            locale={locale}
            homeHref={`/${locale}`}
            homeLabel={dict.nav.home}
            languageLabel={dict.nav.language}
            languageMenuLabel={dict.nav.languageMenu}
            localeHrefs={localeHrefs}
          />

          <ImmersivePlayer
            src={movie.videoSrc}
            type={movie.videoType}
            poster={movie.backdrop}
            posterAlt={fill(dict.meta.imageAlt, values)}
            runtimeSeconds={runtimeSeconds}
            limitSeconds={movie.previewLimitSeconds}
            copy={{
              play: dict.player.play,
              pause: dict.player.pause,
              mute: dict.player.mute,
              unmute: dict.player.unmute,
              seek: dict.player.seek,
              tapForSound: dict.player.tapForSound,
              previewLabel: fill(dict.player.previewLabel, {
                minutes: previewMinutes,
              }),
              floatingCta: dict.player.floatingCta,
              watermark: dict.player.watermark,
              licensed: dict.info.licensed,
            }}
          >
            <h1 className="zx-hero-title">{copy.title}</h1>
            <p className="zx-hero-tagline md-typescale-body-large">
              {copy.tagline}
            </p>
            <p className="zx-hero-meta">
              <span>{movie.releaseYear}</span>
              <span className="zx-dot" aria-hidden="true" />
              <span>
                {Math.floor(movie.runtimeMinutes / 60)}h {movie.runtimeMinutes % 60}m
              </span>
              <span className="zx-dot" aria-hidden="true" />
              {movie.qualityTags.map((tag) => (
                <span key={tag} className="zx-tag">
                  {tag}
                </span>
              ))}
            </p>
          </ImmersivePlayer>

          <p className="zx-scroll-hint">
            <span>
              {dict.player.scrollHint}
              <md-icon aria-hidden="true">keyboard_double_arrow_down</md-icon>
            </span>
          </p>
        </section>

        <main>
          <FilmInfo
            heading={dict.info.heading}
            title={copy.title}
            poster={movie.poster}
            posterAlt={fill(dict.a11y.posterAlt, values)}
            synopsis={copy.synopsis}
            genres={copy.genres}
            cta={dict.info.cta}
            ctaSub={fill(dict.info.ctaSub, values)}
            stripLabel={dict.info.trustStrip}
          />

          <TopChart
            entries={getChart(locale)}
            heading={fill(dict.chart.heading, values)}
            sub={dict.chart.sub}
            rankLabel={dict.chart.rank}
            seeAllLabel={fill(dict.chart.seeAll, values)}
            kindLabels={dict.chart.kind}
          />

          <ValueProps
            heading={dict.value.heading}
            items={dict.value.items.map((item) => ({
              icon: item.icon,
              title: fill(item.title, values),
              body: fill(item.body, values),
            }))}
          />

          <PriceCompare
            heading={dict.compare.heading}
            sub={dict.compare.sub}
            labels={dict.compare.labels}
            rows={compareRows}
            totalLabel={dict.compare.totalLabel}
            totalPrice={dict.compare.totalPrice}
            footnote={fill(dict.compare.footnote, values)}
            cta={dict.info.cta}
            ctaSub={fill(dict.info.ctaSub, values)}
          />

          <FaqSection
            heading={dict.faq.heading}
            items={dict.faq.items.map((item) => ({
              q: fill(item.q, values),
              a: fill(item.a, values),
            }))}
          />

          <FinalCta
            backdrop={movie.backdrop}
            heading={fill(dict.finalCta.heading, values)}
            body={fill(dict.finalCta.body, values)}
            cta={dict.finalCta.cta}
            meta={fill(dict.finalCta.meta, values)}
            badges={dict.finalCta.badges}
          />
        </main>

        <SiteFooter
          locale={locale}
          localeHrefs={localeHrefs}
          tagline={fill(dict.footer.tagline, values)}
          links={[
            { label: dict.footer.privacy, href: `/${locale}#privacy` },
            { label: dict.footer.terms, href: `/${locale}#terms` },
            { label: dict.footer.dmca, href: `/${locale}#dmca` },
          ]}
          copyright={fill(dict.footer.copyright, { year: 2026 })}
          disclaimer={dict.footer.disclaimer}
          languageLabel={dict.footer.language}
          languageMenuLabel={dict.nav.languageMenu}
        />

        <StickyDownloadBar
          defaultLabel={dict.sticky.default}
          urgentLabel={dict.sticky.urgent}
          title={copy.title}
          meta={fill(dict.finalCta.meta, values)}
        />

        <ConversionDialogs
          backdrop={movie.backdrop}
          copy={{
            content: {
              eyebrow: dict.modals.content.eyebrow,
              heading: dict.modals.content.heading,
              body: fill(dict.modals.content.body, values),
              bullets: dict.modals.content.bullets,
              cta: dict.modals.content.cta,
              close: dict.modals.content.close,
            },
            preview: {
              heading: dict.modals.preview.heading,
              sub: fill(dict.modals.preview.sub, values),
              cta: dict.modals.preview.cta,
              secondary: dict.modals.preview.secondary,
              close: dict.modals.preview.close,
            },
          }}
        />
      </div>

      <span className="zx-visually-hidden">
        {SITE.name} {SITE.apkVersion}
      </span>
    </ConversionProvider>
  )
}
