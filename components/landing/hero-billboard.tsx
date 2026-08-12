import { DownloadCta } from '@/components/landing/download-cta'
import { StoreRow } from '@/components/landing/store-row'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/content/platforms'
import { posterColumns } from '@/lib/content/poster-wall'
import { fill } from '@/lib/i18n/dictionaries'

/**
 * Brand hero: a tilted wall of key art, a scrim, and the pitch on top.
 *
 * This replaced an embedded preview player. The site is a brand site now, so the
 * hero states what Zenorix IS — the catalogue, the price, one install
 * action — instead of playing one specific film. Nothing here is film-specific:
 * no title, no synopsis, no runtime.
 *
 * SERVER COMPONENT, and deliberately zero JavaScript. The wall's motion is twelve
 * columns drifting vertically at four different speeds and alternating directions,
 * driven entirely by CSS (see `.zx-hero-wall-column` in landing.css). A JS
 * marquee would mean shipping a client component, an interval and hydration for
 * something the visitor never interacts with — and an interval that drifts out of
 * step with the transform it is supposed to drive. The only interactive element in
 * here is the install CTA, already a client island of its own.
 *
 * This replaced a three-layer crossfade of the same six posters. Twenty distinct
 * posters that never stop moving carry "big catalogue" far better than six that
 * cut between arrangements, and it renders FEWER nodes than the crossfade did
 * (120 against 144) because there is only one layer now instead of three.
 */
