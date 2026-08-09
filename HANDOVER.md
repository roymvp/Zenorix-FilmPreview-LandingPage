# Developer Handover — Zenorix Film Preview Landing Page

Everything needed to take this repository to production. Product context and
design rationale are in [`README.md`](./README.md); this document is the
engineering reference.

**Status at handover:** front end complete and verified. `pnpm build` passes
clean (16 routes, TypeScript included). 12 localized pages verified serving
`200`. Zero runtime errors, zero hydration warnings, CLS 0.

**Contents**
1. [Run it](#1-run-it)
2. [Architecture](#2-architecture)
3. [Component map](#3-component-map)
4. [Data contracts](#4-data-contracts)
5. [Complete placeholder inventory](#5-complete-placeholder-inventory)
6. [TODO A — Firebase Analytics](#6-todo-a--firebase-analytics)
7. [TODO B — Replace placeholder content](#7-todo-b--replace-placeholder-content)
8. [TODO C — Multi-film campaign links](#8-todo-c--multi-film-campaign-links)
9. [TODO D — Second-phase dev, QA, deploy](#9-todo-d--second-phase-dev-qa-deploy)
10. [Known defects found at handover](#10-known-defects-found-at-handover)
11. [The four frozen axes & how to verify them](#11-the-four-frozen-axes--how-to-verify-them)
12. [Traps — bugs already fixed here](#12-traps--bugs-already-fixed-here)
13. [QA checklist](#13-qa-checklist)

---

## 1. Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000  (redirects to a detected locale)
pnpm build          # verify before every PR
pnpm start
```

`pnpm build` is the real gate: TypeScript runs inside it (there is no separate
`typecheck` script, and no test or lint script — **adding them is part of TODO D**).

### Environment variables

| Var | Default if unset | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://zenorix.app` (dev fallback — **not** the live origin) | Canonical origin for canonical URLs, hreflang, OG images, sitemap, robots |
| `NEXT_PUBLIC_APK_URL` | `/download/zenorix.apk` | APK download target |

Both have working dev fallbacks, so a fresh clone runs with no `.env`. **Both must
be set in production.** The live value of `NEXT_PUBLIC_SITE_URL` is
`https://zenorix.space`, already set on all three Vercel environments.

The fallback is a trap worth understanding: `zenorix.app` is a domain this project
does not own, and an unset variable fails *silently* — the build succeeds and the
page looks perfect while every canonical tag, hreflang pair, sitemap entry, JSON-LD
block and `llms.txt` line points at someone else's domain. Production was in exactly
that state until this was set. If you ever fork this for another origin, set the
variable first, then verify with
`curl -s https://<host>/en | grep canonical` rather than trusting the build.

### First 15 minutes — read these five files in order

1. `lib/i18n/config.ts` (71 lines) — the locale/URL contract.
2. `lib/content/movies.ts` (240) — all film + chart data.
3. `components/landing/conversion-provider.tsx` (124) — the funnel.
4. `components/landing/immersive-player.tsx` (429) — the 10-minute gate.
5. `lib/seo.ts` (223) — metadata + JSON-LD.

That is ~1,100 lines and covers every integration point.

---

## 2. Architecture

```
Request  →  proxy.ts       →  static page  →  React hydrate  →  md-* upgrade
            (only runtime      (SSG, zero      (6 client        (Material web
             work in the app)   server work)    islands)         components)
```

### Rendering model

Every page is **statically generated** (`generateStaticParams`). There are no
server actions, no API routes, no database, no server-side fetching. The only
request-time code is `proxy.ts`, which locale-prefixes unprefixed URLs.

`pnpm build` output:

```
● /[lang]                        → /en, /pt-br, /th
○ /llms.txt  ○ /robots.txt  ○ /sitemap.xml  ○ /_not-found
ƒ Proxy (Middleware)
```

`/llms.txt` is a route handler, not a file in `public/`, so the prices and version
numbers it states to AI answer engines are generated from `SITE` and the market
dictionaries and cannot drift from the visible page.

### Routing & locale resolution

`proxy.ts` resolves a locale in strict priority order:

1. `NEXT_LOCALE` cookie (explicit user choice wins)
2. `x-vercel-ip-country` header — `US→en`, `BR→pt-br`, `TH→th`
3. `Accept-Language`, q-value sorted
4. `defaultLocale` (`en`)

`/` redirects to `moviePath(locale, featuredSlug)`; any other unprefixed path gets
`/{locale}` prepended. The matcher excludes `_next`, `api`, and any path with a
file extension.

**URL shape** — the path segment is localized, and this is load-bearing for SEO
(each market accrues its own link equity):

| Locale | Home | Film page |
| --- | --- | --- |
| `en` | `/en` | `/en/movie/{slug}` |
| `pt-br` | `/pt-br` | `/pt-br/filme/{slug}` |
| `th` | `/th` | `/th/หนัง/{slug}` (URL-encoded) |

A wrong locale/segment pair 404s by design — `/en/filme/nocturne-protocol`
returns 404 (verified), so only the canonical URL is ever indexable.

### Styling — no Tailwind

Hand-written CSS in two files. Do not introduce a utility framework; the design
depends on these tokens.

- `app/globals.css` (304 lines) — Material 3 design tokens as CSS custom
  properties (`--md-sys-color-*`), the `:not(:defined)` guard that hides `md-*`
  tags until they upgrade, and base resets.
- `app/landing.css` (~2,305 lines) — all page styles, `zx-` prefixed, heavily
  commented with the reasoning behind non-obvious values.

**The `zx-` comments are the design spec.** Many encode a measured constraint and
a failure mode that was hit and fixed (contrast ratios, why a border is
load-bearing, why a fill can't be brighter). Read the comment before changing a
value.

---

## 3. Component map

**Server components** (no `'use client'` — keep them that way):

| File | Role |
| --- | --- |
| `film-landing.tsx` | Page composition + speculation-rules script. The one place section order is decided. |
| `top-bar.tsx` | Brand + install button. Contains the logo handoff point. |
| `film-info.tsx` | Title, metadata row, genres, synopsis mount |
| `about-zenorix.tsx` | 4-card value grid (networks marquee, price comparison, quality, trial) |
| `faq-section.tsx` | 9 Q&A via native `<details>` — **CSS-only, zero JS** |
| `final-cta.tsx`, `site-footer.tsx` | Closing CTA, legal footer |

**Client components** (8, minimal by design):

| File | Why client |
| --- | --- |
| `conversion-provider.tsx` | Funnel state + the single `download()` |
| `immersive-player.tsx` | Video element, the 10-minute gate |
| `conversion-dialogs.tsx` | Both `md-dialog` bottom sheets |
| `top-chart.tsx` | Card taps → content-lock sheet |
| `download-cta.tsx` | Routes clicks into `download(source)` |
| `film-synopsis.tsx` | Expand/collapse |
| `language-switcher.tsx` | `md-menu` + `language_switch` event |
| `material-web-loader.tsx` | Registers `@material/web` after hydration |

### Why Material components load in an effect

`material-web-loader.tsx` imports `@material/web/all.js` **inside a `useEffect`**,
not at module top level. Lit elements mutate their own attributes on upgrade
(`aria-label` → `data-aria-label`); upgrading before React hydrates causes
hydration mismatch errors. Loading after hydration means React sees the plain
server-rendered tags first, then elements upgrade in place.

This is the **single most load-bearing fetch in the app** — until it resolves,
every `md-*` tag is an unknown element and the UI is unusable (no buttons, no
dialogs). It is therefore awaited, retried and logged on failure. Do not convert
it to a top-level import or a fire-and-forget `import()`.

---

## 4. Data contracts

### `Movie` — `lib/content/movies.ts`

```ts
type Movie = {
  slug: string                 // URL segment; also the campaign-link identity
  releaseYear: number
  runtimeMinutes: number       // full runtime — drives the scrub bar's total
  qualityTags: string[]        // keep to 2; a 3rd wraps the metadata row on phones
  poster: string               // portrait 2:3 key art → JSON-LD Movie.image
  backdrop: string             // LANDSCAPE → og:image / twitter:image
  previewFrame: string         // LANDSCAPE 16:9 opening frame (see below)
  videoSrc: string             // ← API: signed playback URL
  videoType: string            // 'video/mp4' | 'application/vnd.apple.mpegurl'
  previewLimitSeconds: number  // 600. FROZEN — see §11
  copy: Record<Locale, MovieCopy>   // all 3 locales required
}

type MovieCopy = {
  title: string
  tagline: string      // one line, used in og:title
  synopsis: string     // 2–3 lines. This is a conversion step, not a wiki
  genres: string[]     // 2–3 tags
}
```

**`previewFrame` is one asset in two placements, intentionally:** the player's
poster (what shows before playback resolves, and behind the fade while buffering)
*and* the preview-gate sheet's header art. Sharing it makes the sheet feel like it
grew out of the frame the viewer was just watching. **Keep them the same asset.**

Must be **landscape** — both placements use `object-fit: cover`, so a portrait
source loses most of its height. (This field exists because the player used to
borrow `backdrop`, which on two titles points at a square/portrait poster and got
cropped to a narrow centre strip.)

### `ChartEntry` — Top 10

```ts
type ChartEntry = {
  id: string
  title: string                 // accessible name only — never rendered visually
  kind: 'movie' | 'series'
  platform: PlatformId          // key into lib/content/platforms.ts
}
```

**There is deliberately no `poster` field** — see TODO B for how to add it.
Per-locale ordering lives in the `order` map; each market has a different chart,
as a real chart would.

### `Dictionary` — `dictionaries/{en,pt-br,th}.json`

12 top-level groups: `market`, `meta`, `nav`, `player`, `info`, `chart`, `about`,
`faq`, `finalCta`, `modals`, `footer`, `a11y`.

**Verified: all three files have identical key sets** (no missing, no extra).
Preserve that when adding copy — a missing key renders `undefined` in production.

`market` carries per-market monetary values (`currency`, `monthlyValue`,
`annualTotalValue`, `annualPerMonthValue`, `country`, `countryShort`). These feed
**both** the visible pricing UI **and** the JSON-LD `AggregateOffer`, so schema
can never drift from page copy. Update them together.

`fill()` in `lib/i18n/dictionaries.ts` interpolates `{title}`, `{year}`,
`{country}` placeholders.

---

## 5. Complete placeholder inventory

Everything below is fake. Search `RESERVED` in the codebase to find each in situ.

### Static — no API required

| # | What | Location | Current placeholder |
| --- | --- | --- | --- |
| 1 | **Brand logo** | `top-bar.tsx` ~L26 | A `<span className="zx-brand-mark">`. Swap for `<img>`/inline SVG keeping the class — it already owns the 30×30 box + radius, no CSS change needed. |
| 2 | **APK URL** | `lib/config/site.ts` `apkUrl` | `/download/zenorix.apk` — **this file does not exist**; clicking download 404s today. |
| 3 | **APK version / size** | same, `apkVersion` `apkSize` | `3.4.1`, `14MB` |
| 4 | **Install count** | same, `apkDownloads` | `3M+ Downloads` |
| 5 | **Min Android** | same, `minAndroid` | `7.0` — also emitted into JSON-LD `softwareRequirements` |
| 6 | **Library counts** | same, `library` | `28,000+` movies / `8,000+` series / `900+` channels / `36,000+` total |
| 7 | **Film metadata** | `movies.ts` `copy` | 3 invented films, full 3-locale copy |
| 8 | **Film posters/backdrops** | `public/media/*.png` | 4 AI-generated 1024×1024 PNGs — **square, and heavy (0.9–1.5 MB each)**. See §10. |
| 9 | **Footer legal links** | `dictionaries/*.json` → `footer` | Privacy / Terms / DMCA, all `href="#"` |

**Real and licensed — keep:** the 11 platform logos in `public/brands/` (Netflix,
Disney+, HBO Max, Prime Video, Apple TV, Hulu, Peacock, Paramount+, AMC+, NBC,
Fox One), used in the About marquee and as Top 10 source badges.

### Requires API support

| # | What | Location | Current placeholder | Needs |
| --- | --- | --- | --- | --- |
| 10 | **Playback URL** | `movies.ts` `SAMPLE_STREAM` | Google's public `BigBuckBunny.mp4` — same clip for all 3 films | Per-film signed/long-lived URL. For HLS/DASH see below. |
| 11 | **Top 10 posters** | `top-chart.tsx` | `<md-icon>image</md-icon>` neutral tile; `ChartEntry` has no `poster` field | Chart API with artwork |
| 12 | **Preview frames** | `movies.ts` `PLACEHOLDER_PREVIEW_FRAME` | One SVG (`placeholder-preview-frame.svg`) shared by all 3 films | Per-film landscape 16:9 opening frame |
| 13 | **Chart ordering** | `movies.ts` `order` | Hand-written per locale | Regional chart API |

Placeholders 10–12 are *deliberately* obvious-looking (an empty asset slot, not
art) so an unconfigured film reads as unfinished rather than shipped.

---

## 6. TODO A — Firebase Analytics

**One file. Do not scatter SDK calls into components.**

`lib/analytics.ts` is the only module that talks to analytics. All 8 events are
already emitted from the right places with the right params:

| Event | Fired when | Params |
| --- | --- | --- |
| `preview_play` | Visitor taps play | — |
| `preview_unmute` | Visitor unmutes | — |
| `preview_limit_reached` | 10-min wall hit (once per session) | `seconds` |
| `preview_scrub_locked` | Scrub past the wall attempted | `requested` |
| `modal_view` | Either sheet opens | `modal`, + `title` or `reason` |
| `modal_dismiss` | Either sheet dismissed | `modal` |
| `apk_download_click` | **Any** CTA on the page | `source`, `version` |
| `language_switch` | Locale changed | — |

```ts
// lib/analytics.ts
export function trackEvent(name: ConversionEvent, params = {}): void {
  if (process.env.NODE_ENV !== 'production') console.log('[v0] analytics', name, params)
  // ↓ add here
  logEvent(getAnalytics(), name, params)
}
```

Notes:
- Firebase Analytics is browser-only. Guard for SSR (`typeof window`) or
  initialize lazily — `trackEvent` is imported by client components but the module
  is evaluated during the static build.
- `modal_dismiss` is already **idempotent** (guarded in the provider). Dismissal
  arrives from two paths — the Close button *and* the dialog's own `closed` event
  (scrim tap, Escape) — and the button path triggers the event path too. Do not
  remove the guard or you double-report.
- `apk_download_click.source` is your CTA-attribution dimension. Preserve the
  strings.

---

## 7. TODO B — Replace placeholder content

### Static values

Edit `lib/config/site.ts` (items 2–6) and `dictionaries/*.json` (item 9). For the
logo (item 1), keep the `zx-brand-mark` class.

`SITE` is intentionally flat and serializable so it can be produced from one API
response later without touching components.

### Film content → a real backend

`lib/content/movies.ts` is the **only** place film content lives. Replace the two
exported constants (`movies`, and `getChart`/`chartPool`/`order`) with an API or
CMS fetch and every landing page in every language regenerates. Because pages are
SSG, prefer fetching at build time (or add ISR).

Keep the `Movie` shape in §4, especially:
- `runtimeMinutes` = **full** runtime (the scrub bar's total; the locked segment
  is computed from it — a wrong value silently breaks the visible lock).
- `backdrop` must be **landscape** (it is the share card).
- `previewFrame` must be **landscape 16:9** and shared with the gate sheet.

### HLS / DASH playback

The template uses a plain MP4. For production streaming, attach hls.js or Shaka
to the **same `videoRef`** inside the existing mount effect in
`immersive-player.tsx`. No other component changes. Set `videoType` accordingly.

Verify after switching: the gate reads `video.currentTime` against `cap`, which
works identically for HLS — but confirm `timeupdate` still fires at your segment
cadence, and that seeking past the wall is still intercepted.

### Top 10 posters (item 11) — DONE

`ChartEntry.poster` is wired and every `chartPool` entry has its own tile; the
placeholder tile and its `.zx-chart-ph` CSS are gone. To swap in licensed art,
replace the file and keep the two rules below.

**Tiles are built, not referenced raw.** `scripts/build-poster-tiles.mjs` trims
each source in `public/media/poster-*.png` and covers it into a 420x630 WebP in
`public/media/tiles/`. Add a source there, re-run the script, then point
`chartPool` (rail) or `lib/content/poster-wall.ts` (hero) at the output. Never
reference a `poster-*.png` from a component — the sources are three different
aspect ratios, and the letterboxed ones show black gutters inside the tile.

Two constraints that are easy to break:

1. **Rail art must be untitled and unbranded.** Each card overlays its own
   platform badge and takes its title from data, so a poster with a service logo
   or the film's name burned in contradicts the card around it. The three
   licensed platform posters (`72-hours`, `walter-boys`, `the-last-house`) are
   therefore **hero-wall only** — there they are small, scrimmed background
   texture. The script tags each source `branded: true/false`.
2. **One tile per rail entry.** Ten cards are visible at once, so a reused tile
   reads immediately as filler. The hero wall is the opposite case and reuses six
   tiles across twelve slots on purpose (see `buildWall`).

Keep `alt=""`: the card's accessible name already carries rank + title, and the
rail intentionally shows no visible titles. The first two cards load eagerly
(above the fold on a phone), the rest lazily.

---

## 8. TODO C — Multi-film campaign links

**The routing for this is already built and verified.** One film per campaign
link, three localized paths each.

To add a promoted film, append one entry to the `movies` array:

```ts
{
  slug: 'your-film-slug',        // becomes the URL
  releaseYear: 2026,
  runtimeMinutes: 118,
  qualityTags: ['4K', 'Dolby'],
  poster: '/media/poster-your-film.png',
  backdrop: '/media/your-film-backdrop.png',   // landscape
  previewFrame: '/media/your-film-frame.png',  // landscape 16:9
  videoSrc: 'https://cdn.example.com/your-film/master.m3u8',
  videoType: 'application/vnd.apple.mpegurl',
  previewLimitSeconds: 600,
  copy: { en: {...}, 'pt-br': {...}, th: {...} },   // all three required
}
```

You automatically get:

```
/en/movie/your-film-slug
/pt-br/filme/your-film-slug
/th/หนัง/your-film-slug
```

plus static generation, canonical + reciprocal hreflang (`x-default` on English),
OG/Twitter cards, JSON-LD, and 3 new `sitemap.xml` entries with alternates.
**No routing, SEO or component work per film.**

- `featuredSlug` (= `movies[0].slug`) is what the market homes `/en`, `/pt-br`,
  `/th` and the bare `/` redirect show. Reorder the array to change the hero film.
- Ad traffic should point at the **film URL**, not `/`, to skip the redirect hop.
- Locale is auto-detected, so one campaign URL per film works globally — but
  linking the exact locale (`/pt-br/filme/...`) avoids the redirect entirely and
  is preferable for paid traffic.
- Scale check: pages = films × 3. At ~50 films that is 150 static pages, still
  comfortable; beyond that, consider ISR or on-demand generation.

---

## 9. TODO D — Second-phase dev, QA, deploy

### DONE: `middleware.ts` → `proxy.ts`

Renamed, along with its exported function (`middleware` → `proxy`), so the build
no longer prints the Next.js 16 deprecation warning. Worth knowing why it is not
purely cosmetic: `proxy.ts` runs **only** on the Node.js runtime — there is no
Edge option. This app is unaffected (it reads two request headers and a cookie),
but anything added there later cannot assume Edge.

### Not yet present — add during second-phase dev

- No test script, no test framework, no CI config.
- No lint script (no ESLint config); the code carries
  `eslint-disable-next-line @next/next/no-img-element` comments anticipating one.
- **`images`** config in `next.config.mjs` if you migrate to `next/image` (see §10).

### DONE: security headers

`next.config.mjs` (was empty) now sets `X-Content-Type-Options`,
`Referrer-Policy`, `Strict-Transport-Security`, `X-Frame-Options`,
`Permissions-Policy` and a `Content-Security-Policy-Report-Only`. See the
comments in that file — they record what is still blocking enforcement.

**The CSP is deliberately REPORT-ONLY, which logs violations and protects
nothing.** An earlier draft of this doc said "fix it with a nonce." That advice was
tested and is wrong for this site; all three standard fixes were measured against a
real production build and rejected:

| Fix | Measured result |
| --- | --- |
| nonce | Requires dynamic rendering on every page. These pages are static and CDN-served (`x-vercel-cache: HIT`), which is what buys the ~630ms LCP. |
| `experimental.sri` | Builds fine, pages stay static, but stamps `integrity` only on the 6 **external** scripts. The 38 **inline** ones stay blocked — `integrity` is meaningless for inline code. |
| inline hashes | 72 sha256 hashes across the three locales, only 18 shared; the rest embed localized text. Any copy edit silently invalidates one and white-screens that page. |

Full reasoning is in the `script-src` comment in `next.config.mjs`. **Do not
"resolve" this by adding `'unsafe-inline'`** — it silences the reports while giving
up most of what CSP is for, which is worse than the current honest no-op. The page
has no form, no cookie, and no user data, so the real XSS surface is small.

Revisit when React ships nonce-less streaming hydration, or when the page gains
authenticated behavior that makes dynamic rendering worth paying for anyway.

Independently of that: `connect-src 'self'` will block your Firebase and media-CDN
origins the moment this is ever enforced. Add them at the same time, or analytics
and playback break.

### Deployment

Vercel is the natural target — `proxy.ts` already reads
`x-vercel-ip-country` for geo-routing, which is a Vercel-provided header. On
another platform, replace that lookup with your CDN's equivalent (e.g.
`CF-IPCountry`) or geo-detection stops working and every visitor falls through to
`Accept-Language`.

#### Live domain topology

Two separate Vercel projects share the one domain, so check which you are touching
before changing anything:

| Host | Vercel project | GitHub repo | Serves |
| --- | --- | --- | --- |
| `zenorix.space` | `zenorix-website` | `Zenorix-FilmPreview-LandingPage` | **This** site (canonical) |
| `www.zenorix.space` | `zenorix-website` | — | 308 → apex |
| `play.zenorix.space` | `zenorix` | `zenorix-LandingPage-FakeGooglePlay` | The older demo page |

`www` used to be the canonical host and the apex redirected *to* it; that is now
reversed. Two gotchas found while moving the domain: a host cannot be attached to
two projects at once (detach first, and detach the apex before the host its
redirect points at), and attaching a domain does **not** alias it to a deployment —
`play` returned `DEPLOYMENT_NOT_FOUND` until `vercel alias set` pointed a build at
it. Also note `vercel domains rm` deletes the domain from the *account*; use the
project-level API endpoint to detach.

Pre-deploy:

1. ~~Set `NEXT_PUBLIC_SITE_URL`~~ — **done**, set to `https://zenorix.space` for
   production, preview and development. Still set `NEXT_PUBLIC_APK_URL` to the real
   APK. Both are inlined at build time, so changing either needs a rebuild, not just
   a restart.
2. Host the APK (or point at the CDN) and confirm the Android
   `Content-Type: application/vnd.android.package-archive`.
3. Verify `/sitemap.xml` shows your production origin and submit it.
4. Confirm the `NEXT_LOCALE` cookie survives your CDN's cache key, or geo/cookie
   locale choice can be served from a cached redirect for the wrong market.

---

## 10. Known defects found at handover

Three asset-level issues, all in placeholder content that TODO B replaces anyway —
listed so they are fixed *with* that work rather than shipped.

**1. `og:image` dimensions don't match the assets.** `lib/seo.ts` declares
`width: 1536, height: 864` (16:9), but all four media PNGs are **1024×1024
square**. Crawlers trust the declared numbers, so share cards will crop or
letterbox. Fix by supplying real landscape 1536×864 backdrops (preferred) or by
correcting the declared values to match.

**2. Two of three films use a portrait poster as their landscape `backdrop`.**
`crimson-harbor` and `the-last-signal` both set
`backdrop: '/media/poster-<slug>.png'` — the same square file as `poster`. Only
`nocturne-protocol` has a dedicated backdrop. Since `backdrop` is the share card,
supply a real landscape image per film.

**3. Media assets are heavy.** `public/media` is **4.8 MB** across 4 files
(0.86–1.5 MB each); `public/brands` adds 1.1 MB across 11 logos. The hero
`previewFrame` is on the LCP path. When real artwork lands, compress it, serve
WebP/AVIF, and consider migrating these to `next/image` — note that the hero
poster is intentionally a plain `<img>` with a literal `src` so the preload
scanner sees it before hydration; if you switch it, keep `priority`/
`fetchPriority="high"` and re-measure LCP.

---

## 11. The four frozen axes & how to verify them

Per the handover brief you may **re-implement the front end, back-end
integration, and data layer however you like** — but these four must come out
identical. Each is verifiable, so treat them as acceptance criteria.

### 1. Page UI
Layout, spacing, colour, typography, motion. The `zx-` comments in
`app/landing.css` record measured contrast ratios and the failure modes behind
specific values — read them before changing anything.

### 2. Page copy
All strings in `dictionaries/*.json`, all three locales. Key sets must stay
identical across the three files.

### 3. Funnel logic
- Preview cap **600s**, and the scrub bar spans **full runtime** so the locked
  remainder stays visible.
- **Both** gate triggers: play-out (`limit`) and scrub-past (`scrub`), reported
  separately.
- Gate **pauses and clamps** `currentTime` back to the cap.
- Dismissing the sheet **re-arms** the gate.
- **Any** Top 10 card tap → download upsell; cards never navigate.
- All CTAs route through the single `download(source)`.

### 4. SEO & performance design
Canonical + reciprocal hreflang + `x-default`; OG/Twitter; JSON-LD `@graph`
(`Movie` + `SoftwareApplication`/`AggregateOffer` + `FAQPage`); sitemap (12 URLs
with alternates) + robots; single `<h1>` per page; LCP poster with
`fetchPriority="high"` + intrinsic dimensions; speculation-rules prerender of
sibling locales at `moderate` eagerness; `content-visibility: auto` on the About
and FAQ sections; CSS-only `<details>` FAQ; lazy off-screen images; 48×48 minimum
touch targets; BFCache eligible (no `unload`, no `no-store`).

Verification commands:

```bash
# 12 URLs + reciprocal alternates
curl -s localhost:3000/sitemap.xml | grep -c '<url>'          # → 12

# canonical-only indexing: wrong segment must 404
curl -o /dev/null -w '%{http_code}\n' localhost:3000/en/filme/nocturne-protocol   # → 404

# JSON-LD graph
curl -s localhost:3000/en | grep -o 'application/ld+json'

# exactly one h1
curl -s localhost:3000/en | grep -c '<h1'                     # → 1

# LCP hint present in the raw HTML payload
curl -s localhost:3000/en | grep -o 'fetchpriority="high"'
```

---

## 12. Traps — bugs already fixed here

Each cost real debugging time and is easy to reintroduce. The code comments carry
the full reasoning.

**1. Never `await` the network inside the gate.** `enforceGate` is deliberately
synchronous. An earlier version awaited the pending `play()` promise; on an
unresolved media element (`readyState 0` — offline, blocked CDN, slow stream) that
promise never settles, so the dialog never opened **and** the latch stayed `true`,
permanently disabling both triggers. Nothing in the gate may sit behind a network
await.

**2. `pause()` must not await either.** `safePause` pauses immediately.
`safePlay` already attaches a rejection handler, so the `AbortError` from pausing
mid-play is handled there. Awaiting bought nothing and could ignore a user's tap
forever.

**3. Custom-element events need `addEventListener`.** `<md-dialog onclosed={fn}>`
is **silently dead** — React sets unknown props on custom elements as properties,
and assigning `.onclosed` only registers a listener for standardized `on*`
handlers, which Material's `closed` is not. Dismissals never reached the provider
and the gate latched shut after one open. See `useClosedEvent`.

**4. Don't upgrade Material elements before hydration.** See §3.

**5. `closePreview()` / `closeContent()` are guarded for idempotency** — do not
"simplify" them; you will double-report `modal_dismiss`.

**6. Player `poster` attribute and the `.zx-stage-poster` `<img>` must point at
the same asset**, or the cross-fade flickers.

**7. Two-badge limit** on `qualityTags` — a third wraps the metadata row on
phones.

---

## 13. QA checklist

Run per locale (`en`, `pt-br`, `th`) **and** on both a phone viewport (390px) and
desktop.

**Funnel**
- [ ] Autoplays muted on load; poster visible until playback resolves
- [ ] Tap frame toggles play/pause; controls fade ~2s into playback and any tap
      brings them back
- [ ] Unmute works; unmuting while paused inside the window resumes playback
- [ ] Let the preview run out → sheet opens, video paused, time clamped to 10:00
- [ ] Drag the scrub past 10:00 → sheet opens, thumb snaps back to 10:00
- [ ] Locked segment of the scrub bar is visibly distinct from the played portion
- [ ] Dismiss the sheet (button, scrim tap, **and** Escape) → gate re-arms; hit
      the wall again → sheet opens again
- [ ] Every Top 10 card opens the content-lock sheet; none navigates
- [ ] Every CTA (top bar, hero, info, chart tail, final, both sheets) triggers the
      download
- [ ] Offline / blocked-CDN check: throttle to offline, then trigger the gate — the
      sheet must still open (this is trap #1)

**Analytics** — after TODO A, confirm each of the 8 events fires exactly once per
action, that `apk_download_click.source` differs per CTA, and that
`preview_limit_reached` fires once per session while `modal_dismiss` never
double-fires.

**i18n / routing**
- [ ] `/` redirects to a locale-appropriate film URL
- [ ] All 12 URLs return 200; Thai URL works encoded and decoded
- [ ] Wrong locale/segment pairs 404
- [ ] Language switcher navigates (URL changes) and persists via `NEXT_LOCALE`
- [ ] Thai text renders without clipping (its dictionary is ~80% larger than
      English — the tightest layout case)
- [ ] `<html lang>` matches the locale

**SEO / perf** — the §11 commands, plus Rich Results Test on all three locales,
and Lighthouse on a throttled phone profile.

**A11y**
- [ ] Keyboard-only: reach and operate every control; focus visible throughout
- [ ] Focus is trapped in an open sheet and returns to the trigger on close
- [ ] Screen reader: Top 10 cards announce rank + title; decorative images are
      silent
- [ ] `prefers-reduced-motion` — sheets appear without sliding, marquee respects it
- [ ] All interactive targets ≥ 48×48
