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
 * COLUMNS is 12 rather than the 3-4 a phone shows, because the wall is sized by
 * TILE WIDTH and not by column count: `.zx-hero-wall-column` takes
 * `--zx-wall-col`, so how many columns a viewport needs falls out of its own
 * width, and the surplus is clipped by `.zx-hero-wall`'s `overflow: hidden`.
 *
 * 12 is a ceiling that does not move with monitor size. The desktop hero is
 * full-bleed and its rotated layer is 128% of the viewport, so covering it takes
 * `1.28 * 100vw` of columns — and because the desktop tile is itself `12vw` (see
 * `--zx-wall-col`), that is 1.28 / 0.12 ≈ 10.7 columns at EVERY width. Constant,
 * so 12 covers a 5K display exactly as well as a 1280px laptop. Had the tile
 * stayed a fixed 184px this number would have had to track the widest screen we
 * cared about, which is the trap the `vw` term avoids.
 *
 * It costs no extra NETWORK at any width: all 12 columns draw from the same
 * six-file pool, so clipped columns resolve to images already being fetched. It
 * does cost DOM nodes, which is why the columns a narrow viewport cannot see are
 * `display: none` rather than laid out and clipped — see the column-budget note on
 * `.zx-hero-wall-column` in landing.css, which is also where to check coverage if
 * this number or the tile width changes.
 */
const ROWS = 4
const COLUMNS = 12

/**
 * Builds one wall as an array of columns.
 *
 * `offset` rotates the source list so each layer of the carousel is a DIFFERENT
 * arrangement of the same six posters. That is the whole reason the wall reads as
 * a deep catalogue rather than as six images: with a 6-tile pool and 48 slots
 * every layer must repeat, and the strides decide WHERE it is allowed to.
 *
 * What the arithmetic guarantees, mod the 6-tile pool: neighbours differ by 1
 * vertically, by ROWS (4) horizontally and by 3 or 5 diagonally — none of which is
 * 0 — so no tile ever touches a copy of itself on any axis. What it does NOT
 * avoid is a whole column recurring: 4 and 6 share a factor, so columns repeat
 * with a period of 3 (0, 3, 6 and 9 are identical). That is the best a 6-tile
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
