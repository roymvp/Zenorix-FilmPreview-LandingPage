'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import type { ChartEntry } from '@/lib/content/charts'
import { PLATFORMS } from '@/lib/content/platforms'

/**
 * One regional chart rail — key art, rank, source badge. Nothing else.
 *
 * Every card is a locked door: tapping any title opens the download upsell
 * instead of a detail page. Titles and type labels are deliberately omitted so
 * the rail reads as pure curiosity bait; the accessible name still carries the
 * rank and title for screen readers.
 *
 * The page renders this twice — films, then shows — so `id` is required: two
 * rails cannot share one heading id, or `aria-labelledby` on the second section
 * would point at the first section's title.
 *
 * Rail length is whatever `entries` holds. No slicing, no padding: the copy in
 * `chart.headingMovies` / `chart.headingSeries` carries no count, so a rail of
 * eight and a rail of twelve are both honest, and the catalogue never has to
 * invent an entry to fill a "Top 10" label.
 */
export function TopChart({
  id,
  entries,
  heading,
  rankLabel,
  moreLabel,
  moreHint,
}: {
  /** Unique per rail; used for the section's heading id. */
  id: string
  entries: ChartEntry[]
  heading: string
  /** "Number {rank}" template, used to build each poster's accessible name. */
  rankLabel: string
  /** Outlined tail button that jumps straight to the download. */
  moreLabel: string
  /** Catalogue size line under the button — the payoff for tapping it. */
  moreHint: string
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
          return (
            <li key={entry.id} className="zx-rail-item">
              <button
                type="button"
                className="zx-chart-card"
                onClick={() => openContent(entry.title)}
                aria-label={`${rankLabel.replace('{rank}', String(index + 1))} · ${entry.title}`}
              >
                <span className="zx-chart-art">
                  {/* alt="": the button's aria-label already carries rank +
                      title, so a described image would just repeat it.
                      The first two cards are above the fold on a phone, so they
                      load eagerly; the rest are off to the right of the scroll
                      track and wait.
                      eslint-disable — these are pre-sized 2:3 WebP tiles built by
                      scripts/build-poster-tiles.mjs, so next/image would add a
                      loader with nothing left to optimize. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="zx-chart-img"
                    src={entry.poster}
                    alt=""
                    width={420}
                    height={630}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />

                  {/* Source app icon, top-right — the service's own store icon,
                      full color. aria-hidden: the platform is not part of the
                      card's accessible name, which already carries rank +
                      title. */}
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
              </button>
            </li>
          )
        })}
      </ul>

      {/* Tail action for the rail: the catalogue is the promise, so "see more"
          resolves to the only thing that can actually deliver it — the install.
          Outlined on purpose: the filled CTA stays the section-level primary. */}
      <div className="zx-shell zx-chart-more-wrap">
        <button
          type="button"
          className="zx-chart-more"
          /* Per-rail source: the films rail and the shows rail are separate
             offers, so a single `chart_more` would hide which one converts. */
          onClick={() => download(`chart_more:${id}`)}
        >
          {moreLabel}
          <md-icon aria-hidden="true">arrow_forward</md-icon>
        </button>
        <p className="zx-chart-more-hint">{moreHint}</p>
      </div>
    </section>
  )
}
