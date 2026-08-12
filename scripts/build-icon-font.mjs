/**
 * Builds `public/fonts/material-symbols-subset.woff2` — the icon font behind every
 * <md-icon> on the site.
 *
 * WHY THIS SCRIPT EXISTS. The font used to be a `<link rel="stylesheet">` to
 * fonts.googleapis.com in `app/[lang]/layout.tsx`. Subsetting was already right
 * there; the ORIGIN was the problem. PageSpeed measured that stylesheet
 * render-blocking for 750ms on the live site — six times our own CSS at 150ms, and
 * the largest single entry in "Render-blocking requests" — because a third-party
 * font costs DNS + TCP + TLS before the first byte, and only then reveals which
 * .woff2 to fetch from a SECOND origin. Two `preconnect` hints existed to soften
 * exactly that and could not remove it. Google also served the file with a 1-day
 * `max-age` ("Use efficient cache lifetimes") and no `font-display` ("Font
 * display"), neither of which is fixable from outside their CDN.
 *
 * So the file is fetched ONCE, at authoring time, and committed. The @font-face
 * that consumes it — and the `font-display: swap` Google would not give us — is in
 * `app/globals.css`.
 *
 * RUN THIS whenever the icon list below changes:
 *   node scripts/build-icon-font.mjs
 * Then verify in a browser that the new icon renders as a GLYPH and not as its own
 * name in text. Committing the .woff2 is part of the change.
 */
import { mkdir, writeFile } from 'node:fs/promises'

/**
 * EVERY GLYPH THE SITE RENDERS. Alphabetical, because Google's `icon_names`
 * parameter requires it.
 *
 * KEEP THIS LIST IN SYNC WITH THE COMPONENTS. An <md-icon> whose name is missing
 * here renders as its literal text ("expand_more") instead of a glyph, so adding an
 * icon to a component means adding it here and re-running this script. Current
 * users: 4k / high_quality / surround_sound / bolt in the spec grid (about-zenorix),
 * 4k / hdr_on / contrast / surround_sound on the playback capsules (title-page),
 * arrow_forward (top-chart), chat_bubble (contact-link + footer-contacts), check
 * (conversion-dialog + language-switcher), expand_more (faq-section +
 * language-switcher), group and mail (footer-contacts), verified_user
 * (download-cta), download (site-footer's install button).
 *
 * `download` arrived by walking straight into that trap: the footer's install
 * button rendered the literal string "download" in the browser until the name was
 * added. The warning is not hypothetical.
 *
 * NEITHER IS IT UNREPEATABLE. `mail` arrived the same way and was caught the same
 * way — in a screenshot, not in code review: the footer's email row rendered a
 * notdef box for one build because the glyph was added to the component and not to
 * this list. Read this paragraph before touching a component's icons.
 *
 * AND A MISSPELLED NAME IS WORSE THAN A MISSING ONE. Measured against this
 * endpoint: a name Google does not recognise does not 404 and does not drop that one
 * glyph — it silently disables subsetting altogether and returns the FULL font
 * (1809144 bytes for `dolby_atmos`, which is not a Material Symbols name, against
 * ~2KB per real glyph). Before self-hosting that cost a megabyte of blocking font on
 * a 3G phone; now it would silently commit a megabyte into the repo instead. The
 * size assertion at the bottom of this script is what catches it either way.
 *
 * The X mark in footer-contacts is deliberately NOT here: Material Symbols carries
 * no brand logos, so that one is an inline SVG in the component. For the same reason
 * the playback capsules use `hdr_on` and `contrast` rather than the Dolby and HDR10
 * marks those formats are printed with on a disc case — registered logos, not
 * icon-font glyphs.
 */
const ICONS = [
  '4k',
  'arrow_forward',
  'bolt',
  'chat_bubble',
  'check',
  'contrast',
  'download',
  'expand_more',
  'group',
  'hdr_on',
  'high_quality',
  'mail',
  'surround_sound',
  'verified_user',
]

/* The axis ranges are kept so the subset stays a VARIABLE font — it still
   advertises `wght 100..700`, which is what lets Material Web's own icon styles ask
   for a weight without the browser synthesising a bold. The @font-face in
   globals.css declares the same range; they have to agree. */
const AXES = 'opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'

const CSS_URL =
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:${AXES}` +
  `&icon_names=${ICONS.join(',')}`

const OUT = 'public/fonts/material-symbols-subset.woff2'

/* A BROWSER UA IS LOAD-BEARING. The css2 endpoint content-negotiates on it and
   serves legacy `.ttf` to clients it does not recognise — including a bare fetch.
   Without this header the script would succeed and write a TrueType file under a
   .woff2 name, roughly 3x larger, which the @font-face would still happily load. */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const css = await fetch(CSS_URL, { headers: { 'User-Agent': UA } }).then((response) => {
  if (!response.ok) throw new Error(`css2 responded ${response.status}`)
  return response.text()
})

const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1]
if (!fontUrl) throw new Error('no font URL in the returned CSS')
if (!/format\('woff2'\)/.test(css)) {
  throw new Error('css2 did not return woff2 — the User-Agent above was rejected')
}

const font = Buffer.from(
  await fetch(fontUrl).then((response) => {
    if (!response.ok) throw new Error(`font responded ${response.status}`)
    return response.arrayBuffer()
  }),
)

/* THE TYPO GUARD described above. A correct subset of 14 glyphs measures ~14KB; a
   silently-unsubsetted full font is ~1.8MB. Anything past 200KB means a name in
   ICONS is not a real Material Symbols name, so fail instead of committing it. */
if (font.length > 200_000) {
  throw new Error(
    `subset is ${font.length} bytes — subsetting was silently disabled, so one of ` +
      `the names in ICONS is misspelled. Check the newest entry first.`,
  )
}

/* woff2 files begin with the magic string `wOF2`. Cheap insurance that we wrote a
   font at all rather than an error page with a 200 status. */
if (font.subarray(0, 4).toString('latin1') !== 'wOF2') {
  throw new Error('downloaded bytes are not woff2')
}

await mkdir('public/fonts', { recursive: true })
await writeFile(OUT, font)

console.log(`[v0] ${OUT} — ${ICONS.length} glyphs, ${(font.length / 1024).toFixed(1)}KB`)
console.log('[v0] verify each icon renders as a glyph (not as its name) in a browser')
