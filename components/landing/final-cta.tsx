import { DownloadCta } from '@/components/landing/download-cta'

/**
 * Last screen before the footer: back to the one action.
 *
 * Stripped to the button plus its APK meta line. The headline went too — by
 * this point the page has stated the offer four times, so a fifth restatement
 * only put scroll between the visitor and the install. The section keeps a
 * screen-reader-only heading so the document outline and landmark name survive.
 *
 * Deliberately NOT a dark art panel. The page has exactly one background color
 * (the page surface) and one media area (the player at the top), so this
 * section carries no backdrop image, tint or gradient of its own.
 */
export function FinalCta({
  srHeading,
  cta,
  meta,
}: {
  /** Visually hidden — see the note above. */
  srHeading: string
  cta: string
  meta: string
}) {
  return (
    <section className="zx-section zx-final" aria-labelledby="zx-final-heading">
      <div className="zx-shell zx-final-inner">
        <h2 id="zx-final-heading" className="zx-visually-hidden">
          {srHeading}
        </h2>

        <DownloadCta label={cta} sub={meta} source="final_cta" />
      </div>
    </section>
  )
}
