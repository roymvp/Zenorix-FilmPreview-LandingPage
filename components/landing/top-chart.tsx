'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import type { ChartEntry } from '@/lib/content/movies'

/**
 * Regional Top 10.
 *
 * Every poster is a locked door: tapping any title opens the download upsell
 * instead of a detail page. Curiosity is the click driver, so the rail carries
 * social proof ("what your country is watching") and converts it immediately.
 */
export function TopChart({
  entries,
  heading,
  sub,
  rankLabel,
  seeAllLabel,
  kindLabels,
}: {
  entries: ChartEntry[]
  heading: string
  sub: string
  /** "Number {rank}" template for screen readers. */
  rankLabel: string
  seeAllLabel: string
  kindLabels: { movie: string; series: string }
}) {
  const { openContent } = useConversion()

  return (
    <section className="zx-section zx-chart" aria-labelledby="zx-chart-heading">
      <div className="zx-shell">
        <div className="zx-section-head zx-chart-head">
          <div>
            <span className="zx-eyebrow md-typescale-label-small">
              <md-icon aria-hidden="true">trending_up</md-icon>
              Top 10
            </span>
            <h2
              id="zx-chart-heading"
              className="md-typescale-headline-medium"
              style={{ marginBlockStart: 6 }}
            >
              {heading}
            </h2>
            <p className="md-typescale-body-medium" style={{ marginBlockStart: 6 }}>
              {sub}
            </p>
          </div>
        </div>

        <ul className="zx-rail">
          {entries.map((entry, index) => (
            <li key={entry.id} style={{ display: 'contents' }}>
              <button
                type="button"
                className="zx-chart-card"
                onClick={() => openContent(entry.title)}
              >
                <span className="zx-chart-art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.poster}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="zx-rank" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="zx-chart-lock" aria-hidden="true">
                    <md-icon>lock</md-icon>
                  </span>
                </span>
                <span className="zx-chart-title">{entry.title}</span>
                <span className="zx-chart-kind">
                  <span className="zx-visually-hidden">
                    {rankLabel.replace('{rank}', String(index + 1))} ·{' '}
                  </span>
                  {kindLabels[entry.kind]}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div style={{ marginBlockStart: 22 }}>
          <md-outlined-button onClick={() => openContent(entries[0].title)}>
            <md-icon slot="icon" aria-hidden="true">
              grid_view
            </md-icon>
            {seeAllLabel}
          </md-outlined-button>
        </div>
      </div>
    </section>
  )
}
