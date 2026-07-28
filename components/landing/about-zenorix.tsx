import { PLATFORMS, PLATFORM_ORDER } from '@/lib/content/platforms'

/**
 * About Zenorix — the merged replacement for the old brand strip and the
 * "three reasons people switch" bullets.
 *
 * Both predecessors said the same four things in two different visual
 * languages, so they are now one section with one rule: the LABEL is quiet
 * (small, uppercase, muted) and the ANSWER is loud. Every row therefore reads
 * as claim-then-proof at a glance while scrolling, and no row needs body copy
 * to carry it.
 *
 * The four rows deliberately use four different proof shapes — a logo wall, a
 * price, a spec list, a trial offer — because the type scale alone is what
 * unifies them; repeating one card shape would flatten the contrast that makes
 * the price and the trial land.
 */
export function AboutZenorix({
  heading,
  apps,
  price,
  viewing,
  trial,
}: {
  heading: string
  /** Row 1 label. Its "content" is the platform icon wall itself. */
  apps: { label: string }
  /** Row 2: the wedge. Rendered at the largest size on the page. */
  price: { label: string; value: string }
  /** Row 3: playback specs, one per line so each gets display weight. */
  viewing: { label: string; items: string[] }
  /** Row 4: the offer, plus the objection it removes. */
  trial: { label: string; value: string; note: string }
}) {
  return (
    <section className="zx-section" aria-labelledby="zx-about-heading">
      <div className="zx-shell">
        <h2 id="zx-about-heading" className="zx-section-title">
          {heading}
        </h2>

        <ul className="zx-about">
          <li className="zx-about-row">
            <p className="zx-about-label">{apps.label}</p>
            {/* The icons ARE the headline here: at 44px the wall carries the
                same visual weight as the display type in the other rows. */}
            <ul className="zx-about-logos">
              {PLATFORM_ORDER.map((id) => {
                const platform = PLATFORMS[id]
                return (
                  <li key={platform.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={platform.icon || '/placeholder.svg'}
                      alt={platform.name}
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                )
              })}
            </ul>
          </li>

          <li className="zx-about-row">
            <p className="zx-about-label">{price.label}</p>
            <p className="zx-about-display zx-about-price">{price.value}</p>
          </li>

          <li className="zx-about-row">
            <p className="zx-about-label">{viewing.label}</p>
            <ul className="zx-about-specs">
              {viewing.items.map((item) => (
                <li key={item} className="zx-about-display">
                  {item}
                </li>
              ))}
            </ul>
          </li>

          <li className="zx-about-row">
            <p className="zx-about-label">{trial.label}</p>
            <p className="zx-about-display">{trial.value}</p>
            <p className="zx-about-note">{trial.note}</p>
          </li>
        </ul>
      </div>
    </section>
  )
}
