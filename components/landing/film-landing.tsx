import { ConversionDialogs } from '@/components/landing/conversion-dialogs'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { FaqSection } from '@/components/landing/faq-section'
import { FilmInfo } from '@/components/landing/film-info'
import { FinalCta } from '@/components/landing/final-cta'
import { ImmersivePlayer } from '@/components/landing/immersive-player'
import { PlatformStrip } from '@/components/landing/platform-strip'
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
 * why switch -> objections -> close, all wired to one download handler.
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
          />

          <TopChart
            entries={getChart(locale)}
            heading={fill(dict.chart.heading, values)}
            rankLabel={dict.chart.rank}
          />

          {/* Sits after the Top 10: the licensed-source claim lands harder once
              the catalogue has been shown than it does next to a single film. */}
          <PlatformStrip label={dict.info.trustStrip} />

          <ValueProps
            heading={dict.value.heading}
            items={dict.value.items.map((item) => ({
              icon: item.icon,
              title: fill(item.title, values),
              body: fill(item.body, values),
            }))}
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
          themeLabel={dict.a11y.theme}
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
