# Zenorix — Film Preview Acquisition Landing Page

A multi-market, multi-film landing page whose single job is to convert paid traffic
into **Android APK installs**. A visitor arrives from an ad, watches the first
10 minutes of a real film for free, hits a hard wall, and is offered the app.

This repository is a **production-fidelity front-end**: every pixel, every string
and every interaction of the funnel is final and verified. The data behind it is
placeholder and is expected to be replaced by real content and real APIs.

- **Handover / integration guide → [`HANDOVER.md`](./HANDOVER.md)**
- **Live routes:** `/en`, `/pt-br`, `/th` + 9 per-film campaign URLs (see below)

---

## 1. Purpose & Design Intent

### The problem this page solves

Paid user acquisition for a streaming app normally sends traffic to a store
listing or a feature-list landing page. Both ask the visitor to *believe* a claim
("36,000+ titles!") before acting. This page instead **spends the product itself
as the ad**: it gives away 10 real minutes of a real film, up front, with no
signup, no email, no paywall interstitial.

By the time the wall appears, the visitor is no longer evaluating a claim — they
are mid-story and want the rest. The install ask lands on proven intent rather
than on a promise.

### Design principles actually enforced in the code

| Principle | How it is enforced |
| --- | --- |
| **The film is the hook** | The player frame carries no badge, watermark, logo or CTA. Autoplays muted (the only autoplay browsers allow) so the page opens on moving film, never a static banner. |
| **Show the lock, don't state it** | The scrub bar spans the **full runtime** while only the first 10 min is playable. The locked remainder is visible as a distinct track segment — the visitor *sees* how much is withheld. |
| **One funnel, one exit** | Every CTA on the page routes through a single `download()` call. There is no secondary conversion, no newsletter, no social link. The footer carries the legal minimum and nothing clickable that competes. |
| **Three controls, no duplicates** | Play/pause (tap the frame), mute/unmute (one icon), seek (scrub bar). No fullscreen, no time readout, no second play button. |
| **Curiosity over information** | Top 10 cards show rank + source-app badge only — no titles, no type labels. Every card is a locked door. |
| **Dark, cinema-first, one background** | A single near-black surface (`#08090b`) runs edge to edge; the top bar's lower edge is the page's only seam. Content is centred on an uninterrupted black page so nothing frames or competes with the film. |
| **Every market is a real page** | Language switching is *navigation* to a separate static URL, never client-side string swapping — so each market carries its own indexable URL and link equity. |

---

## 2. Conversion / Funnel Logic

> **This logic is contractual. See the "Do not change" list in §5.**

### The 10-minute preview gate

`previewLimitSeconds: 600` per film in `lib/content/movies.ts`. The gate has
**exactly two trigger paths**, both landing in the same bottom-sheet upsell but
reported under different reasons so attribution stays honest:

| Trigger | Path | Event | `reason` |
| --- | --- | --- | --- |
| **1. Preview ran out** | `timeupdate` observes `currentTime >= cap` | `preview_limit_reached` | `limit` |
| **2. Scrubbed past the wall** | `handleSeek` sees a requested time `>= cap` | `preview_scrub_locked` | `scrub` |

On either trigger the player **pauses, clamps `currentTime` back to the cap**, and
hands off to the dialog. Dismissing the sheet **re-arms** the gate, so a visitor
who closes it and hits the wall again converts again.

### The Top 10 content lock

Tapping **any** Top 10 card calls `openContent(title)` → content-lock sheet.
Cards never navigate to a detail page; there is no detail page. The rail's tail
button ("see more") skips the sheet and goes straight to `download()`.

### Instrumented events (8, all typed)

`lib/analytics.ts` is the **only** module that talks to an analytics SDK:

```
preview_play · preview_unmute · preview_limit_reached · preview_scrub_locked
modal_view · modal_dismiss · apk_download_click · language_switch
```

`apk_download_click` carries a `source` string identifying which CTA earned the
click (`chart_more`, dialog, hero pill, etc.), so every install can be attributed
to a position on the page.

### Two engineering traps already fixed here — do not reintroduce

1. **Never `await` the network inside the gate.** An earlier version awaited a
   pending `play()` promise before opening the dialog. On an unresolved media
   element (`readyState 0` — offline, blocked CDN, slow stream) that promise never
   settles, so the dialog never opened *and* the gate latched permanently shut.
   `enforceGate` is deliberately synchronous.
2. **`closePreview()` must actually run.** The player refuses to re-open the
   upsell while `previewReason` is non-null. A dismissal path that doesn't reach
   the provider latches the gate shut after one open. Material's `closed` event
   needs a real `addEventListener` — `<md-dialog onclosed={fn}>` is silently dead.

---

## 3. What Developers Can Reuse

The app is deliberately split so **all replaceable data sits behind four files**.
Search the codebase for `RESERVED` — every integration point is marked.

| File | Owns | Replace with |
| --- | --- | --- |
| `lib/content/movies.ts` | Film catalog + Top 10 chart, **all** film content in all 3 languages | Content API / CMS fetch |
| `lib/config/site.ts` | APK URL/version/size, install count, library counts | Build-time config or API |
| `lib/analytics.ts` | The single `trackEvent()` funnel | Firebase Analytics |
| `dictionaries/*.json` | 100% of UI copy, 3 locales, verified key-for-key identical | Translation pipeline (keep keys) |

**Nothing about a specific film is hardcoded in any component.** Swapping the two
exported constants in `movies.ts` regenerates every landing page in every language
without touching the UI layer.

