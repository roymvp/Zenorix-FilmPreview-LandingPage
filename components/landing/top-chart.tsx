'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import type { ChartEntry } from '@/lib/content/movies'

/**
 * Regional Top 10 — heading, poster, rank. Nothing else.
 *
 * Every poster is a locked door: tapping any title opens the download upsell
 * instead of a detail page. Titles and type labels are deliberately omitted so
 * the rail reads as pure curiosity bait; the accessible name still carries the
 * rank and title for screen readers.
 */
export function TopChart({
  entries,
  heading,
  rankLabel,
}: {
  entries: ChartEntry[]
  heading: string
  /** "Number {rank}" template, used to build each poster's accessible name. */
  rankLabel: string
}) {
  const { openContent } = useConversion()

  return (
    <section className="zx-section zx-chart" aria-labelledby="zx-chart-heading">
      <div className="zx-shell">
        <h2 id="zx-chart-heading" className="zx-section-title">
          {heading}
        </h2>

        <ul className="zx-rail">
          {entries.map((entry, index) => (
            <li key={entry.id} className="zx-rail-item">
              <button
                type="button"
                className="zx-chart-card"
                onClick={() => openContent(entry.title)}
                aria-label={`${rankLabel.replace('{rank}', String(index + 1))} · ${entry.title}`}
              >
                <span className="zx-chart-art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={entry.poster} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="zx-rank" aria-hidden="true">
                  {index + 1}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
