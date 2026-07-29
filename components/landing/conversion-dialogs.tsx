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
  backdrop,
}: {
  copy: DialogCopy
  /** Key art reused as the dialog header, keeping the cinematic frame intact. */
  backdrop: string
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
            <img src={backdrop} alt="" />
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
