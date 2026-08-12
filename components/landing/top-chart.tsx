'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import type { ChartEntry } from '@/lib/content/charts'
import { PLATFORMS } from '@/lib/content/platforms'
import { getTitle } from '@/lib/content/titles'
import { fill } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'

/**
 * One regional chart rail — key art, rank, source badge. Nothing else.
 *
 * Cards used to be uniformly locked doors: tapping any title opened the download
 * upsell instead of a detail page, so the rail read as pure curiosity bait. That
 * now applies only to titles with no detail page. A title WITH a researched
 * record (see lib/content/titles.ts) renders as a real link to it.
 *
 * The trade was made deliberately. A detail page that can only be reached through
 * a modal is invisible to the crawlers it exists for, so the rail is the only
 * internal link that can make those pages discoverable. The funnel does not lose
 * its destination — the same install CTA is the single call to action on the
 * detail page — it gains a step that answers the visitor's question first.
 *
 * Titles and type labels are still omitted from the card face; the accessible
 * name carries rank and title.
 *
 * The page renders this twice — films, then shows — so `id` is required: two
 * rails cannot share one heading id, or `aria-labelledby` on the second section
 * would point at the first section's title.
 *
 * The tail CTA is OPTIONAL and belongs to the last rail only. Both rails sell the
 * same install, so two identical buttons 500px apart were the same offer asked
 * twice — the first one interrupted the browse before the shows rail had made its
 * case. It lives inside this section rather than in its own block so the
 * "each section owns only the space above itself" rhythm keeps holding.
 *
 * Rail length is whatever `entries` holds. No slicing, no padding: the copy in
 * `chart.headingMovies` / `chart.headingSeries` carries no count, so a rail of
 * eight and a rail of twelve are both honest, and the catalogue never has to
 * invent an entry to fill a "Top 10" label.
 */