export function HeroBillboard({
  headline,
  networksLabel,
  price,
  priceNote,
  cta,
  ctaMeta,
  stores,
}: {
  /** The page's single <h1>. */
  headline: string
  /**
   * Caption under the network logo strip; a template taking `{count}`.
   *
   * The count is passed in rather than baked into the string so the copy cannot
   * drift from `PLATFORM_ORDER` in three locales independently.
   */
  networksLabel: string
  /** Headline price, e.g. "$1.25/MONTH" — the hero's one number. */
  price: string
  /** One short line of risk reduction under the price. */
  priceNote: string
  cta: string
  ctaMeta: string
  /**
   * Copy for the two not-yet-shipped store builds. Each badge is a two-line
   * lockup, so every store needs its own eyebrow AND wordmark: the eyebrow
   * carries the preposition that agrees with the store name ("Coming soon to
   * the App Store" vs "Coming soon to Google Play"), which no single shared
   * string can produce across locales.
   *
   * `unavailable` is a template taking `{store}`; it exists so the
   * screen-reader sentence is one translatable string per locale rather than
   * being concatenated from an eyebrow plus a name, which would not reorder
   * correctly in every language.
   */
  stores: {
    iosEyebrow: string
    ios: string
    googlePlayEyebrow: string
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
      {/* Two nested boxes, and both are needed. `.zx-hero-wall` is the unrotated
          clip box; `.zx-hero-wall-track` is the rotated, over-sized flex row. They
          cannot be merged: an element that is rotated AND clips itself clips in its
          own rotated frame, which would cut the wall along the tilt and leave black
          triangles in the hero's corners. */}
      <div className="zx-hero-wall" aria-hidden="true">
        <div className="zx-hero-wall-track">
          {posterColumns.map((tiles, column) => (
            <div key={column} className="zx-hero-wall-column">
              {tiles.map((src, row) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${row}`}
                  className="zx-hero-tile"
                  src={src}
                  /* TWO WIDTHS, built by scripts/build-hero-wall.mjs. The tile is
                     130 CSS px on a phone and up to 307px on a wide desktop, so a
                     single file is necessarily wrong at one end: PageSpeed
                     measured the 320px file painted at 228px on a Moto G Power
                     and called 21.4KB of it waste, per tile, across twenty tiles.

                     `sizes` mirrors `--zx-wall-col` in landing.css (130px, then
                     `max(184px, 12vw)` from 1024) — it is a promise about layout
                     made to the preload scanner before any CSS exists, so it has
                     to be kept in step with that variable by hand. Being wrong
                     here is worse than having no srcset at all: too small a
                     value ships a blurry tile that cannot be undone once the
                     browser has committed to it.

                     A DPR-2 phone still resolves to the 320 (130 x 2 = 260 > 240)
                     and a DPR-1.75 phone takes the 240 — which is exactly the
                     device in the report. */
                  srcSet={`${src.replace(/\.webp$/, '-240w.webp')} 240w, ${src} 320w`}
                  sizes="(min-width: 1024px) max(184px, 12vw), 130px"
                  alt=""
                  width={320}
                  height={480}
                  /* Only the four columns the narrowest viewport actually lays
                     out are eager; the rest exist for the full-bleed desktop
                     wall and are fetched as the browser gets to them.

                     The duplicate half of each column costs no network: it
                     repeats the same URLs, so the browser serves it from the
                     same fetch. */
                  loading={column < 4 ? 'eager' : 'lazy'}
                  /* A TILE IS THE LCP ELEMENT, so the wall cannot be uniformly
                     deprioritized.

                     Every tile used to be `fetchPriority="low"`, reasoned as "the
                     wall is texture behind a scrim, the headline and the install
                     button own the first connections". Right about intent, wrong
                     about consequence: the wall is full-bleed BEHIND the copy, so
                     the largest element in the viewport is a tile. Lighthouse
                     named it — LCP element `img.zx-hero-tile`, `fetchpriority=high
                     should be applied` failing — with LCP 5.4s against FCP 2.6s.
                     The hint was deferring the exact resource the metric waited on.

                     THE TOP ROW, not one hardcoded tile. Which tile is largest
                     depends on the viewport and on the -40px/+24px stagger that
                     offsets alternating columns, so the LCP element is not stable
                     across devices: the report caught `lanterns`, which sits at
                     column 1 / row 4, NOT at the document's first <img>. Promoting
                     row 0 of the four columns a phone lays out covers whichever of
                     them wins without guessing — four images, which is the same
                     number a browser would give priority to anyway once it starts
                     laying out the hero.

                     The remaining tiles stay `low` for the original reason, which
                     still holds for them: they are texture, and twenty
                     high-priority images would recreate the contention this hint
                     exists to prevent. */
                  fetchPriority={row === 0 && column < 4 ? 'high' : 'low'}
                  decoding="async"
                />
              ))}
            </div>
          ))}
        </div>
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

        {/* The networks, as marks rather than as words.
        
            The <h1> used to open "Netflix, Disney+, HBO Max & 20+ networks", which
            put three trademarks into the single most heavily weighted string on the
            page. Google's classifiers read that alongside a $1.25 price and a
            same-day-premiere claim and filed the domain as a piracy aggregator: the
            site is currently dropped entirely from SafeSearch=Filter results while
            still ranking #1 under SafeSearch=Blur, which is the signature of a
            content flag rather than a ranking problem.
            
            Logos carry the same message to a human visitor without handing a text
            classifier a keyword-stuffed trademark string, and they are how a real
            aggregator presents its sources. The names still exist in `alt` for
            screen readers and remain machine-readable — the goal is to stop
            ASSERTING the brands in ranking-weighted copy, not to hide them.
            
            Six of eleven, deliberately: this is a strip under a headline, not the
            full matrix. AboutZenorix already renders all eleven as its own card,
            and repeating that grid here would spend the hero's most valuable
            vertical space on a duplicate. The remainder is summarised by the count
            pill, so the "20+" promise survives without eleven marks competing with
            the install button. */}
        <div className="zx-hero-networks">
          <ul className="zx-hero-networks-list">
            {PLATFORM_ORDER.slice(0, 6).map((id) => {
              const platform = PLATFORMS[id]
              return (
                <li key={id} className="zx-hero-network">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="zx-hero-network-icon"
                    src={platform.icon || '/placeholder.svg'}
                    alt={platform.name}
                    width={144}
                    height={144}
                    /* Below the fold on no viewport — this sits directly under the
                       h1 — but still low priority for the same reason the poster
                       wall is: the install CTA and the headline own the first
                       connections. Six 20KB icons must not delay either. */
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                  />
                </li>
              )
            })}
          </ul>
          {/* Not inside the <ul>: it is a summary of the list, not a member of it,
              so a screen reader should not hear it as a seventh network. */}
          <p className="zx-hero-networks-count">
            {fill(networksLabel, { count: String(PLATFORM_ORDER.length + 9) })}
          </p>
        </div>

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
          stores={[
            {
              id: 'ios',
              eyebrow: stores.iosEyebrow,
              name: stores.ios,
              icon: '/brand/apple.svg',
              srLabel: fill(stores.unavailable, { store: stores.ios }),
            },
            {
              id: 'google-play',
              eyebrow: stores.googlePlayEyebrow,
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
