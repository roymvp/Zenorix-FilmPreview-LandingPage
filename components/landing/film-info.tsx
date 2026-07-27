import { DownloadCta } from '@/components/landing/download-cta'
import { PlatformStrip } from '@/components/landing/platform-strip'

/**
 * The first thing below the fold: enough about the film to justify the install,
 * then the CTA. Kept short on purpose — this is a conversion step, not a wiki.
 */
export function FilmInfo({
  heading,
  title,
  poster,
  posterAlt,
  synopsis,
  genres,
  cta,
  ctaSub,
  stripLabel,
}: {
  heading: string
  title: string
  poster: string
  posterAlt: string
  synopsis: string
  genres: string[]
  cta: string
  ctaSub: string
  stripLabel: string
}) {
  return (
    <section className="zx-info" id="zx-details" aria-labelledby="zx-info-heading">
      <div className="zx-shell">
        <div className="zx-info-grid">
          <div className="zx-info-poster">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt={posterAlt} />
          </div>

          <div className="zx-info-body">
            <div>
              <span className="zx-eyebrow md-typescale-label-small">
                <md-icon aria-hidden="true">movie</md-icon>
                {heading}
              </span>
              <h2
                id="zx-info-heading"
                className="md-typescale-headline-medium"
                style={{ marginBlockStart: 6 }}
              >
                {title}
              </h2>
            </div>

            <ul className="zx-genres" aria-label={heading}>
              {genres.map((genre) => (
                <li key={genre} className="zx-genre">
                  {genre}
                </li>
              ))}
            </ul>

            <p className="zx-synopsis md-typescale-body-large">{synopsis}</p>

            <DownloadCta label={cta} sub={ctaSub} source="film_info" icon="android" />
          </div>
        </div>

        <PlatformStrip label={stripLabel} />
      </div>
    </section>
  )
}
