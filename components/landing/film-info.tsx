import { DownloadCta } from '@/components/landing/download-cta'
import { PlatformStrip } from '@/components/landing/platform-strip'

/**
 * The film's identity block, directly below the player.
 *
 * This is the ONLY place the title, specs, genres and synopsis appear — the
 * player frame is left clean and there is no second "about this film" section
 * repeating the same facts further down the page.
 */
export function FilmInfo({
  title,
  releaseYear,
  runtimeMinutes,
  qualityTags,
  synopsis,
  genres,
  cta,
  ctaSub,
  stripLabel,
}: {
  title: string
  releaseYear: number
  runtimeMinutes: number
  /** 4K / HDR / Dolby-style specs, shown inline with year and runtime. */
  qualityTags: string[]
  synopsis: string
  genres: string[]
  cta: string
  ctaSub: string
  stripLabel: string
}) {
  const hours = Math.floor(runtimeMinutes / 60)
  const minutes = runtimeMinutes % 60

  return (
    <section className="zx-info" id="zx-details" aria-labelledby="zx-info-heading">
      <div className="zx-shell">
        <h1 id="zx-info-heading" className="zx-film-title">
          {title}
        </h1>

        <p className="zx-film-meta">
          <span>{releaseYear}</span>
          <span className="zx-dot" aria-hidden="true" />
          <span>
            {hours}h {minutes}m
          </span>
          {qualityTags.map((tag) => (
            <span key={tag} className="zx-tag">
              {tag}
            </span>
          ))}
        </p>

        <ul className="zx-genres">
          {genres.map((genre) => (
            <li key={genre} className="zx-genre">
              {genre}
            </li>
          ))}
        </ul>

        <p className="zx-synopsis md-typescale-body-medium">{synopsis}</p>

        <DownloadCta label={cta} sub={ctaSub} source="film_info" icon="android" />

        <PlatformStrip label={stripLabel} />
      </div>
    </section>
  )
}
