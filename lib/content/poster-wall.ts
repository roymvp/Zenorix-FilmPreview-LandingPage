/**
 * Artwork for the hero's poster wall.
 *
 * RESERVED INTEGRATION POINT (artwork): this is the only place the wall's tiles
 * are named. Point it at a CMS/catalogue response and the hero re-composes with
 * no component change.
 *
 * Every entry is a normalized 2:3 WebP produced by
 * `scripts/build-poster-tiles.mjs` — do NOT reference a raw source poster here.
 * The wall lays dozens of tiles side by side, so mismatched aspect ratios show up
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

/* Tiles per column, and columns per wall.
 *
 * COLUMNS is 8 rather than the 3 a phone needs, because the wall is sized by TILE
 * WIDTH and not by column count: `.zx-hero-wall-column` takes a fixed
 * `--zx-wall-col`, so how many columns a viewport SHOWS falls out of its own
 * width. A phone lays out ~4 of the 8 and `.zx-hero-wall`'s `overflow: hidden`
 * clips the rest; the 1200px desktop hero shows all 8. One number covers every
 * width, which is why the wall needs no breakpoint of its own.
 *
 * Two things to know before changing it:
 *
 * - it costs no extra NETWORK at any width. All 8 columns draw from the same
 *   six-file pool, so the clipped columns resolve to images already being
 *   fetched — the count only ever adds layout nodes, never requests.
 * - it must stay large enough to cover the WIDEST hero. At the desktop
 *   `--zx-wall-col` (184px) eight columns span ~1536px, which is the 1200px page
 *   cap plus the layer's own -14% inline overhang. Raise that cap and this has to
 *   grow with it, or the rotated wall exposes black canvas at the corners.
 */
const ROWS = 4
const COLUMNS = 8

/**
 * Builds one wall as an array of columns.
 *
 * `offset` rotates the source list so each layer of the carousel is a DIFFERENT
 * arrangement of the same six posters. That is the whole reason the wall reads as
 * a deep catalogue rather than as six images: with a 6-tile pool and 32 slots
 * every layer must repeat, and the strides decide WHERE it is allowed to.
 *
 * What the arithmetic guarantees, mod the 6-tile pool: neighbours differ by 1
 * vertically, by ROWS (4) horizontally and by 3 or 5 diagonally — none of which is
 * 0 — so no tile ever touches a copy of itself on any axis. What it does NOT
 * avoid is a whole column recurring: 4 and 6 share a factor, so columns repeat
 * with a period of 3 (columns 0, 3 and 6 are identical). That is the best a 6-tile
 * pool and 4 rows can do, and it is invisible in place — the wall sits behind a
 * scrim that runs from 50% to fully opaque black.
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
