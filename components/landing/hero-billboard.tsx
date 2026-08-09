import { DownloadCta } from '@/components/landing/download-cta'
import { StoreRow } from '@/components/landing/store-row'
import { posterWalls } from '@/lib/content/poster-wall'
import { fill } from '@/lib/i18n/dictionaries'

/**
 * Brand hero: a tilted wall of key art, a scrim, and the pitch on top.
 *
 * This replaced an embedded preview player. The site is a brand site now, so the
 * hero states what Zenorix IS — the catalogue, the price, one install
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
  stores,
}: {
  /** The page's single <h1>. */
  headline: string
  /** Headline price, e.g. "$1.25/MONTH" — the hero's one number. */
  price: string
  /** One short line of risk reduction under the price. */
  priceNote: string
  cta: string
  ctaMeta: string
  /**
   * Copy for the two not-yet-shipped store builds. `unavailable` is a template
   * taking `{store}`; it exists so the screen-reader sentence is one translatable
   * string per locale rather than being concatenated from a name plus a badge,
   * which would not reorder correctly in every language.
   */
  stores: {
    upcoming: string
    ios: string
    googlePlay: string
    unavailable: string
  }
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
                       it is eager and only it competes for early bandwidth. The
                       other two are lazy and cost nothing extra anyway — all
                       three layers draw from the same six files, so by the time
                       one fades in the bytes are already cached. */
                    loading={layer === 0 ? 'eager' : 'lazy'}
                    fetchPriority={layer === 0 ? 'high' : 'low'}
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
        {/* id: the hero <section> names itself from this heading via
            aria-labelledby, so the landmark announces the pitch. */}
        <h1 id="zx-hero-headline" className="zx-hero-headline">
          {headline}
        </h1>

        {/* NOTE: the 172px brand lockup sat between the headline and the price.
            Removed deliberately: the headline now names the networks it sells,
            which is the actual pitch, and a logo repeated 60px under the top
            bar's own mark spent the hero's most valuable vertical space saying
            the brand name a second time. The bar carries brand identity; the
            hero carries the offer. */}
        <p className="zx-hero-price">
          {price}
          <span className="zx-hero-price-note">{priceNote}</span>
        </p>

        <DownloadCta label={cta} sub={ctaMeta} source="hero" />

        {/* Below the APK button, not beside it: only one of the three platforms
            actually ships today, so they are not peers. See StoreRow for why
            these are static text rather than disabled buttons. */}
        <StoreRow
          upcomingLabel={stores.upcoming}
          stores={[
            {
              id: 'ios',
              name: stores.ios,
              icon: '/brand/apple.svg',
              srLabel: fill(stores.unavailable, { store: stores.ios }),
            },
            {
              id: 'google-play',
              name: stores.googlePlay,
              icon: '/brand/google-play.svg',
              srLabel: fill(stores.unavailable, { store: stores.googlePlay }),
            },
          ]}
        />
      </div>
    </div>
  )
}
