import { DownloadCta } from '@/components/landing/download-cta'
import { firstWallTiles, posterWalls } from '@/lib/content/poster-wall'

/**
 * Brand hero: a tilted wall of key art, a scrim, and the pitch on top.
 *
 * This replaced an embedded preview player. The site is a brand site now, so the
 * hero states what Zenorix IS — the catalogue, the logo, the price, one install
 * action — instead of playing one specific film. Nothing here is film-specific:
 * no title, no synopsis, no runtime.
 *
 * SERVER COMPONENT, and deliberately zero JavaScript. The "carousel" is three
 * stacked arrangements of the same six posters crossfading on a pure CSS cycle
 * (see `.zx-hero-wall-layer` in landing.css). A JS slider would mean shipping a
 * client component, an interval and hydration for something the visitor never
 * interacts with — and an interval that drifts from the CSS transition it drives.
 * The only interactive element in here is the install CTA, which is already a
 * client island of its own.
 */
export function HeroBillboard({
  headline,
  price,
  priceNote,
  cta,
  ctaMeta,
  brandAlt,
}: {
  /** The page's single <h1>. Two or three words per line reads best. */
  headline: string
  /** Headline price, e.g. "$1.25/MONTH" — the hero's one number. */
  price: string
  /** One short line of risk reduction under the price. */
  priceNote: string
  cta: string
  ctaMeta: string
  /** Accessible name for the logo lockup. */
  brandAlt: string
}) {
  return (
    <div className="zx-hero-billboard">
      {/* Decorative by definition: these are catalogue thumbnails standing in for
          "there is a lot to watch", and the headline beside them already says so.
          Twelve alt strings here would be twelve pieces of noise for a screen
          reader. `aria-hidden` on the wrapper covers every tile at once. */}
      <div className="zx-hero-wall" aria-hidden="true">
        {posterWalls.map((columns, layer) => (
          <div
            key={layer}
            className="zx-hero-wall-layer"
            style={{
              /* Negative offsets into a single shared 18s cycle, so layer 0 is
                 the one visible at t=0 and each other layer is already past its
                 own visible window. A POSITIVE stagger would leave every layer
                 showing its opening keyframe (opacity 1) until its delay
                 elapsed, i.e. all three visible at once on first paint. */
              ['--zx-wall-delay' as string]: `-${((3 - layer) % 3) * 6}s`,
            }}
          >
            {columns.map((tiles, column) => (
              <div key={column} className="zx-hero-wall-column">
                {tiles.map((src, row) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${src}-${row}`}
                    className="zx-hero-tile"
                    src={src || '/placeholder.svg'}
                    alt=""
                    width={420}
                    height={630}
                    /* Only the first layer is on screen at first paint, so only
                       it is eager. The other two are fetched lazily and are
                       already cached by then anyway — every layer draws from the
                       same six files. */
                    loading={layer === 0 ? 'eager' : 'lazy'}
                    fetchPriority={
                      layer === 0 && firstWallTiles.includes(src) ? 'high' : 'low'
                    }
                    decoding="async"
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Two jobs, one element: darkens the art enough for white text to clear AA
          over ANY tile, and fades the wall into the page's black canvas at the
          bottom edge so the hero has no hard seam. */}
      <div className="zx-hero-scrim" aria-hidden="true" />

      <div className="zx-hero-copy">
        <h1 className="zx-hero-headline">{headline}</h1>

        {/* The lockup, not a text wordmark: the brand mark is the hero's
            signature element and the one place the logo is shown at size.
            eslint-disable — next/image would add a client-side loader for a
            fixed-size, already-optimized PNG. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="zx-hero-lockup"
          src="/brand/zenorix-lockup.png"
          alt={brandAlt}
          width={640}
          height={596}
        />

        <p className="zx-hero-price">
          {price}
          <span className="zx-hero-price-note">{priceNote}</span>
        </p>

        <DownloadCta label={cta} sub={ctaMeta} source="hero" />
      </div>
    </div>
  )
}