export function TopChart({
  id,
  locale,
  entries,
  heading,
  rankLabel,
  posterAlt,
  more,
}: {
  /** Unique per rail; used for the section's heading id. */
  id: string
  /** Needed to build detail-page hrefs in the visitor's own market. */
  locale: Locale
  entries: ChartEntry[]
  heading: string
  /** "Number {rank}" template, used to build each poster's accessible name. */
  rankLabel: string
  /**
   * "Poster for {title}" template — the poster images' `alt` text.
   *
   * Separate from `rankLabel` on purpose. `rankLabel` names the CARD (rank +
   * title, the thing you activate); this names the IMAGE (what the picture
   * depicts). They read differently and only the second one is what Google
   * Images has to work with.
   */
  posterAlt: string
  /**
   * Outlined tail button that jumps straight to the download, plus the catalogue
   * size line under it. Omit on every rail but the last — the page carries one.
   */
  more?: { label: string; hint: string }
}) {
  const { openContent, download } = useConversion()
  const headingId = `zx-chart-heading-${id}`

  return (
    <section className="zx-section zx-chart" aria-labelledby={headingId}>
      <div className="zx-shell">
        <h2 id={headingId} className="zx-section-title">
          {heading}
        </h2>
      </div>

      {/* The rail sits OUTSIDE .zx-shell and owns its own inline padding, so the
          first card starts at the gutter while the scroll track still runs the
          full page width. */}
      <ul className="zx-rail">
        {entries.map((entry, index) => {
          const platform = PLATFORMS[entry.platform]
          /* A detail page exists only for titles with researched facts. Titles
             without a record keep the original locked-door behaviour rather than
             gaining an empty page — see the header of lib/content/titles.ts. */
          const record = getTitle(entry.id)
          const cardLabel = `${rankLabel.replace('{rank}', String(index + 1))} · ${entry.title}`

          /* The art is identical in both branches, so it is built once here
             rather than duplicated into the <a> and the <button>. */
          const art = (
            <span className="zx-chart-art">
              {/* A REAL alt, not `alt=""`.

                  It used to be empty, reasoned as "the card's aria-label already
                  carries rank + title, so a described image would just repeat
                  it". True for screen readers — an element with `aria-label`
                  takes its name from that label and never descends into this
                  `<img>`, so nothing is announced twice (verified in the browser,
                  not assumed).

                  But `aria-label` is not indexable body text, so with an empty
                  alt these titles existed nowhere a crawler reads: only in
                  `keywords` (ignored by Google for two decades) and in JSON-LD.
                  Measured on the served HTML, "Sterling Point" appeared 0 times
                  in visible text. That left 21 licensed posters unable to rank in
                  Google Images for the one query they are the exact answer to.

                  This is description, not keyword stuffing: per the note in
                  charts.ts these tiles carry their own title lettering, so
                  "Poster for X" states what the pixels literally show.

                  The first two cards are above the fold on a phone, so they load
                  eagerly; the rest are off to the right of the scroll track and
                  wait.
                  eslint-disable — these are pre-sized 2:3 WebP tiles built by
                  scripts/build-poster-tiles.mjs, so next/image would add a loader
                  with nothing left to optimize. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="zx-chart-img"
                src={entry.poster}
                /* Both widths come from scripts/build-poster-tiles.mjs. The rail
                   card is 124px on a phone, 148 from 720 and 172 from 1024
                   (`grid-auto-columns` in landing.css), so a lone 420px file is
                   about twice the pixels a phone can paint: PageSpeed measured one
                   painted at 217px and called 28.7KB of it waste — the largest
                   single-image saving in the whole report.

                   `sizes` mirrors those three `grid-auto-columns` values and has
                   to be updated alongside them. The preload scanner reads it
                   before any CSS exists, so an UNDERSTATED value here ships a
                   blurry poster and the browser will not re-fetch a better one
                   once it has committed.

                   Quality is deliberately untouched (q78, same as before) — unlike
                   the hero wall these are clicked and looked at directly, and
                   PageSpeed asked for no compression saving on them. Only the
                   dimension changes. */
                srcSet={`${entry.poster.replace(/\.webp$/, '-280w.webp')} 280w, ${entry.poster} 420w`}
                sizes="(min-width: 1024px) 172px, (min-width: 720px) 148px, 124px"
                alt={fill(posterAlt, { title: entry.title })}
                width={420}
                height={630}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />

              {/* Source app icon, top-right — the service's own store icon, full
                  color. aria-hidden: the platform is not part of the card's
                  accessible name, which already carries rank + title. */}
              <span className="zx-chart-badge" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={platform.icon}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                />
              </span>

              <span className="zx-rank" aria-hidden="true">
                {index + 1}
              </span>
            </span>
          )

          return (
            <li key={entry.id} className="zx-rail-item">
              {record ? (
                /* A real anchor, not a button with a router push: middle-click,
                   long-press "open in new tab" and a crawler following hrefs all
                   need an href, and those are precisely the behaviours an
                   indexable page depends on. */
                <a
                  className="zx-chart-card"
                  href={`/${locale}/titles/${record.slug}`}
                  aria-label={cardLabel}
                >
                  {art}
                </a>
              ) : (
                <button
                  type="button"
                  className="zx-chart-card"
                  /* The poster travels with the title so the dialog can show the
                     art the visitor just clicked — see `LockedContent`. */
                  onClick={() =>
                    openContent({ title: entry.title, poster: entry.poster })
                  }
                  aria-label={cardLabel}
                >
                  {art}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {/* Tail action for BOTH rails: the catalogue is the promise, so "see more"
          resolves to the only thing that can actually deliver it — the install.
          Outlined on purpose: the filled CTA stays the section-level primary. */}
      {more ? (
        <div className="zx-shell zx-chart-more-wrap">
          <button
            type="button"
            className="zx-chart-more"
            onClick={() => download('chart_more')}
          >
            {more.label}
            <md-icon aria-hidden="true">arrow_forward</md-icon>
          </button>
          <p className="zx-chart-more-hint">{more.hint}</p>
        </div>
      ) : null}
    </section>
  )
}
