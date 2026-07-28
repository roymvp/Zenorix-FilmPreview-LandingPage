'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import { DownloadCta } from '@/components/landing/download-cta'

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

  return (
    <>
      {/* Locked-title dialog — fired from the Top 10 rail. */}
      <md-dialog
        className="zx-dialog"
        open={contentTitle !== null}
        onclosed={closeContent}
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

        <form slot="content" id="zx-content-form" method="dialog">
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
        </form>

        <div slot="actions" className="zx-dialog-actions">
          <DownloadCta
            label={copy.content.cta}
            source={`content_lock:${contentTitle ?? 'unknown'}`}
          />
          <md-text-button form="zx-content-form" value="close">
            {copy.content.close}
          </md-text-button>
        </div>
      </md-dialog>

      {/* Preview-exhausted dialog — fired by the player at the 10-minute wall. */}
      <md-dialog
        className="zx-dialog"
        open={previewReason !== null}
        onclosed={closePreview}
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

        <form slot="content" id="zx-preview-form" method="dialog">
          <div className="zx-dialog-body">
            <p className="md-typescale-body-medium">{copy.preview.sub}</p>
          </div>
        </form>

        <div slot="actions" className="zx-dialog-actions">
          <DownloadCta
            label={copy.preview.cta}
            sub={copy.preview.secondary}
            source={`preview_gate:${previewReason ?? 'limit'}`}
          />
          <md-text-button form="zx-preview-form" value="close">
            {copy.preview.close}
          </md-text-button>
        </div>
      </md-dialog>
    </>
  )
}
