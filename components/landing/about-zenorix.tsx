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
    /** Row 1: who we are, and our monthly price — formatted WITHOUT a unit. */
    ourLabel: string
    value: string
    /** Row 2: the rival stack, and its combined cost, also unit-less. */
    rivalLabel: string
    rivalValue: string
    /** Comparison marker between the two names on the key line. */
    vs: string
    /**
     * The unit both figures share ("per month"). Shown once on the key line instead
     * of being repeated inside each bar, which is what lets our bar get shorter, and
     * re-attached to each price for screen readers only.
     */
    perMonth: string
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
  // The rival bar is always full, so our bar is our share of its cost.
  //
  // 8%, down from 24% -> 33% -> 38%. Every earlier floor was TEXT-BOUND rather than
  // data-bound: the price used to sit inside the bar, so the bar could never be narrower
  // than that price plus its padding, and 24% was simply the width of "R$ 6,20" at the
  // 390px breakpoint. The figure has now moved OUT of the bar into its own column, which
  // removes that constraint entirely — the bar no longer has to hold anything, so it is
  // free to be as short as the data.
  //
  // What remains is a PERCEPTUAL floor, and it is much smaller: below roughly 8% of the
  // track the bar is under 20px and its 4px end radii start consuming the length being
  // compared, so it reads as a dot rather than as a short bar.
  //
  // The gain in honesty is the point. The real ratios are 3.1% (US), 4.3% (TH) and 4.1%
  // (BR), so 8% now overstates our cost by about 2x, where 24% overstated it by 6-8x.
  // It stays a floor rather than a multiplier, so any market whose true ratio exceeds 8%
  // is drawn at its own honest value instead of being scaled up to meet it.
  //
  // The residual distortion is still worth being clear-eyed about: the bars say "much
  // cheaper", not "exactly this many times cheaper". The exact figures beside them carry
  // the real magnitude, which is why both are stated in full and at the same size.
  const ourShare = Math.max(8, (price.ourAmount / price.rivalAmount) * 100)

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
                becomes a saving.

                ONE key line, then two bare bars. The key names both series, marks them as
                a comparison with "vs", keys each one to its bar by COLOR, and declares the
                shared unit once at the end. Stating the unit here rather than inside each
                figure is what stopped it constraining the bar geometry. */}
            <p className="zx-compare-key" aria-hidden="true">
              {/* Swatches key by COLOR at a shared size, replacing a short-chip/long-chip
                  pair that keyed by length. Length-keying only existed because the two
                  bars were identical in hue, which left length as the sole available
                  signal — and it was the weaker mechanism: the reader had to compare two
                  chips against each other, and at 8px vs 20px inside a caption line that
                  is a subtle judgement. Color is matched at a glance and, unlike length,
                  stays unambiguous now that our bar is only 8% of the track — a
                  proportional mini-bar for it would be a 3px speck.

                  The tradeoff accepted in exchange: the bars now differ in two ways at
                  once (length and hue), so hue carries no quantity of its own. It reads as
                  series identity, which is the standard convention for a two-series
                  chart. */}
              <span className="zx-compare-key-item zx-compare-key-item--ours">
                <span className="zx-compare-key-swatch zx-compare-key-swatch--ours" />
                {price.ourLabel}
              </span>
              {/* States the relationship the chart depends on. Without it the card shows
                  two named plans with two prices, and a reader skimming has to infer
                  that the second is the alternative being replaced rather than, say, a
                  second Zenorix tier or an add-on. */}
              <span className="zx-compare-vs">{price.vs}</span>
              <span className="zx-compare-key-item">
                <span className="zx-compare-key-swatch zx-compare-key-swatch--rival" />
                {price.rivalLabel}
              </span>
              {/* The axis unit, stated once for both bars. */}
              <span className="zx-compare-unit">{price.perMonth}</span>
            </p>

            {/* The whole key line above is `aria-hidden`: it is a VISUAL key, and its
                swatch-length convention means nothing read aloud. The real semantics
                live here instead — each name is a `dt` and its bar the `dd`, so a screen
                reader gets "Zenorix, $1.25 per month" as a proper term/definition pair.
                The names are visually hidden rather than absent so nothing is announced
                twice, and each price re-attaches the unit for the same reason.

                Keeping `dt`/`dd` as direct children of one `dl` is what lets a single
                grid own both rows, so the two bars are measured against the same track
                rather than each against its own container. */}
            <dl className="zx-compare">
              <dt className="zx-visually-hidden">{price.ourLabel}</dt>
              {/* Bar and price are now SIBLINGS in two columns, where the price used to
                  sit inside the bar. That is what frees the bar to shrink: its length no
                  longer has to accommodate any text (see `ourShare`).

                  The `dd` is the row, so the price stays inside the definition it belongs
                  to. The bar is an empty `span` — a pure visual encoding of the number
                  next to it, with nothing for a screen reader to read. */}
              <dd className="zx-compare-row">
                {/* The share sizes the bar via a variable rather than a plain width, so
                    the CSS keeps the ratio in one place. */}
                <span
                  className="zx-compare-bar zx-compare-bar--ours"
                  style={{ '--zx-bar-share': `${ourShare}%` } as CSSProperties}
                />
                <span className="zx-compare-amount">{price.value}</span>
                <span className="zx-visually-hidden"> {price.perMonth}</span>
              </dd>

              <dt className="zx-visually-hidden">{price.rivalLabel}</dt>
              <dd className="zx-compare-row">
                <span className="zx-compare-bar zx-compare-bar--rival" />
                <span className="zx-compare-amount">{price.rivalValue}</span>
                <span className="zx-visually-hidden"> {price.perMonth}</span>
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
