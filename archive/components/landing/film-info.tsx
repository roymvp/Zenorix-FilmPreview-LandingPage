import { FilmSynopsis } from '@/components/landing/film-synopsis'

/** Genre chips shown in the metadata row. More than two wraps the line. */
const MAX_GENRES = 2

/**
 * The film's identity block, directly below the player.
 *
 * This is the ONLY place the title, specs, genres and synopsis appear — the
 * player frame is left clean and there is no second "about this film" section
 * repeating the same facts further down the page.
 *
 * Deliberately has NO install button: the first ask now comes after the Top 10
 * and the About section have given the reader a reason to say yes.
 */
export function FilmInfo({
  title,
  releaseYear,
  runtimeMinutes,
  qualityTags,
  synopsis,
  genres,
  expandLabel,
  collapseLabel,
}: {
  title: string
  releaseYear: number
  runtimeMinutes: number
  /** 4K / Dolby-style specs, shown inline after the genres. */
  qualityTags: string[]
  synopsis: string
  /**
   * Full localized genre list. Only the first MAX_GENRES are displayed; the
   * complete list is still emitted in the JSON-LD `genre` field, so trimming
   * here is a layout choice and costs nothing in SEO.
   */
  genres: string[]
  /** Labels for the synopsis show-more / show-less toggle. */
  expandLabel: string
  collapseLabel: string
}) {
  const hours = Math.floor(runtimeMinutes / 60)
  const minutes = runtimeMinutes % 60

  return (
    <section className="zx-info" id="zx-details" aria-labelledby="zx-info-heading">
      <div className="zx-shell">
        <h1 id="zx-info-heading" className="zx-film-title">
          {title}
        </h1>

        {/* One line, in reading order: year, runtime, genre, then A/V specs. */}
        <p className="zx-film-meta">
          <span>{releaseYear}</span>
          <span className="zx-dot" aria-hidden="true" />
          <span>
            {hours}h {minutes}m
          </span>
          <span className="zx-dot" aria-hidden="true" />
          {genres.slice(0, MAX_GENRES).map((genre) => (
            <span key={genre} className="zx-genre">
              {genre}
            </span>
          ))}
          {qualityTags.map((tag) => (
            <span key={tag} className="zx-tag">
              {tag}
            </span>
          ))}
        </p>

        <FilmSynopsis
          text={synopsis}
          expandLabel={expandLabel}
          collapseLabel={collapseLabel}
        />
      </div>
    </section>
  )
}
