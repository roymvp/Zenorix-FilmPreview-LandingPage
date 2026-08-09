/**
 * Artwork for the hero's poster wall.
 *
 * RESERVED INTEGRATION POINT (artwork): this is the only place the wall's tiles
 * are named. Point it at a CMS/catalogue response and the hero re-composes with
 * no component change.
 *
 * Every entry is a 320x480 WebP produced by `scripts/build-hero-wall.mjs` — do
 * NOT reference a raw source poster, and do NOT borrow a tile from
 * `/media/tiles/` (those are the chart rails', built 2x larger for artwork that
 * gets looked at directly). The wall lays dozens of tiles side by side, so a
 * mismatched aspect ratio shows up immediately as black gutters inside one tile.
 *
 * Twenty theatrical one-sheets, chosen to span the catalogue rather than to rank:
 * tentpole sequels, three anime features, awards drama, animation, and Indian
 * cinema. Breadth is the whole job — the viewer never reads one of these, they
 * register "there is a lot here" from the mix of palettes and eras scrolling past.
 *
 * Burned-in titles and studio logos are fine HERE and only here: the wall overlays
 * no badge and makes no per-title claim, so nothing can contradict the art.
 */
const TILES = [
  '/media/wall/spider-man-no-way-home.webp',
  '/media/wall/dune-part-two.webp',
  '/media/wall/demon-slayer-infinity-castle.webp',
  '/media/wall/oppenheimer.webp',
  '/media/wall/the-wild-robot.webp',
  '/media/wall/12th-fail.webp',
  '/media/wall/across-the-spider-verse.webp',
  '/media/wall/the-odyssey.webp',
  '/media/wall/klaus.webp',
  '/media/wall/top-gun-maverick.webp',
  '/media/wall/attack-on-titan-last-attack.webp',
  '/media/wall/the-father.webp',
  '/media/wall/chainsaw-man-reze-arc.webp',
  '/media/wall/jai-bhim.webp',
  '/media/wall/1917.webp',
  '/media/wall/project-hail-mary.webp',
  '/media/wall/hamilton.webp',
  '/media/wall/maharaja.webp',
  '/media/wall/i-swear.webp',
  '/media/wall/spider-man-brand-new-day.webp',
] as const

/**
 * Columns per wall, and UNIQUE tiles per column.
 *
 * COLUMNS is 12 rather than the 4-5 a phone shows, because the wall is sized by
 * TILE WIDTH and not by column count: `.zx-hero-wall-column` takes
 * `--zx-wall-col`, so how many columns a viewport needs falls out of its own
 * width, and the surplus is `display: none` below the desktop tier.
 *
 * 12 is a ceiling that does not move with monitor size. The desktop hero is
 * full-bleed and its rotated layer is 128% of the viewport, so covering it takes
 * `1.28 * 100vw` of columns — and because the desktop tile is itself `12vw` (see
 * `--zx-wall-col`), that is 1.28 / 0.12 ≈ 10.7 columns at EVERY width. Constant,
 * so 12 covers a 5K display exactly as well as a 1280px laptop.
 *
 * ROWS is 5 UNIQUE tiles, rendered TWICE — see `buildColumn`. Five is the number
 * that keeps the drift seamless at the worst combination of small tile and tall
 * hero: a phone's 130px tile is 195px tall (+8px gap), so five of them are 1015px
 * against a 896px layer (140% of the 640px hero cap) plus the 40px stagger — an
 * 79px margin. Drop to four and the bottom edge of the strip scrolls into view.
 */
const COLUMNS = 12
const ROWS = 5

/**
 * One column: five unique tiles, then the SAME five again.
 *
 * The duplicate is what makes the drift loop invisibly. `.zx-hero-wall-column`
 * animates to `translateY(-50%)`, which lands the second copy exactly where the
 * first started, so the seam has nothing to see — no snap, no gap, no reset.
 * Consequently the array must be exactly two identical halves; adding a stray
 * tile to one half breaks the loop rather than just changing the art.
 *
 * The `* 7` column stride is co-prime with the 20-tile pool, and that is doing
 * real work. With a plain `* ROWS` stride, 5 and 20 share a factor and every
 * fifth column is an identical strip (columns 0, 5 and 10 all visible at once);
 * at 7 no two of the twelve columns repeat, vertical neighbours differ by 1 and
 * horizontal by 7, so no tile ever touches a copy of itself.
 *
 * Pure function of its argument — no randomness — so server and client render
 * byte-identical markup and hydration cannot mismatch.
 */
function buildColumn(column: number): string[] {
  const unique = Array.from(
    { length: ROWS },
    (_, row) => TILES[(column * 7 + row) % TILES.length],
  )
  return [...unique, ...unique]
}

/** The wall, as 12 columns of 10 tiles (5 unique, doubled for the drift loop). */
export const posterColumns: string[][] = Array.from({ length: COLUMNS }, (_, column) =>
  buildColumn(column),
)
