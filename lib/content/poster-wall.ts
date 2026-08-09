/**
 * Artwork for the hero's poster wall.
 *
 * RESERVED INTEGRATION POINT (artwork): this is the only place the wall's tiles
 * are named. Point it at a CMS/catalogue response and the hero re-composes with
 * no component change.
 *
 * Every entry is a normalized 2:3 WebP produced by
 * `scripts/build-poster-tiles.mjs` — do NOT reference a raw source poster here.
 * The wall lays twelve tiles side by side, so mismatched aspect ratios show up
 * immediately as black gutters inside individual tiles.
 *
 * This pool intentionally stays at six even though the tile directory now holds
 * twenty: the other fourteen exist for the two chart rails. The wall is
 * background texture behind a scrim at ~130px wide, so more variety buys nothing
 * visible while every added tile is another image on the LCP path. Six is also
 * what makes the stride in `buildWall` work.
 *
 * The six are picked for CONTRAST rather than for what is ranking: a fantasy
 * epic, two tentpole sequels, animation, a prestige drama and a fashion comedy,
 * so the wall reads as a broad catalogue at a glance. Title lettering burned into
 * the art is fine here — behind the scrim at this size it is texture, and unlike
 * a rail card the wall overlays no badge that could disagree with it.
 */
const TILES = [
  '/media/tiles/house-of-the-dragon.webp',
  '/media/tiles/avatar-fire-and-ash.webp',
  '/media/tiles/rick-and-morty.webp',
  '/media/tiles/project-hail-mary.webp',
  '/media/tiles/mortal-kombat-2.webp',
  '/media/tiles/devil-wears-prada-2.webp',
] as const

/** Tiles per column, and columns per wall. 3x4 fills a phone-width hero. */
const ROWS = 4
const COLUMNS = 3

/**
 * Builds one wall as an array of columns.
 *
 * `offset` rotates the source list so each layer of the carousel is a DIFFERENT
 * arrangement of the same six posters. That is the whole reason the wall reads as
 * a deep catalogue rather than as six images: with a 6-tile pool and 12 slots
 * every layer must repeat, but a co-prime stride (7 against a pool of 6) means no
 * tile ever lands next to, above or below a copy of itself.
 *
 * Pure function of its argument — no randomness — so the server and client render
 * byte-identical markup.
 */
function buildWall(offset: number): string[][] {
  return Array.from({ length: COLUMNS }, (_, column) =>
    Array.from(
      { length: ROWS },
      (_, row) => TILES[(offset * 7 + column * ROWS + row) % TILES.length],
    ),
  )
}

/**
 * The carousel's layers. Three is deliberate: enough that the wall visibly
 * changes, few enough that the hero's image payload stays at the six files every
 * layer shares (the browser fetches each tile once and reuses it).
 */
export const posterWalls: string[][][] = [0, 1, 2].map(buildWall)
