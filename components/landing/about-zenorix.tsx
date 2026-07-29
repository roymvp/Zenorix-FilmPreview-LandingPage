import type { CSSProperties } from 'react'

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
 * second background.
 *
 * CARD CONTRACT — every card obeys all four rules, which is what makes four
 * different kinds of content read as one set:
 *
 *   1. Exactly TWO slots: a filled pill chip, then ONE payload element. Cards that
 *      need several pieces (the trial's value + caveat) wrap them in a single
 *      payload element rather than adding a third slot to the card.
 *   2. ONE axis: left. The chip, the payload and the section title all start on the
 *      same line, so the eye tracks a single edge down the whole stack.
 *   3. ONE answer treatment: the card's headline figure uses `--zx-text-amount`
 *      wherever it appears. The price and the trial length are the same rank, so
 *      they are literally the same token — they used to be 20px and 22px.
 *   4. ONE joint ladder, set in CSS and shared by every payload: 8px binds a thing
 *      to its own caption/track/glyph, 12px separates sibling rows, 16px separates
 *      the chip from the payload.
 *
 * Heights still differ between cards, and that is not a defect being tolerated:
 * these are four different kinds of evidence, and padding a 1-line marquee out to
 * the height of a 2-row bar chart would add dead space, not order. Cohesion comes
 * from the shared skeleton above, not from forcing one height.
 *
 * The price card is the one content exception. A bare "$1.25/mo" has no anchor, so
 * it renders as a two-row comparison against the subscription stack it replaces —
 * the bars make the gap legible before either number is read. It still obeys all
 * four contract rules.
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
  // The rival bar is always full, so our bar is our share of its cost. The 30%
  // floor is what makes the label fit inside the bar: at the real US ratio
  // (1.25 / 80 = 1.6%) the bar is a few pixels wide, and even at a legibility-only
  // minimum it could not hold the word "Zenorix".
  //
  // Worth being clear-eyed about the trade: this draws a ~1/64 price as ~1/3 of
  // the bar, so the bars now read as "much cheaper" rather than as a measurable
  // ratio. The exact figures beside them carry the real magnitude, which is why
  // both are stated in full and at the same size. It stays a floor rather than a
  // multiplier, so a market where the true ratio is larger is drawn at its own
  // honest value instead of being scaled.
  const ourShare = Math.max(30, (price.ourAmount / price.rivalAmount) * 100)

  return (
    // Tighter than the shared section rhythm: four cards plus a CTA is the
    // longest stack on the page, and the whole argument only works if it can be
    // taken in at once. The modifier keeps that compression local so the other
    // sections keep the page's normal breathing room.
    <section
      className="zx-section zx-section--about"
      aria-labelledby="zx-about-heading"
    >
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
                becomes a saving. Each row is "name above, then price ─ bar", so
                the two costs sit in one column the eye can compare directly and
                the bars carry the gap pre-attentively.

                Each name sits INSIDE its own bar, which is why the bar is the
                `dt`: the term is the plan, drawn as the bar that represents it,
                and the `dd` beside it is what that plan costs. Keeping `dt`/`dd`
                as direct children of the grid is what lets one grid own both rows,
                so every price shares a column and both bars share a start edge.

                Each figure carries its own "/mo" rather than deferring to a caption
                under the chart. The caption was accurate but cost 34px of card
                height for one line of text, which made this card visibly taller
                than its three neighbours — and the unit is only four characters, so
                repeating it is cheaper than explaining it. */}
            <dl className="zx-compare">
              {/* The share sizes the bar via a variable rather than a plain width,
                  so the CSS can hold it against `max-content` and stop a narrow
                  card from cropping the label inside. */}
              <dt
                className="zx-compare-bar zx-compare-bar--ours"
                style={{ '--zx-bar-share': `${ourShare}%` } as CSSProperties}
              >
                <span className="zx-compare-name zx-compare-name--ours">
                  {price.ourLabel}
                </span>
              </dt>
              <dd className="zx-compare-amount zx-compare-amount--ours">
                {price.value}
              </dd>

              <dt className="zx-compare-bar zx-compare-bar--rival">
                <span className="zx-compare-name">{price.rivalLabel}</span>
              </dt>
              <dd className="zx-compare-amount zx-compare-amount--rival">
                {price.rivalValue}
              </dd>
            </dl>
          </li>

          <li className="zx-about-card">
            <p className="zx-about-label">{viewing.label}</p>
            {/* Three equal tiles side by side, each with its badge over its label
                and both left-aligned to the tile's own edge. Icons are the
                industry's own marks (a 4K plate, a surround-sound speaker), so the
                claim is recognized before it is read. Decorative by design: each
                label already states its spec, so announcing the glyph too would
                only double up for screen readers. */}
            <ul className="zx-about-specs">
              {VIEWING_SPECS.map((spec) => (
                <li key={spec.id} className="zx-spec">
                  <md-icon aria-hidden="true">{spec.icon}</md-icon>
                  <span className="zx-spec-label">{viewing.specs[spec.id]}</span>
                </li>
              ))}
            </ul>
          </li>

          {/* Same chip-then-payload shape as the other three. This card used to be
              the odd one out: centered, and three children instead of two. The
              centering was justified by "it shares an axis with the install button",
              but the button is a full-width pill whose box starts at the same left
              edge as the cards — the section's real axis is left, which is where the
              title and all four chips already sit. So centering only this card made
              the reading axis jump on the last row.

              Wrapping the value and its caveat in one payload element is what lets
              the axis come back: the card is now chip + payload like its siblings, and
              the value/caveat joint is set by `.zx-about-offer` instead of by a
              negative margin fighting the card's own gap. */}
          <li className="zx-about-card">
            <p className="zx-about-label">{trial.label}</p>
            <div className="zx-about-offer">
              <p className="zx-about-value">{trial.value}</p>
              <p className="zx-about-note">{trial.note}</p>
            </div>
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
