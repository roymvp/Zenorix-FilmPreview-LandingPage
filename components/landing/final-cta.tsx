import { DownloadCta } from '@/components/landing/download-cta'

/**
 * Last screen before the footer: back to the one action.
 *
 * Stripped to a headline plus the button. The body paragraph and the trust
 * badges repeated claims the page has already made three times by this point,
 * so they only added scroll between the visitor and the install.
 *
 * Deliberately NOT a dark art panel. The page has exactly one background color
 * (the page surface) and one media area (the player at the top), so this
 * section carries no backdrop image, tint or gradient of its own.
 */
export function FinalCta({
  heading,
  cta,
  meta,
}: {
  heading: string
  cta: string
  meta: string
}) {
  return (
    <section className="zx-section zx-final" aria-labelledby="zx-final-heading">
      <div className="zx-shell zx-final-inner">
        <h2 id="zx-final-heading" className="md-typescale-headline-large">
          {heading}
        </h2>

        <DownloadCta label={cta} sub={meta} source="final_cta" />
      </div>
    </section>
  )
}
