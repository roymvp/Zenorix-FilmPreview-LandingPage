import { DownloadCta } from '@/components/landing/download-cta'

/**
 * Last screen before the footer: back to the one action.
 *
 * Deliberately NOT a dark art panel. The page has exactly one background color
 * (the page surface) and one media area (the player at the top), so this
 * section carries no backdrop image, tint or gradient of its own.
 */
export function FinalCta({
  heading,
  body,
  cta,
  meta,
  badges,
}: {
  heading: string
  body: string
  cta: string
  meta: string
  badges: string[]
}) {
  return (
    <section className="zx-section zx-final" aria-labelledby="zx-final-heading">
      <div className="zx-shell zx-final-inner">
        <h2 id="zx-final-heading" className="md-typescale-headline-large">
          {heading}
        </h2>
        <p className="md-typescale-body-large">{body}</p>

        <DownloadCta label={cta} sub={meta} source="final_cta" />

        <ul className="zx-badges">
          {badges.map((badge) => (
            <li key={badge} className="zx-badge">
              <md-icon aria-hidden="true">shield</md-icon>
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
