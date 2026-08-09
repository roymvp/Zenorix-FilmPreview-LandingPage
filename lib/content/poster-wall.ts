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
 * Thirty-nine one-sheets — theatrical features and streaming originals — chosen to
 * span the catalogue rather than to rank it: tentpole sequels, anime, awards drama,
 * animation, Indian and Korean cinema, prestige TV. Breadth is the whole job. The
 * viewer never reads one of these; they register "there is a lot here" from the mix
 * of palettes and eras drifting past.
 *
 * DELIBERATELY INTERLEAVED, not grouped by studio or year. The drift means
 * neighbouring tiles are seen together, so a run of one palette (the near-monochrome
 * dramas, the three Spider-Man sheets) would read as a dead patch or as a duplicate.
 * Alternating warm/cool and photographic/illustrated keeps every neighbourhood of
 * the wall mixed.
 *
 * Burned-in titles and studio logos are fine HERE and only here: the wall overlays
 * no badge and makes no per-title claim, so nothing can contradict the art.
 *
 * One supplied poster is deliberately ABSENT. `blade-runner-2099` is a centred logo
 * on near-black, and the 2:3 crop leaves fragments of "prime original" and "E RUN"
 * floating on an otherwise empty tile — at this size, behind the scrim, that reads
 * as a broken image rather than as texture. Its source stays in
 * `assets/hero-posters/` in case full-bleed key art arrives later.
 */
const TILES = [
  '/media/wall/spider-man-no-way-home.webp',
  '/media/wall/the-shards.webp',
  '/media/wall/dune-part-two.webp',
  '/media/wall/elle.webp',
  '/media/wall/demon-slayer-infinity-castle.webp',
  '/media/wall/my-daughters-father.webp',
  '/media/wall/oppenheimer.webp',
  '/media/wall/five-star-weekend.webp',
  '/media/wall/the-wild-robot.webp',
  '/media/wall/neuromancer.webp',
  '/media/wall/12th-fail.webp',
  '/media/wall/lanterns.webp',
  '/media/wall/across-the-spider-verse.webp',
  '/media/wall/the-rapture.webp',
  '/media/wall/the-odyssey.webp',
  '/media/wall/fightland.webp',
  '/media/wall/klaus.webp',
  '/media/wall/lucky.webp',
  '/media/wall/top-gun-maverick.webp',
  '/media/wall/ann-droid.webp',
  '/media/wall/attack-on-titan-last-attack.webp',
  '/media/wall/the-east-palace.webp',
  '/media/wall/the-father.webp',
  '/media/wall/stuart-fails-universe.webp',
  '/media/wall/chainsaw-man-reze-arc.webp',
  '/media/wall/ride-or-die.webp',
  '/media/wall/jai-bhim.webp',
  '/media/wall/carrie.webp',
  '/media/wall/1917.webp',
  '/media/wall/musafir-cafe.webp',
  '/media/wall/project-hail-mary.webp',
  '/media/wall/furious.webp',
  '/media/wall/hamilton.webp',
  '/media/wall/elite-force.webp',
  '/media/wall/maharaja.webp',
  '/media/wall/the-westies.webp',
  '/media/wall/i-swear.webp',
  '/media/wall/the-hawk.webp',
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
 * The `* 7` column stride is co-prime with the 39-tile pool, and that is doing
 * real work. With a plain `* ROWS` stride, 5 and a multiple-of-5 pool would share
 * a factor and repeat whole columns; 7 shares no factor with 39, so no two of the
 * twelve columns repeat, vertical neighbours differ by 1 and horizontal by 7, and
 * no tile ever touches a copy of itself. (7 is also co-prime with 12, so the
 * columns themselves don't fall into a short cycle.)
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
