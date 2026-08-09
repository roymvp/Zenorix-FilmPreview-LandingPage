'use client'

import { useEffect, useRef } from 'react'
import { useConversion } from '@/components/landing/conversion-provider'
import { DownloadCta } from '@/components/landing/download-cta'

/**
 * Subscribes to a custom element's `closed` event.
 *
 * `<md-dialog onclosed={fn}>` does NOT work and was silently dead: React sets
 * unknown props on custom elements as PROPERTIES, and assigning `.onclosed`
 * only registers a listener for standardised `on*` handlers — which `closed`,
 * being Material's own event, is not. So dismissals never reached the provider
 * and state stayed non-null, latching the sheet shut after one open.
 * Custom-element events have to be wired with a real `addEventListener`.
 */
function useClosedEvent(
  ref: React.RefObject<HTMLElement | null>,
  onClosed: () => void,
) {
  // Kept in a ref so re-renders don't detach and re-attach the listener.
  const handler = useRef(onClosed)
  handler.current = onClosed

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const listener = () => handler.current()
    node.addEventListener('closed', listener)
    return () => node.removeEventListener('closed', listener)
  }, [ref])
}

/* Material's own easings, inlined rather than imported from
   `@material/web/internal/motion/animation.js` so this doesn't depend on an
   internal path that can move between releases. */
const EMPHASIZED = 'cubic-bezier(0.2, 0, 0, 1)'
const EMPHASIZED_ACCELERATE = 'cubic-bezier(0.3, 0, 0.8, 0.15)'

/**
 * Bottom-sheet open/close animations.
 *
 * md-dialog's defaults are built for a centered dialog: it enters by sliding
 * DOWN from `translateY(-50px)` and grows its container from 35% height. On a
 * sheet pinned to the bottom edge that reads as dropping in from above — the
 * opposite of the intended gesture — so both are replaced with a straight
 * translate off the bottom edge.
 *
 * `getOpenAnimation`/`getCloseAnimation` are assigned as instance fields in
 * md-dialog's constructor, so overriding them per element is a supported
 * customization point rather than a prototype patch.
 *
 * The scrim keyframes are kept because they're the component's own fade, and
 * dropping them would make the backdrop pop in instantly.
 */
const SHEET_OPEN_ANIMATION = {
  dialog: [
    [
      [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
      { duration: 420, easing: EMPHASIZED },
    ],
  ],
  scrim: [
    [[{ opacity: 0 }, { opacity: 0.32 }], { duration: 420, easing: 'linear' }],
  ],
}

const SHEET_CLOSE_ANIMATION = {
  dialog: [
    [
      [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
      { duration: 240, easing: EMPHASIZED_ACCELERATE },
    ],
  ],
  scrim: [
    [[{ opacity: 0.32 }, { opacity: 0 }], { duration: 240, easing: 'linear' }],
  ],
}

/** Element shape for the two animation hooks md-dialog exposes as fields. */
type AnimatableDialog = HTMLElement & {
  getOpenAnimation?: () => unknown
  getCloseAnimation?: () => unknown
}

/**
 * Swaps in the slide-from-bottom animations.
 *
 * Honors `prefers-reduced-motion` by handing back empty animation maps, which
 * md-dialog treats as "nothing to animate" — the sheet then simply appears.
 * Material does not check this itself, so without it the translate always runs.
 */
function useSheetAnimation(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current as AnimatableDialog | null
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const apply = () => {
      node.getOpenAnimation = () =>
        reduced.matches ? {} : SHEET_OPEN_ANIMATION
      node.getCloseAnimation = () =>
        reduced.matches ? {} : SHEET_CLOSE_ANIMATION
    }

    // Must wait for the element to upgrade. MaterialWebLoader registers the
    // definitions from a dynamic `import()` inside an effect, so on first paint
    // `md-dialog` is still an unknown element — assigning now would be undone
    // moments later when the constructor runs and re-assigns its own
    // `getOpenAnimation`/`getCloseAnimation` fields. `whenDefined` resolves
    // after `define()` has upgraded the in-document elements, so the assignment
    // lands last and sticks. (Verified: without this the sheet kept animating
    // with Material's default translateY(-50px), i.e. in from the top.)
    let cancelled = false
    customElements.whenDefined('md-dialog').then(() => {
      if (cancelled) return
      apply()
      reduced.addEventListener('change', apply)
    })

    return () => {
      cancelled = true
      reduced.removeEventListener('change', apply)
    }
  }, [ref])
}

