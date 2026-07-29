import { DownloadCta } from '@/components/landing/download-cta'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/content/platforms'

/**
 * Playback specs, in display order, each paired with its Material Symbols
 * badge. Icons live here rather than in the dictionaries because a glyph is
 * presentation, not copy — there is nothing for a translator to localize. Rows
 * are keyed rather than index-matched so reordering or retranslating a label can
 * never silently pair "Dolby Atmos" with the 4K plate.
 */
const VIEWING_SPECS = [
  // The literal 4K plate broadcasters and disc cases use.
  { id: 'resolution', icon: '4k' },
  // Speaker throwing concentric arcs — the standard surround/spatial mark.
  { id: 'audio', icon: 'surround_sound' },
  // Smooth playback has no industry plate, so this borrows the universal
  // "instant" bolt instead of inventing a fake certification mark.
  { id: 'playback', icon: 'bolt' },
] as const

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
  /** Card 3: playback specs, each rendered as a badge over its label. */
  viewing: {
    label: string
    /** Keyed to VIEWING_SPECS so every badge is guaranteed a matching label. */
    specs: Record<(typeof VIEWING_SPECS)[number]['id'], string>
  }
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
            {/* All 11 services on ONE line that drifts right-to-left forever,
                instead of a wrapped 3-row block. The motion is what says "and
                more" — a static grid of 11 icons at 420px reads as a complete,
                countable list, while a moving strip implies a catalogue.
                `tabindex`/`role` because the strip is also a real scroll
                container: it must be reachable by keyboard, not only by drag. */}
            <div
              className="zx-logo-marquee"
              role="group"
              aria-label={apps.label}
              tabIndex={0}
            >
              <div className="zx-logo-track">
                {/* Two identical sets are what make the loop seamless: the
                    animation travels exactly one set's width, so the moment it
                    resets, set 2 is already sitting where set 1 was and the
                    jump is invisible. The copy is aria-hidden so the 11 service
                    names are announced once, not twice. */}
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    className="zx-logo-set"
                    aria-hidden={copy === 1 || undefined}
                  >
                    {PLATFORM_ORDER.map((id) => {
                      const platform = PLATFORMS[id]
                      return (
                        <li key={platform.id}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={platform.icon || '/placeholder.svg'}
                            alt={copy === 0 ? platform.name : ''}
                            width={44}
                            height={44}
                            loading="lazy"
                            decoding="async"
                          />
                        </li>
                      )
                    })}
                  </ul>
                ))}
              </div>
            </div>
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
                {/* The rival row is reference, not headline: its label and its
                    price share one quiet 13px treatment, so the only large
                    number in the card is ours. */}
                <div className="zx-compare-head">
                  <dt className="zx-compare-name zx-compare-name--rival">
                    {price.rivalLabel}
                  </dt>
                  <dd className="zx-compare-amount zx-compare-amount--rival">
                    {price.rivalValue}
                  </dd>
                </div>
                <div className="zx-compare-track" aria-hidden="true">
                  <div className="zx-compare-fill zx-compare-fill--rival" />
                </div>
              </div>
            </dl>
          </li>

          <li className="zx-about-card">
            <p className="zx-about-label">{viewing.label}</p>
            {/* Three equal columns, badge over label. Icons are the industry's
                own marks (a 4K plate, a surround-sound speaker), so the claim is
                recognized before it is read. Decorative by design: each label
                already states its spec, so announcing the glyph too would only
                double up for screen readers. */}
            <ul className="zx-about-specs">
              {VIEWING_SPECS.map((spec) => (
                <li key={spec.id} className="zx-spec">
                  <md-icon aria-hidden="true">{spec.icon}</md-icon>
                  <span className="zx-spec-label">{viewing.specs[spec.id]}</span>
                </li>
              ))}
            </ul>
          </li>

          {/* Centered, unlike the other three: this is the card the section
              resolves into, and it sits directly above the centered install
              button — so centering it lets the chip, the offer, the caveat and
              the CTA share one axis straight down to the tap target. */}
          <li className="zx-about-card zx-about-card--centered">
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
