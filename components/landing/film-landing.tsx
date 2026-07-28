import { AboutZenorix } from '@/components/landing/about-zenorix'
import { ConversionDialogs } from '@/components/landing/conversion-dialogs'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { FaqSection } from '@/components/landing/faq-section'
import { FilmInfo } from '@/components/landing/film-info'
import { FinalCta } from '@/components/landing/final-cta'
import { ImmersivePlayer } from '@/components/landing/immersive-player'
import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { TopChart } from '@/components/landing/top-chart'
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
 * what Zenorix is -> objections -> close, all wired to one download handler.
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
  const copy = movie.copy[locale]
  const values = { ...marketValues(dict), title: copy.title, year: movie.releaseYear }

  const localeHrefs = {
    en: path('en'),
    'pt-br': path('pt-br'),
    th: path('th'),
  } as const

  const runtimeSeconds = movie.runtimeMinutes * 60

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
            installLabel={dict.nav.install}
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
            }}
          />
        </section>

        <main>
          <FilmInfo
            title={copy.title}
            releaseYear={movie.releaseYear}
            runtimeMinutes={movie.runtimeMinutes}
            qualityTags={movie.qualityTags}
            synopsis={copy.synopsis}
            genres={copy.genres}
            cta={dict.info.cta}
            ctaSub={fill(dict.info.ctaSub, values)}
            expandLabel={dict.info.synopsisExpand}
            collapseLabel={dict.info.synopsisCollapse}
          />

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
              value: fill(dict.about.price.value, values),
            }}
            viewing={dict.about.viewing}
            trial={dict.about.trial}
          />

          <FaqSection
            heading={dict.faq.heading}
            items={dict.faq.items.map((item) => ({
              q: fill(item.q, values),
              a: fill(item.a, values),
            }))}
          />

          <FinalCta
            heading={fill(dict.finalCta.heading, values)}
            cta={dict.finalCta.cta}
            meta={fill(dict.finalCta.meta, values)}
          />
        </main>

        <SiteFooter
          locale={locale}
          localeHrefs={localeHrefs}
          links={[
            { label: dict.footer.privacy, href: `/${locale}#privacy` },
            { label: dict.footer.terms, href: `/${locale}#terms` },
            { label: dict.footer.dmca, href: `/${locale}#dmca` },
          ]}
          copyright={fill(dict.footer.copyright, { year: 2026 })}
          languageLabel={dict.footer.language}
          languageMenuLabel={dict.nav.languageMenu}
          themeLabel={dict.a11y.theme}
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
