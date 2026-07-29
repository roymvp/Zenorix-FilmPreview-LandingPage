import { DownloadCta } from '@/components/landing/download-cta'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/content/platforms'

/**
 * About Zenorix — the merged replacement for the old brand strip and the
 * "three reasons people switch" bullets.
 *
 * Four outlined cards, all on the page's single surface: the border is the only
 * container (no fill), so the cards group the claims without introducing a
 * second background. Each card is chip-then-proof — a filled pill label, then
 * the answer in ONE shared type treatment (same size, weight and color across
 * all four rows). That uniformity is the point: with nothing competing on
 * emphasis, the four cards read as one balanced set of facts rather than a
 * ranked list.
 *
 * The price card is the deliberate exception. A bare "$1.25/mo" has no anchor,
 * so it renders as a two-row comparison against the subscription stack it
 * replaces — the bars make the gap legible before either number is read.
 */
export function AboutZenorix({
  heading,
  apps,
  price,
  viewing,
  trial,
  cta,
  ctaMeta,
}: {
  heading: string
  /** Card 1 label. Its "content" is the platform icon matrix itself. */
  apps: { label: string }
  /** Card 2: the price, anchored against the stack of apps it replaces. */
  price: {
    label: string
    /** Row 1: who we are, and our formatted monthly price. */
    ourLabel: string
    value: string
    /** Row 2: the rival stack, and its formatted combined monthly cost. */
    rivalLabel: string
    rivalValue: string
    /** Same two costs as plain numbers, used only to size the bars. */
    ourAmount: number
    rivalAmount: number
  }
  /** Card 3: playback specs, laid out as one inline run. */
  viewing: { label: string; items: string[] }
  /** Card 4: the offer, plus the objection it removes. */
  trial: { label: string; value: string; note: string }
  /** Label for the section-closing install button. */
  cta: string
  /** APK facts rendered directly beneath that button. */
  ctaMeta: string
}) {
  // The rival bar is always full, so our bar is our share of its cost. The 5%
  // floor is a legibility guard, not a fudge: at the real US ratio (1.25 / 80 =
  // 1.6%) the fill collapses into the track's own border radius and reads as a
  // rendering bug rather than as a tiny price.
  const ourShare = Math.max(5, (price.ourAmount / price.rivalAmount) * 100)

  return (
    <section className="zx-section" aria-labelledby="zx-about-heading">
      <div className="zx-shell">
        <h2 id="zx-about-heading" className="zx-section-title">
          {heading}
        </h2>

        <ul className="zx-about">
          <li className="zx-about-card">
            <p className="zx-about-label">{apps.label}</p>
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

          <li className="zx-about-card">
            <p className="zx-about-label">{price.label}</p>
            {/* A price alone is just a number; against the stack it replaces it
                becomes a saving. The bars carry that comparison pre-attentively,
                so the reader gets the gap before reading either figure. A
                definition list is the honest structure here: each row is a
                name (who) paired with a value (what it costs). */}
            <dl className="zx-compare">
              <div className="zx-compare-row">
                <div className="zx-compare-head">
                  <dt className="zx-compare-name zx-compare-name--ours">
                    {price.ourLabel}
                  </dt>
                  <dd className="zx-compare-amount">{price.value}</dd>
                </div>
                {/* Decorative: the figure above already states the value, so a
                    screen reader gains nothing from re-announcing the bar. */}
                <div className="zx-compare-track" aria-hidden="true">
                  <div
                    className="zx-compare-fill zx-compare-fill--ours"
                    style={{ width: `${ourShare}%` }}
                  />
                </div>
              </div>

              <div className="zx-compare-row">
                <div className="zx-compare-head">
                  <dt className="zx-compare-name">{price.rivalLabel}</dt>
                  <dd className="zx-compare-amount">{price.rivalValue}</dd>
                </div>
                <div className="zx-compare-track" aria-hidden="true">
                  <div className="zx-compare-fill zx-compare-fill--rival" />
                </div>
              </div>
            </dl>
          </li>

          <li className="zx-about-card">
            <p className="zx-about-label">{viewing.label}</p>
            {/* Wrapping inline run rather than stacked lines: three short specs
                stacked read as a ranked list, side by side they read as one
                combined claim. */}
            <ul className="zx-about-specs">
              {viewing.items.map((item) => (
                <li key={item} className="zx-about-value">
                  {item}
                </li>
              ))}
            </ul>
          </li>

          <li className="zx-about-card">
            <p className="zx-about-label">{trial.label}</p>
            <p className="zx-about-value">{trial.value}</p>
            <p className="zx-about-note">{trial.note}</p>
          </li>
        </ul>

        {/* The four claims build to a decision, so the section closes on the
            action instead of making the reader scroll back for one. The APK
            meta line answers the "what am I actually installing?" question at
            the exact moment the reader is deciding. */}
        <div className="zx-about-cta">
          <DownloadCta label={cta} sub={ctaMeta} source="about" />
        </div>
      </div>
    </section>
  )
}
