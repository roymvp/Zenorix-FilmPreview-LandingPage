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
 * being Material's own event, is not. So dismissals never reached the provider,
 * state stayed non-null and the preview gate latched shut after one open.
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
  content: {
    eyebrow: string
    heading: string
    body: string
    bullets: string[]
    cta: string
    close: string
  }
  preview: {
    heading: string
    sub: string
    cta: string
    secondary: string
    close: string
  }
}

/**
 * Both upsell dialogs. They share one mount point so the page has exactly one
 * modal layer, and each is driven purely by conversion context state.
 */
export function ConversionDialogs({
  copy,
  previewFrame,
}: {
  copy: DialogCopy
  /**
   * The film's opening frame (`Movie.previewFrame`) — the same asset the player
   * uses as its poster, reused here as the sheet's header art so the upsell
   * reads as a continuation of the frame rather than a new screen. Landscape;
   * it is cropped with `object-fit: cover`.
   */
  previewFrame: string
}) {
  const {
    contentTitle,
    closeContent,
    previewReason,
    closePreview,
  } = useConversion()

  const contentRef = useRef<HTMLElement | null>(null)
  const previewRef = useRef<HTMLElement | null>(null)

  // Catches every dismissal route the dialog owns itself: scrim tap, Escape,
  // and the animated close that follows the Close button.
  useClosedEvent(contentRef, closeContent)
  useClosedEvent(previewRef, closePreview)

  useSheetAnimation(contentRef)
  useSheetAnimation(previewRef)

  return (
    <>
      {/* Locked-title dialog — fired from the Top 10 rail. */}
      <md-dialog
        ref={contentRef}
        className="zx-dialog"
        open={contentTitle !== null}
        aria-label={copy.content.heading}
      >
        <div slot="headline" className="zx-dialog-headline">
          <span className="zx-eyebrow md-typescale-label-small">
            <md-icon aria-hidden="true">lock_open</md-icon>
            {copy.content.eyebrow}
          </span>
          <strong className="md-typescale-headline-small">
            {copy.content.heading}
          </strong>
        </div>

        {/* A plain div, not a `<form method="dialog">`. The form only existed so
            the Close button could submit it via `form="…"`, but React assigns
            that prop as a PROPERTY on the custom element and `md-text-button`
            exposes `form` as getter-only — it threw "Cannot set property form of
            #<Button> which has only a getter" and the association never
            happened. An explicit onClick is both simpler and actually works. */}
        <div slot="content">
          <div className="zx-dialog-body">
            <p className="md-typescale-body-medium">{copy.content.body}</p>
            <ul className="zx-dialog-bullets">
              {copy.content.bullets.map((bullet) => (
                <li key={bullet}>
                  <md-icon aria-hidden="true">check_circle</md-icon>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div slot="actions" className="zx-dialog-actions">
          <DownloadCta
            label={copy.content.cta}
            source={`content_lock:${contentTitle ?? 'unknown'}`}
          />
          <md-text-button onClick={closeContent}>
            {copy.content.close}
          </md-text-button>
        </div>
      </md-dialog>

      {/* Preview-exhausted dialog — fired by the player at the 10-minute wall. */}
      <md-dialog
        ref={previewRef}
        className="zx-dialog"
        open={previewReason !== null}
        aria-label={copy.preview.heading}
      >
        <div slot="headline" className="zx-dialog-headline">
          <span className="zx-dialog-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* Decorative: the heading beside it already names the film, so alt
                text here would only repeat it for screen readers. */}
            <img src={previewFrame} alt="" />
          </span>
          <strong className="md-typescale-headline-small">
            {copy.preview.heading}
          </strong>
        </div>

        <div slot="content">
          <div className="zx-dialog-body">
            <p className="md-typescale-body-medium">{copy.preview.sub}</p>
          </div>
        </div>

        <div slot="actions" className="zx-dialog-actions">
          <DownloadCta
            label={copy.preview.cta}
            sub={copy.preview.secondary}
            source={`preview_gate:${previewReason ?? 'limit'}`}
          />
          <md-text-button onClick={closePreview}>
            {copy.preview.close}
          </md-text-button>
        </div>
      </md-dialog>
    </>
  )
}