### Already built — do not rebuild

- **Per-film campaign URLs (your TODO #3 is essentially done).** 3 films × 3
  locales = **9 static campaign pages**, plus 3 market homes = **12 static pages**,
  all verified building and serving `200`. Adding a film is one array entry in
  `movies.ts`; its 3 localized URLs, sitemap entries and hreflang cluster generate
  automatically.
- **Locale auto-detection** — `middleware.ts`: `NEXT_LOCALE` cookie → Vercel geo-IP
  (`US→en`, `BR→pt-br`, `TH→th`) → `Accept-Language` → default.
- **Localized URL segments** — `/en/movie/…`, `/pt-br/filme/…`, `/th/หนัง/…`, with
  a guard that 404s any wrong locale/segment pair (verified).
- **Full SEO/AEO layer** — canonical + reciprocal hreflang + `x-default`, OG/Twitter
  cards, JSON-LD `@graph` (`Movie` + `SoftwareApplication`/`AggregateOffer` +
  `FAQPage`), `sitemap.xml` (12 URLs w/ alternates), `robots.txt`.
- **Performance layer** — `fetchPriority="high"` LCP poster, speculation-rules
  prerender of sibling locales, `content-visibility` on the two heavy below-fold
  sections, CSS-only `<details>` FAQ (zero JS), 48×48 minimum touch targets.

---

## 4. Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16.2.9**, App Router, Turbopack | All pages SSG via `generateStaticParams` |
| UI runtime | **React 19** | Server Components by default; 6 client islands |
| Language | **TypeScript 5.7**, strict | `@/*` path alias |
| Components | **`@material/web` 2.4.1** (Material 3 web components) | Registered client-side after hydration — see `material-web-loader.tsx` |
| Styling | **Hand-written CSS, no Tailwind** | `app/globals.css` (design tokens) + `app/landing.css` (~2.3k lines, page styles) |
| i18n | Custom, zero-dependency | `lib/i18n/` + JSON dictionaries |
| Analytics | Stub, awaiting Firebase | `lib/analytics.ts` |
| Package manager | **pnpm** | |
| Runtime work | `middleware.ts` only | Every page itself is static |

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build   # 16 routes, ~5.5s
pnpm start
```

Environment variables (both optional, both have working dev fallbacks):

```
NEXT_PUBLIC_SITE_URL=https://zenorix.app      # canonical origin for SEO
NEXT_PUBLIC_APK_URL=/download/zenorix.apk     # APK download target
```

---

## 5. Constraints — Do Not Change

The following are **specified deliverables**, not implementation preference. They
have been designed, measured and verified. Rebuild the back end freely; leave
these alone.

1. **Page UI** — layout, spacing, colour, typography, motion.
2. **Page copy** — all strings in `dictionaries/*.json`, all 3 locales.
3. **Funnel logic** — the 10-minute preview cap, both gate triggers
   (play-out **and** scrub-past), the re-arm-on-dismiss behaviour, and the Top 10
   tap → download-upsell behaviour.
4. **SEO & performance design** — metadata, hreflang, JSON-LD, sitemap/robots,
   and the LCP/`content-visibility`/speculation-rules work.

You are free to **re-implement the front end from scratch** if that suits your
pipeline — but the result must be visually and behaviourally identical on these
four axes.

---

## 6. Remaining TODO

Ordered by dependency. Full instructions per item in
**[`HANDOVER.md`](./HANDOVER.md)**.

### A. Firebase Analytics
Single-file change in `lib/analytics.ts` — forward the 8 existing typed events.
Do not scatter SDK calls into components.

### B. Replace placeholder content
**Static (no API needed):** brand logo in the top bar, real APK URL + version/size/
install count, footer legal links, film metadata (title/tagline/synopsis/genres/
year/runtime, ×3 locales).

**Requires API support:** per-film playback URL (long-lived/signed; HLS/DASH
attaches to the same `videoRef`), Top 10 posters (`ChartEntry` has no `poster`
field yet — deliberately), per-film landscape opening frames (`previewFrame`,
currently one placeholder SVG for all 3 films).

### C. Multi-film campaign links
**Routing is already done.** Remaining work is content: add each promoted film to
the `movies` array with its own slug, artwork, stream and 3-locale copy. Each
film automatically gets 3 localized URLs.

### D. Second-phase development, QA, production deploy
Includes one known Next.js 16 chore: rename `middleware.ts` → `proxy.ts` (the
build currently prints a deprecation warning; behaviour is unaffected).

---

## 7. Project Structure

```
app/
  [lang]/page.tsx                  Market home → featured film
  [lang]/[segment]/[slug]/page.tsx Per-film campaign page (9 static)
  layout.tsx · [lang]/layout.tsx   Shells, fonts, <html lang>
  globals.css · landing.css        Design tokens · page styles
  robots.ts · sitemap.ts           Generated SEO endpoints
components/landing/                12 components (see HANDOVER.md §3)
  conversion-provider.tsx          ← funnel state, single download()
  immersive-player.tsx             ← the 10-minute gate
  conversion-dialogs.tsx           ← both upsell sheets
lib/
  content/movies.ts                ← film catalog + Top 10
  config/site.ts                   ← APK + product config
  analytics.ts                     ← Firebase integration point
  i18n/ · seo.ts                   Locale contract · metadata + JSON-LD
dictionaries/{en,pt-br,th}.json    All UI copy
middleware.ts                      Locale detection + redirect
```
