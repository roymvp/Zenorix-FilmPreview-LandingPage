'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import type { ChartEntry } from '@/lib/content/movies'
import { PLATFORMS } from '@/lib/content/platforms'

/**
 * Regional Top 10 — placeholder art, rank, source badge. Nothing else.
 *
 * Every card is a locked door: tapping any title opens the download upsell
 * instead of a detail page. Titles and type labels are deliberately omitted so
 * the rail reads as pure curiosity bait; the accessible name still carries the
 * rank and title for screen readers.
 *
 * TO REPLACE WITH REAL POSTERS: add `poster: string` back to `ChartEntry`
 * (see `lib/content/movies.ts`) and swap the placeholder <span> below for an
 * <img className="zx-chart-img" src={entry.poster} alt="" loading="lazy" />.
 * `.zx-chart-art` already owns the 2/3 aspect ratio, radius and clipping, so
 * no CSS needs to change.
 */
export function TopChart({
  entries,
  heading,
  rankLabel,
  moreLabel,
}: {
  entries: ChartEntry[]
  heading: string
  /** "Number {rank}" template, used to build each poster's accessible name. */
  rankLabel: string
  /** Outlined tail button that jumps straight to the download. */
  moreLabel: string
}) {
  const { openContent, download } = useConversion()

  return (
    <section className="zx-section zx-chart" aria-labelledby="zx-chart-heading">
      <div className="zx-shell">
        <h2 id="zx-chart-heading" className="zx-section-title">
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
                  {/* Neutral stand-in until artwork is licensed. Reads as an
                      empty slot, never as finished art. */}
                  <span className="zx-chart-ph" aria-hidden="true">
                    <md-icon>image</md-icon>
                  </span>

                  {/* Source app icon, top-right — the service's own store icon,
                      full color. aria-hidden: the platform is not part of the
                      card's accessible name, which already carries rank +
                      title. */}
                  <span className="zx-chart-badge" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={platform.icon || '/placeholder.svg'}
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
          onClick={() => download('chart_more')}
        >
          {moreLabel}
          <md-icon aria-hidden="true">arrow_forward</md-icon>
        </button>
      </div>
    </section>
  )
}
