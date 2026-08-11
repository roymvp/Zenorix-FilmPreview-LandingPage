import { ContactLink } from '@/components/landing/contact-link'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { DownloadCta } from '@/components/landing/download-cta'
import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { SITE } from '@/lib/config/site'
import type { ChartEntry } from '@/lib/content/charts'
import { legalLinks } from '@/lib/content/legal'
import { referenceLinks, watchLinks } from '@/lib/content/outbound'
import { streamingName, type TitleRecord } from '@/lib/content/titles'
import { fill, pluralize, type Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { buildTitleStructuredData } from '@/lib/seo'

/**
 * One title's detail page: poster, verified facts, one download CTA.
 *
 * THE SHAPE OF THIS PAGE IS A DIRECT RESPONSE TO WHY THE LAST ONE WAS DELETED.
 * `charts.ts` records that a `/movie/[slug]` route existed here before and was
 * removed as a doorway page — every URL rendered the landing page with a swapped
 * `<title>`. So the rule this component follows is: everything below the hero
 * must be a fact that is TRUE OF THIS TITLE ONLY. No shared marketing block, no
 * FAQ, no repeated feature grid. The only thing here that also appears on the
 * landing page is the single CTA, which is the point of the page.
 *
 * It is a server component. There is no `'use client'` and no state: the facts are
 * static and the one interactive element (`DownloadCta`) is its own client
 * component. That keeps the whole factual body in the server-rendered HTML, which
 * is the entire GEO argument — an AI crawler that does not execute JS still reads
 * every credit and score.
 */
export function TitlePage({
  locale,
  dict,
  record,
  entry,
}: {
  locale: Locale
  dict: Dictionary
  record: TitleRecord
  /** Chart entry for the poster and platform badge — `charts.ts` owns those. */
  entry: ChartEntry
}) {
  const copy = dict.title
  const path = (target: Locale) => `/${target}/titles/${record.slug}`
  const service = streamingName(record)

  /* Facts as label/value pairs, built here rather than in the markup so the empty
     ones can be dropped in one place. A row with a dash in it is worse than no
     row: it takes the same vertical space to say nothing. */
  const facts: { label: string; value: string }[] = [
    { label: copy.released, value: formatDate(record.released, locale) },
    /* A film gets a runtime; a series gets seasons and episodes. Both are driven
       off which fields the record actually has rather than off `entry.kind`, so a
       record can only ever produce rows it has data for. */
    ...(record.runtime
      ? [{ label: copy.runtime, value: fill(copy.minutes, { count: record.runtime }) }]
      : []),
    ...(record.seasons
      ? [{ label: copy.seasons, value: pluralize(record.seasons, copy.seasonCount) }]
      : []),
    ...(record.episodes
      ? [
          {
            label: copy.episodes,
            value: pluralize(record.episodes, copy.episodeCount),
          },
        ]
      : []),
    /* "Director" for a film, "Creator" for a series. The record guarantees exactly
       one of the two is set (see the assertion in `titles.ts`), so this never
       renders both and never renders neither. */
    ...(record.directors
      ? [{ label: copy.director, value: record.directors.join(', ') }]
      : []),
    ...(record.creators
      ? [{ label: copy.creator, value: record.creators.join(', ') }]
      : []),
    ...(record.writers ? [{ label: copy.writer, value: record.writers.join(', ') }] : []),
    { label: copy.genre, value: record.genres.join(', ') },
    { label: copy.studio, value: record.productionCompanies.join(', ') },
    /* A series airs on a network; a film is handled by a distributor. Same row
       position, different label, because "Distributor: HBO" misstates what HBO is
       to a show it produces and broadcasts. */
    ...(record.network
      ? [{ label: copy.network, value: record.network }]
      : [{ label: copy.distributor, value: record.distributors.join(', ') }]),
    ...(service ? [{ label: copy.streamingOn, value: service }] : []),
  ]

  const scores = [
    { name: 'Rotten Tomatoes', score: record.rottenTomatoes, suffix: '%' },
    { name: 'Metacritic', score: record.metacritic, suffix: '/100' },
  ].filter((row) => row.score)

  return (
    <>
      <script
        type="application/ld+json"
        // Server-rendered from the typed record; no user input reaches it.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildTitleStructuredData({
              locale,
              record,
              title: entry.title,
              poster: entry.poster,
              kind: entry.kind,
            }),
          ),
        }}
      />

      <a className="zx-visually-hidden" href="#zx-main">
        {dict.a11y.skipToContent}
      </a>

      {/* `DownloadCta` calls `useConversion`, so it must sit under this provider —
          without it the whole route 500s. The provider is a client component with
          no server-rendered output of its own, so everything factual below stays in
          the server-rendered HTML; only the CTA's click handler needs the context.

          The legal pages deliberately do NOT do this (see the note in
          `legal-page.tsx`) because they carry no CTA. This page does carry one. */}
      <ConversionProvider>
      <div className="zx-page zx-page--doc">
        <TopBar
          locale={locale}
          homeHref={`/${locale}`}
          homeLabel={dict.nav.home}
          languageMenuLabel={dict.nav.languageMenu}
          localeHrefs={{ en: path('en'), 'pt-br': path('pt-br'), th: path('th') }}
          contact={{ aria: dict.contact.aria }}
        />

        {/* tabIndex={-1} for the same reason as the other two page shells: <main>
            is not focusable, so the skip link would move the viewport without
            moving focus. */}
        <main id="zx-main" className="zx-title" tabIndex={-1}>
          <div className="zx-shell">
            {/* A real breadcrumb, matching the BreadcrumbList in the JSON-LD.
                Unlike the legal pages — where the markup is deliberately
                trail-less because the top bar is the only way up — this page has
                a genuine two-level parent (the market page) worth showing, and a
                visible trail that DISAGREED with the markup would be the worst of
                both. */}
            <nav className="zx-title-crumbs" aria-label={copy.breadcrumb}>
              <a href={`/${locale}`}>{dict.nav.home}</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{entry.title}</span>
            </nav>

            <article className="zx-title-body">
              <header className="zx-title-head">
                {/* The poster, at its real 2:3. Same tile the rail uses, so it is
                    already cached for a visitor arriving from the chart.
                    eslint-disable: pre-sized WebP from
                    scripts/build-poster-tiles.mjs, nothing for a loader to do. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="zx-title-poster"
                  src={entry.poster}
                  alt={fill(dict.a11y.posterAlt, { title: entry.title })}
                  width={420}
                  height={630}
                  /* The one above-the-fold image on the page, so it must NOT be
                     lazy — this is the LCP element on a phone. */
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />

                <div className="zx-title-intro">
                  {/* The type word as an eyebrow. It is the one thing the chart
                      cards deliberately never say (see top-chart.tsx: the rail is
                      "pure curiosity bait"), and on a page whose job is to answer
                      a question it should be the first word. */}
                  <p className="zx-title-kind">
                    {record.runtime ? copy.kindMovie : copy.kindSeries}
                  </p>
                  <h1 className="zx-title-name">{entry.title}</h1>
                  <p className="zx-title-synopsis">{record.synopsis}</p>

                  {/* Scores directly under the synopsis, because "is it any good"
                      is the question that follows "what is it".
                      
                      Every score carries its source, its review count, and the
                      date it was read, and links to the page it came from. That
                      is not decoration: these numbers move weekly, so a bare
                      figure would quietly become false. Rendered only when the
                      record HAS them — several titles here have no aggregator
                      score at all and get no block rather than an invented one.
                      See the `Score` type in titles.ts. */}
                  {scores.length > 0 ? (
                    <ul className="zx-title-scores">
                      {scores.map(({ name, score, suffix }) => (
                        <li key={name} className="zx-title-score">
                          <a href={score!.url} target="_blank" rel="noopener noreferrer">
                            <span className="zx-title-score-value">
                              {score!.value}
                              {suffix}
                            </span>
                            <span className="zx-title-score-meta">
                              {name}
                              {' · '}
                              {pluralize(score!.reviewCount, copy.reviews)}
                              {' · '}
                              {fill(copy.asOf, {
                                date: formatDate(score!.asOf, locale),
                              })}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </header>

              {/* The one CTA. It sits after the facts a visitor came for rather
                  than above them: this page is reached from search by someone
                  asking about a film, and leading with an install prompt before
                  answering that question is the doorway-page instinct the old
                  route died of. */}
              <div className="zx-title-cta">
                <DownloadCta
                  /* Its own label rather than the landing page's "Get Zenorix":
                     a visitor here arrived asking about ONE title, so the button
                     should answer that ("Watch on Zenorix") instead of pitching
                     the app cold. */
                  label={copy.cta}
                  sub={fill(copy.ctaMeta, { size: SITE.apkSize })}
                  source="title_detail"
                />
              </div>

              <h2 className="zx-title-section-heading">{copy.details}</h2>
              {/* A description list, not a table: these are name/value pairs about
                  one subject, which is exactly what <dl> means, and it reads
                  correctly in a screen reader without any ARIA. */}
              <dl className="zx-title-facts">
                {facts.map((fact) => (
                  <div key={fact.label} className="zx-title-fact">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              {/* Heading and list stand or fall together — a "Cast" heading over an
                  empty list reads as a missing section rather than an absent one.
                  Documentaries (`idaho`) legitimately have no cast. */}
              {record.cast && record.cast.length > 0 && (
                <>
                  <h2 className="zx-title-section-heading">{copy.cast}</h2>
                  <ul className="zx-title-cast">
                    {record.cast.map((person) => (
                      <li key={person}>{person}</li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          </div>
        </main>

        <SiteFooter
          links={legalLinks(locale, {
            privacy: dict.footer.privacy,
            terms: dict.footer.terms,
            dmca: dict.footer.dmca,
          })}
          directory={{
            watch: watchLinks(),
            reference: referenceLinks(locale),
            copy: { ...dict.footer.directory, newTab: dict.a11y.newTab },
          }}
          copyright={fill(dict.footer.copyright, { year: 2026 })}
          contact={{ label: dict.contact.label, aria: dict.contact.aria }}
          social={dict.social}
        />
      </div>
      </ConversionProvider>
    </>
  )
}

/**
 * A release date in the reader's own market conventions.
 *
 * `Intl` rather than a hand-rolled formatter, and the locale is passed through
 * rather than defaulting: `2026-07-31` is "July 31, 2026" in en, "31 de julho de
 * 2026" in pt-BR and a Buddhist-era year in th. `timeZone: 'UTC'` is required —
 * without it a bare `YYYY-MM-DD` is parsed as UTC midnight and then rendered in
 * the server's zone, which lands on the previous day for anywhere west of London.
 */
function formatDate(iso: string, locale: Locale): string {
  const tag = locale === 'pt-br' ? 'pt-BR' : locale
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(tag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
