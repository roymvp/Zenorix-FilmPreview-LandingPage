import { DownloadCta } from '@/components/landing/download-cta'

/** Last screen before the footer: back to the film, back to the one action. */
export function FinalCta({
  backdrop,
  heading,
  body,
  cta,
  meta,
  badges,
}: {
  backdrop: string
  heading: string
  body: string
  cta: string
  meta: string
  badges: string[]
}) {
  return (
    <section className="zx-section zx-final" aria-labelledby="zx-final-heading">
      <div className="zx-final-art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backdrop} alt="" loading="lazy" />
      </div>

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
