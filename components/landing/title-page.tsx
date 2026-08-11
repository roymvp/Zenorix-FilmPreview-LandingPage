import { ContactLink } from '@/components/landing/contact-link'
import { ConversionProvider } from '@/components/landing/conversion-provider'
import { DownloadCta } from '@/components/landing/download-cta'
import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { SITE } from '@/lib/config/site'
import { castCredits, castInitials, castPhoto } from '@/lib/content/cast'
import type { ChartEntry } from '@/lib/content/charts'
import { PLATFORMS } from '@/lib/content/platforms'
import { PLAYBACK_FORMATS, type TitleRecord } from '@/lib/content/titles'
import { fill, pluralize, type Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { buildTitleStructuredData } from '@/lib/seo'

/**
 * The glyph that goes on each playback capsule.
 *
 * Typed as a total map over `PLAYBACK_FORMATS` rather than a lookup with a
 * fallback: adding a fifth format in `titles.ts` should fail the build here, not
 * quietly ship a capsule with a blank square where its icon goes.
 *
 * These are Material Symbols names, NOT the vendors' marks. The formats are
 * printed with the Dolby double-D and the HDR10 wordmark everywhere a viewer
 * normally meets them, and those are registered logos — an icon font carries no
 * brand marks (the same reason social-links draws the X as an inline SVG). So each
 * capsule gets the industry's generic glyph for what the format DOES: the 4K badge
 * for resolution, the HDR badge for HDR10, a contrast wheel for Dolby Vision's
 * dynamic range, and the surround field for Atmos. The registered WORDING stays as
 * the label beside it, which is the part that must not be substituted.
 *
 * Every name here must also be in the `icon_names` subset in `app/[lang]/layout.tsx`
 * — see the long warning there, including what a misspelling costs.
 */
const FORMAT_ICONS: Record<(typeof PLAYBACK_FORMATS)[number], string> = {
  '4K UHD': '4k',
  HDR10: 'hdr_on',
  'Dolby Vision': 'contrast',
  'Dolby Atmos': 'surround_sound',
}

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
  /* The service that holds this title's streaming window, as the full registry
     entry rather than just its name: the header row shows the mark next to the
     name, and both have to come from the same place or a service can end up with
     two identities on one page (see the note at the top of `platforms.ts`).
     `undefined` on the unreleased titles, which are not streaming anywhere yet and
     get no chip rather than a guessed one. */
  const platform = record.streamingOn ? PLATFORMS[record.streamingOn] : undefined

  /* THE HEADER OWNS THE SCANNABLE FACTS; THIS LIST OWNS THE REST.
  
     Runtime, seasons, genre, rating and streaming service used to be rows down here.
     They are in the header rows now, and were REMOVED from this list rather than
     left in both places — a fact stated twice on one page teaches the reader that
     the page repeats itself, and the second statement is the one that gets skimmed.
     What is left is what the header deliberately does not carry: the people, the
     companies, and the precise release date the header only summarises as a year.
  
     Still built as label/value pairs here rather than in the markup so the empty
     ones can be dropped in one place. A row with a dash in it is worse than no
     row: it takes the same vertical space to say nothing. */
  const facts: { label: string; value: string }[] = [
    /* THE EXACT RELEASE DATE — the one deliberate exception to the paragraph above.
    
       The tag line under the h1 carries a bare year, because that is the form a
       browsing visitor scans. This row carries the full localized date, because
       "when exactly did it come out" is a question people arrive at a detail page
       to answer and a year does not answer it. Two forms of one fact, each doing a
       job the other cannot — which is a different thing from the repetition the
       note above forbids, where the SAME string was printed in two places. */
    { label: copy.released, value: formatDate(record.released, locale) },
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
    /* The rating's DESCRIPTOR only — the certificate itself ("PG-13") is a chip in
       the header now. This row survives the de-duplication above because the header
       chip cannot carry this sentence: "PG-13" is the label a parent recognises,
       but "for sequences of strong violence" is the answer they actually came for,
       and it is far too long to sit in a chip. Rendered only when the MPA published
       one — several ratings here have no descriptor.

       The descriptor stays in English in all three markets on purpose: it is a
       quotation of what the MPA published, and a translated citation is no longer
       the citation. The LABEL is localized and says whose rating this is
       ("Classificação (EUA)"), which is the part a reader outside the US needs. */
    ...(record.contentRating?.reason
      ? [
          {
            label: copy.rated,
            value: `${record.contentRating.value} · ${record.contentRating.reason}`,
          },
        ]
      : []),
    { label: copy.studio, value: record.productionCompanies.join(', ') },
    /* A series airs on a network; a film is handled by a distributor. Same row
       position, different label, because "Distributor: HBO" misstates what HBO is
       to a show it produces and broadcasts. */
    ...(record.network
      ? [{ label: copy.network, value: record.network }]
      : [{ label: copy.distributor, value: record.distributors.join(', ') }]),
  ]

  /* Each score carries the mark of the aggregator it came from. The source used to
     be spelled out in a caption under the number; it is an icon now because the
     tomato and the Metacritic circle ARE the source — a reader who knows what 90%
     means already recognises them, and a reader who does not was not helped by the
     word either. The provenance the number is worthless without (review count and
     read date) is still in the HTML, just visually hidden — see the note at the
     `Score` type in titles.ts for why it can never be dropped outright. */
  const scores = [
    {
      name: 'Rotten Tomatoes',
      icon: '/scores/rottentomatoes.svg',
      score: record.rottenTomatoes,
      suffix: '%',
    },
    {
      name: 'Metacritic',
      icon: '/scores/metacritic.svg',
      score: record.metacritic,
      suffix: '',
    },
  ].filter((row) => row.score)

  /* THE TAG LINE, under the h1: year · length · genre · certificate.
  
     THE YEAR HERE IS NOT THE RELEASE DATE. It used to be the full "19 December
     2025" and it sat below the synopsis; it is a bare year on the title line now,
     which is where every service the visitor already uses puts it. The exact date
     did NOT evaporate with it — it moved into the `Details` list below, and that
     split is deliberate: this line is the SCAN layer (four facts the eye takes in
     without reading) and the <dl> is the REFERENCE layer (the precise value you go
     looking for). It is the one fact on this page that appears twice, and it is
     allowed to because the two forms answer different questions.
  
     Formatted through `Intl` rather than sliced off the ISO string. `released`
     starts "2025-…", so `.slice(0, 4)` would print 2025 in every market — but the
     Thai page renders dates in the Buddhist era, so the <dl> below it would say
     2568 and the page would contradict itself by two digits in one column.
  
     Each entry keeps its label even though the label is not drawn — the row renders
     as "2025 · 197 min · Science fiction, Epic", which is unambiguous to anyone
     LOOKING at it and completely opaque to a screen reader reading bare values in
     sequence. So the label ships as visually-hidden text in front of each value.
     This is the reason these are objects and not a plain string array.
  
     A film gets a runtime; a series gets seasons and episodes. Driven off which
     fields the record actually has rather than off `entry.kind`, so a record can
     only ever produce an entry it has data for. */
  const tags: { label: string; value: string }[] = [
    { label: copy.released, value: formatYear(record.released, locale) },
    ...(record.runtime
      ? [{ label: copy.runtime, value: fill(copy.minutes, { count: record.runtime }) }]
      : []),
    ...(record.seasons
      ? [{ label: copy.seasons, value: pluralize(record.seasons, copy.seasonCount) }]
      : []),
    ...(record.episodes
      ? [{ label: copy.episodes, value: pluralize(record.episodes, copy.episodeCount) }]
      : []),
    /* Genre last of the plain values and first among equals visually — this is the
       "题材" a browsing visitor sorts by, and it reads as the end of the sentence
       the year and runtime start. */
    { label: copy.genre, value: record.genres.join(', ') },
  ]

  /* Photographer credits for whichever of this cast actually has a portrait.
     Computed here so the markup below can ask one question ("is there anything to
     credit") instead of walking the cast twice. */
  const credits = castCredits(record.cast ?? [])

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
            {/* NO VISIBLE BREADCRUMB. There was a "Zenorix / <title>" trail here
                and it is gone: with only two levels it never told the visitor
                anything the top bar's home link does not already offer, and it put
                the site name immediately above an h1 that the top bar had already
                introduced — two lines of chrome in front of the one line the page
                is about. The `BreadcrumbList` in the JSON-LD stays; a crawler needs
                the parent relationship spelled out, a reader on a two-level page
                does not. Same reasoning as the legal pages, see `lib/seo.ts`. */}
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
                  {/* THE PROVENANCE ROW, ABOVE THE H1: where it streams, how it
                      scored.
                  
                      NOT A TYPE EYEBROW. One used to sit in this position reading
                      "Film" / "Series" and was rightly deleted for spending the most
                      valuable line on the page restating what the runtime already
                      said. What is here instead is the pair of facts that cannot be
                      derived from anything else on the page and that a visitor
                      arriving from a search result is checking FIRST — is it on a
                      service I have, and is it any good. Apple TV and Letterboxd
                      both put exactly this pair above the title.
                  
                      The measurable facts are NOT here: year, length, genre and
                      certificate all sit under the h1, because they describe the
                      title itself and belong with it, while these two describe the
                      world's relationship to it.
                  
                      Rendered only when there is something to put in it. An
                      unreleased title has neither a service nor an aggregator score,
                      and an empty row above the h1 would push the title down for
                      nothing — the exact fault the type eyebrow was removed for. */}
                  {platform || scores.length > 0 ? (
                    <div className="zx-title-eyebrow">
                    {platform ? (
                      /* The service's own square app icon beside its own name. The
                         mark alone would be a puzzle for anyone who does not already
                         know it, and the name alone throws away the instant
                         recognition that is the whole reason to lead with this.
                         eslint-disable: pre-sized 144px WebP from
                         scripts/build-brand-icons.mjs. */
                      <span className="zx-title-platform">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="zx-title-platform-mark"
                          src={platform.icon}
                          /* Empty alt: the name is in the sibling span, so a
                             described icon makes a screen reader say "Netflix
                             Netflix". */
                          alt=""
                          width={36}
                          height={36}
                          loading="eager"
                          decoding="async"
                        />
                        {/* Hidden label, because read aloud this row is otherwise
                            "Netflix, 90%" — two unrelated numbers and a noun. The
                            label turns it back into a sentence. Sighted readers get
                            the same meaning from the service's own logo. */}
                        <span className="zx-visually-hidden">{copy.streamingOn}: </span>
                        {platform.name}
                      </span>
                    ) : null}

                    {/* The critic scores share this row with the service rather than
                        taking one of their own. "Where can I watch it" and "is it
                        worth watching" are the same decision made in the same second,
                        and splitting them over two lines makes the reader travel
                        twice for one answer.
                        
                        Each links to its source and carries its review count and read
                        date as hidden text: these numbers move weekly, so a bare
                        figure would quietly become false. Rendered only when the
                        record HAS them — several titles here have no aggregator score
                        at all and get nothing rather than an invented one. See the
                        `Score` type in titles.ts. */}
                    {scores.length > 0 ? (
                      <ul className="zx-title-scores">
                        {scores.map(({ name, icon, score, suffix }) => (
                          <li key={name} className="zx-title-score">
                            <a href={score!.url} target="_blank" rel="noopener noreferrer">
                              {/* The mark carries the source name as its alt text, so
                                  a screen reader still hears "Rotten Tomatoes 90%" and
                                  the source is in the HTML for a crawler that reads no
                                  CSS. eslint-disable: local SVG, nothing to optimise. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                className="zx-title-score-mark"
                                src={icon}
                                alt={name}
                                width={22}
                                height={22}
                                loading="lazy"
                                decoding="async"
                              />
                              <span className="zx-title-score-value">
                                {score!.value}
                                {suffix}
                              </span>
                              {/* The citation, kept out of the layout but not out of
                                  the document. Leading separator, not decoration:
                                  without it the Metacritic score reads as "7527
                                  reviews" — the value and the count run together into
                                  one number, which is the one thing this block must
                                  never say. */}
                              <span className="zx-visually-hidden">
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
                  ) : null}

                  <h1 className="zx-title-name">{entry.title}</h1>

                  {/* THE TAG LINE: year · length · genre · certificate.
                  
                      Everything measurable about the title itself, on one line
                      directly under its name — the position it occupies on Netflix,
                      Disney+ and IMDb, because it is read as a continuation of the
                      title rather than as a section of its own. These four used to be
                      split across two places (genre and certificate above the
                      synopsis, year and runtime below it), which asked the reader to
                      assemble one sentence out of two rows on opposite sides of a
                      paragraph.
                  
                      One <ul>, not a row of <span>s: this is a list of facts about one
                      subject and a screen reader should be able to count them. Dots
                      between the plain values, drawn as `::before` on every item after
                      the first, so an absent value (a film has no season count) takes
                      its separator with it instead of leaving "· 2025 ·". */}
                  <ul className="zx-title-tags">
                    {tags.map((tag) => (
                      <li key={tag.label}>
                        <span className="zx-visually-hidden">{tag.label}: </span>
                        {tag.value}
                      </li>
                    ))}

                    {/* The certificate, boxed — the one member of this line that IS a
                        box, because a rating certificate is printed inside a rule
                        everywhere it appears and stops reading as a certificate when
                        set as plain text. Just the value; the MPA's descriptor is far
                        too long for a chip and lives in the details list below.
                        
                        Last rather than first: it is the only one of the four that
                        many visitors do not need at all, and a box leading the line
                        would out-shout the three values that everyone reads. */}
                    {record.contentRating ? (
                      <li className="zx-title-rating">
                        <span className="zx-visually-hidden">{copy.rated}: </span>
                        {record.contentRating.value}
                      </li>
                    ) : null}
                  </ul>

                  <p className="zx-title-synopsis">{record.synopsis}</p>

                  {/* THE PLAYBACK CAPSULES: what the stream arrives as.
                      
                      Below the synopsis on purpose. Nobody decides whether to watch
                      something because it carries Dolby Atmos — that is a detail you
                      check AFTER the premise has sold you, which is exactly where
                      Apple TV and Disney+ put it too. The measurable facts that used
                      to share this row (year, runtime) have moved up to the tag line
                      under the h1 where they belong, so this is now one list and the
                      `.zx-title-meta` wrapper that held two is gone with them.
                      
                      A property of the Zenorix stream rather than of the film, which
                      is why they come from one shared list in `titles.ts` instead of
                      being invented per record — see the note there.
                      
                      Filled capsules with a glyph each, no longer hairline plates.
                      The plate styling was imitating a disc case, which is a fair
                      reference for print and the wrong one here: on a black page a
                      1px outline in `outline-variant` made the site's strongest
                      technical claim its faintest element. See `FORMAT_ICONS` above
                      for why the glyphs are generic rather than the vendors' marks,
                      and the CSS for why the fill is steel and not silver. */}
                  <ul className="zx-title-formats" aria-label={copy.formats}>
                    {PLAYBACK_FORMATS.map((format) => (
                      <li key={format} className="zx-title-format">
                        {/* aria-hidden: the capsule's own text says "Dolby Atmos"
                            right beside it, so an announced glyph would only make a
                            screen reader read the format twice. */}
                        <md-icon aria-hidden="true">{FORMAT_ICONS[format]}</md-icon>
                        {format}
                      </li>
                    ))}
                  </ul>

                  {/* The one CTA — inside the header column now, directly under the
                      facts that justify it.
                      
                      It used to sit below the header as a full-width band. Moving it
                      here is not a demotion: it still comes AFTER the title, the
                      service, the rating and the synopsis, so the page still answers
                      the visitor's question before it asks for anything — which is
                      the doorway-page instinct the old `/movie/[slug]` route died of.
                      What changes is that the ask now sits beside the poster where a
                      "Play" button sits on every service the visitor already uses,
                      instead of interrupting the document halfway down. */}
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
                </div>
              </header>

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
                    {record.cast.map((person) => {
                      const photo = castPhoto(person)
                      return (
                        <li key={person}>
                          {/* A face where there is a free-licensed one, initials
                              where there is not. Roughly a third of the billed
                              cast has no Commons portrait, and a grey silhouette
                              placeholder repeated three times in a row reads as a
                              broken page — two letters reads as a person.
                              eslint-disable: pre-cropped 168px WebP from
                              scripts/build-cast-photos.mjs. */}
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="zx-title-cast-photo"
                              src={photo.src}
                              /* Empty alt on purpose: the name is rendered in the
                                 sibling span, so a described portrait would make a
                                 screen reader say every actor's name twice. */
                              alt=""
                              width={56}
                              height={56}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            /* aria-hidden because the name is right next to it:
                               a screen reader announcing "SS Sadie Sink" is worse
                               than one that just reads the name. */
                            <span className="zx-title-cast-initials" aria-hidden="true">
                              {castInitials(person)}
                            </span>
                          )}
                          <span className="zx-title-cast-name">{person}</span>
                        </li>
                      )
                    })}
                  </ul>

                  {/* The attribution the licences require. Commons is free-licensed
                      by policy, but CC BY and CC BY-SA both oblige crediting the
                      photographer, so this block is a condition of showing the
                      photos above rather than a nicety. Collapsed into a <details>
                      because it is legally necessary and editorially uninteresting:
                      present in the DOM, discoverable, not competing with the
                      cast for attention. */}
                  {credits.length > 0 && (
                    <details className="zx-title-credits">
                      <summary>{copy.photoCredits}</summary>
                      <ul>
                        {credits.map((credit) => (
                          <li key={`${credit.artist}-${credit.license}`}>
                            <a href={credit.source} target="_blank" rel="noopener noreferrer">
                              {credit.artist}
                            </a>
                            {' · '}
                            {credit.license}
                          </li>
                        ))}
                      </ul>
                      <p>{copy.photoSource}</p>
                    </details>
                  )}
                </>
              )}
            </article>
          </div>
        </main>

        <SiteFooter locale={locale} dict={dict} />
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

/**
 * Just the year, for the tag line under the title.
 *
 * TWO THINGS HERE ARE NOT THE OBVIOUS VERSION, AND BOTH WERE MEASURED.
 *
 * 1. `Intl`, not `iso.slice(0, 4)`. Slicing is the version that suggests itself and
 *    it is wrong on one of the three markets: `th` renders dates in the Buddhist
 *    era, so the full date in the Details list below prints a 2025 film as 2568.
 *    Slicing would put "2025" on the title line and "2568" two sections under it,
 *    and leave the Thai reader to work out which year the site means.
 *
 * 2. `formatToParts`, not `toLocaleDateString`. Asking `toLocaleDateString('th')`
 *    for a year on its own returns "พ.ศ. 2568" — correct, but it volunteers the era
 *    prefix that the same API omits from the full date ("19 ธันวาคม 2568"), so the
 *    two forms of one fact would be spelled differently in the only market where
 *    they differ at all. Pulling the `year` part gives the bare era-correct number,
 *    which matches the date below AND fits a line that is four facts long. `en` and
 *    `pt-BR` are unaffected either way.
 *
 * Same `timeZone: 'UTC'` as `formatDate` and for the same reason — a bare
 * `YYYY-MM-DD` parses as UTC midnight, and rendering it in a zone behind London
 * lands on 31 December of the previous year for anything released on 1 January.
 */
function formatYear(iso: string, locale: Locale): string {
  const tag = locale === 'pt-br' ? 'pt-BR' : locale
  const parts = new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(new Date(`${iso}T00:00:00Z`))
  /* `?? iso.slice(0, 4)` is unreachable in practice — every locale's year format
     contains a `year` part — but `find` is typed as possibly-undefined and the
     alternative is a non-null assertion on a value used in the h1's own line. */
  return parts.find((part) => part.type === 'year')?.value ?? iso.slice(0, 4)
}