export type DialogCopy = {
  heading: string
  body: string
  bullets: string[]
  cta: string
  ctaMeta: string
}

/**
 * The one modal on the site: the locked-title upsell sheet, fired from the Top 10
 * rail.
 *
 * Mounted once at page level rather than per card, so the page has a single modal
 * layer, and driven purely by conversion context state.
 *
 * It adds no close button — md-dialog light-dismisses on a scrim click and on
 * Escape, both of which arrive as the same `closed` event the provider listens
 * for.
 */
export function ConversionDialog({ copy }: { copy: DialogCopy }) {
  const { content, closeContent } = useConversion()

  const contentRef = useRef<HTMLElement | null>(null)

  // The ONLY dismissal route, and it covers both gestures: md-dialog fires
  // `closed` after an outside/scrim click and after Escape, so this single
  // listener resets the provider state either way.
  useClosedEvent(contentRef, closeContent)
  useSheetAnimation(contentRef)

  return (
    <md-dialog
      ref={contentRef}
      className="zx-dialog"
      open={content !== null}
      aria-label={copy.heading}
    >
      <div slot="headline" className="zx-dialog-headline">
        <strong className="zx-dialog-title">{copy.heading}</strong>
      </div>

      {/* A plain div, not a `<form method="dialog">`. The form only existed so
          a Close button could submit it via `form="…"`, but React assigns that
          prop as a PROPERTY on the custom element and Material's buttons
          expose `form` as getter-only — it threw "Cannot set property form of
          #<Button> which has only a getter" and the association never
          happened. An explicit onClick is both simpler and actually works. */}
      <div slot="content" className="zx-dialog-content">
        {/* The art the visitor just clicked, DESKTOP ONLY (`.zx-dialog-art` is
            `display: none` below the desktop tier). On a 420px sheet there is no
            room for it beside the bullets and no reason to push the CTA a poster's
            height further down; on a 720px centred dialog it is what makes the
            modal read as belonging to the card that opened it instead of as a
            generic interstitial.

            aria-hidden + alt="": the dialog is already named by the heading, and
            the title of the locked film is not information the sheet is making a
            claim about — repeating it here would announce the same string twice.
            Rendered only when a card is open so the <img> never holds the previous
            title's art while the sheet animates away.
            eslint-disable — the chart tiles are pre-sized 2:3 WebP built by
            scripts/build-poster-tiles.mjs, already in cache from the rail. */}
        {content ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="zx-dialog-art"
            src={content.poster}
            alt=""
            width={420}
            height={630}
            aria-hidden="true"
            decoding="async"
          />
        ) : null}

        <div className="zx-dialog-body">
          <p className="zx-dialog-lead">{copy.body}</p>
          <ul className="zx-dialog-bullets">
            {copy.bullets.map((bullet) => (
              <li key={bullet}>
                <md-icon aria-hidden="true">check</md-icon>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div slot="actions" className="zx-dialog-actions">
        {/* A FIXED string, not `content_lock:${content.title}` as it was before
            analytics was wired up. `source` becomes a group-by key in the Web
            Analytics dashboard, so interpolating the title turned the one number
            that matters here — how well the locked-content modal converts
            compared to the hero, footer and final CTA — into one sparse row per
            title, none of them comparable to anything.

            The title is not lost: `modal_view` reports it, and it necessarily
            fires before any click in here, so title-level interest is still
            answerable. Note the 2-property ceiling on Pro means it cannot simply
            be added here as a second property either — `apk_download_click`
            already carries `source` + `version`. */}
        <DownloadCta label={copy.cta} sub={copy.ctaMeta} source="content_lock" autoFocus />
      </div>
    </md-dialog>
  )
}
