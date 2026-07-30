# Zenorix — Film Preview Acquisition Landing Page

**Core Goal: Convert traffic into Android APK installs**

This is a conversion\-focused H5 landing page\. 

Users arrive via ads or influencer links, and get free access to the **first 10 minutes of a hit film \(not a trailer\)**\. Playback cuts off at the time limit, and users are prompted to download the app to continue — leveraging narrative immersion to drive conversions\.

Key page structure:

- One page hosts exactly one film preview

- Marketing team selects 3–5 top films

- Each film maps to one dedicated campaign URL

- Every campaign URL supports 3 localized language paths

This repository contains a production\-ready, high\-fidelity frontend implementation\. All UI, static copy, and interaction flows are finalized and validated\. Placeholder data is included; replace with real content and assets before launch\.

- Full integration guide → `[HANDOVER.md](./HANDOVER.md)`

- Supported routes: 3 market homepages \(`/en`, `/pt-br`, `/th`\) \+ 9 per\-film campaign pages

---

## 1\. Non\-Negotiable Constraints

These are hard delivery requirements\. 

**You may refactor backend logic or rewrite the frontend with a different tech stack — but the final output must match these rules 1:1\.**



1. **Page UI**: Layout, spacing, color, typography, and motion must match the design exactly\.

2. **Page copy**: Static UI strings in `dictionaries/*.json` \(3 locales\) must not be modified\. Dynamic film metadata \(title, runtime, synopsis, etc\.\) changes per film\.

3. **Funnel logic**: Preserve the full flow: 10\-minute preview cap, dual trigger paths \(playback exhaustion / seek past limit\), gate reset on modal dismiss, and Top 10 card → download upsell behavior\.

4. **SEO \& performance design**: Do not remove any SEO structure or elements\. Per\-page metadata and structured data update dynamically per film\. Hreflang rules, JSON\-LD structure, sitemap/robots rules, and performance optimizations \(LCP priority, `content-visibility`, prerendering\) must remain unchanged\.

---

## 2\. Dev To\-do Tasks

Ordered by dependency\. Full instructions in `[HANDOVER.md](./HANDOVER.md)`\.

### A\. Firebase Analytics Integration

Update only `lib/analytics.ts`\. Forward the 8 existing typed events to the Firebase SDK\. Do not scatter analytics calls across components\.

### B\. Replace Placeholder Content

- **Static \(no API needed\)**: Top bar brand logo, real APK URL / version / size / install count, footer legal links, localized film metadata\.

- **Requires API**: Film playback stream URLs, Top 10 chart posters, per\-film landscape preview frames\.

### C\. Expand Film Campaign URLs

Routing is fully built\. Add new films to the `movies` array with slug, assets, stream URL, and localized copy — 3 localized URLs and SEO config generate automatically\.

### D\. Production Deployment

Next\.js 16 compatibility: Rename `middleware.ts` to `proxy.ts` \(current build shows a deprecation warning; functionality is unaffected\)\.

---

## 3\. Security Requirements

### 3\.1 Deployment Isolation

Landing page viewers is uncontrolled\.

- Deploy this page on separate infrastructure, fully isolated from the core app backend\.

- Do not expose core app server addresses, internal API domains, or backend infrastructure details\.

- Prevent any ability to trace the landing page back to core business systems\.

### 3\.2 Content Anti\-Tampering

Protect the 10\-minute preview gate from bypass\.

- Block circumvention via frontend code tampering, network request modification, or browser dev tools manipulation\.

- Gate validation must use both frontend anti\-tampering checks and server\-side stream control\.

---

## 4\. Design Principles

|Principle|Implementation|
|---|---|
|Film is the only conversion hook|No watermarks, logos, or CTAs on the video frame\. Autoplay on mute by default — page loads with moving footage, not a static banner\.|
|Visualize content limits|Progress bar shows full film runtime\. Locked segment is visually distinct; users see exactly how much content is withheld\.|
|Single funnel, single exit|All CTAs call a single `download()` function\. No secondary conversions, social links, or distractions\. Footer only holds required legal text\.|
|Minimal playback controls|Only 3 controls: tap frame to play/pause, volume toggle, seek bar\.|
|Curiosity\-driven discovery|Top 10 cards show only rank and source badge — no titles or categories\.|
|Cinema\-style dark UI|Uniform near\-black background \(`#08090b`\)\. No visual noise to compete with the film\.|
|Indexable per\-market pages|Language switch navigates to a separate static URL\. Each market page retains its own link equity and indexability\.|

---

## 5\. Conversion Funnel Logic

### 5\.1 10\-Minute Preview Gate

Preview limit per film: `previewLimitSeconds: 600`

Two independent trigger paths\. Both open the same download modal, but report different reasons for accurate attribution\.

|Trigger|Logic|Event|`reason` value|
|---|---|---|---|
|Playback runs out|`timeupdate` detects `currentTime >= cap`|`preview_limit_reached`|`limit`|
|User seeks past the cap|`handleSeek` detects requested time `>= cap`|`preview_scrub_locked`|`scrub`|

On trigger:

- Player pauses immediately

- Playhead clamps back to the cap position

- Download modal opens

Closing the modal resets the gate\. The modal will reappear if the user hits the limit again\.

### 5\.2 Top 10 Content Lock

- Tapping any Top 10 card opens a content\-lock modal\. There is no detail page\.

- The "See more" button at the end of the list triggers `download()` directly\.

### 5\.3 Analytics Events

All 8 events are centralized in `lib/analytics.ts`:

```Plain Text
preview_play · preview_unmute · preview_limit_reached · preview_scrub_locked
modal_view · modal_dismiss · apk_download_click · language_switch
```

`apk_download_click` includes a `source` parameter to attribute clicks to specific page positions\.

### 5\.4 Fixed Engineering Pitfalls

Do not reintroduce these issues:

- **No async/await inside gate logic**: The gate runs synchronously\. Awaiting network calls or `play()` promises can permanently lock the gate if media fails to load\.

- **Ensure ****`closePreview()`**** runs on modal close**: Use `addEventListener` to bind the close handler\. Inline template event bindings for Material components are unreliable\.

---

## 6\. Development \& Reusability

You may fork this repo directly, or rewrite the frontend with a different tech stack\. All rewrites must comply with the **Non\-Negotiable Constraints** above\.

All replaceable business data is isolated in 4 files\. Search for `RESERVED` in the codebase to locate all integration points\.

|File|Owns|Replacement|
|---|---|---|
|`lib/content/movies.ts`|Film catalog \+ Top 10 chart, all locales|Content API / CMS|
|`lib/config/site.ts`|APK config, product metrics|Build\-time injection / API|
|`lib/analytics.ts`|Centralized event tracking|Firebase Analytics|
|`dictionaries/*.json`|Localized UI strings|Translation pipeline \(keep keys\)|

No film\-specific content is hardcoded in components\. Swap the data to generate all landing pages automatically\.

### Built\-in Capabilities

- 9 per\-film pages \+ 3 market homepages = 12 static pages total

- New films auto\-generate pages and SEO configuration

- Multi\-priority locale auto\-detection and redirect

- Localized URL paths with validation

- Full SEO/AEO suite \(canonical, hreflang, OG cards, JSON\-LD, sitemap, robots\)

- Performance optimizations \(LCP priority, prerendering, `content-visibility`, pure\-CSS FAQ\)

---

## 7\. Tech Stack

|Layer|Choice|Notes|
|---|---|---|
|Framework|Next\.js 16\.2\.9, App Router, Turbopack|Full\-page SSG|
|UI Runtime|React 19|Server components by default; 6 client islands|
|Language|TypeScript 5\.7, strict mode|`@/*` path alias|
|Components|`@material/web` 2\.4\.1 \(Material 3\)|Registered client\-side after hydration|
|Styling|Hand\-written vanilla CSS|Design tokens \+ page styles; no Tailwind|
|i18n|Custom zero\-dependency implementation|JSON locale files|
|Package Manager|pnpm||

```bash
pnpm install    # Install dependencies
pnpm dev        # Local dev: http://localhost:3000
pnpm build      # Build production bundle
pnpm start      # Run production build locally
```

Environment variables \(both optional; dev defaults provided\):

```Plain Text
NEXT_PUBLIC_SITE_URL=https://zenorix.app
NEXT_PUBLIC_APK_URL=/download/zenorix.apk
```

---

## 8\. Project Structure

```Plain Text
app/
  [lang]/page.tsx                  # Market homepage (featured film)
  [lang]/[segment]/[slug]/page.tsx # Per-film campaign page
  layout.tsx · [lang]/layout.tsx   # Global shell, locale config
  globals.css · landing.css        # Design tokens · page styles
  robots.ts · sitemap.ts           # Auto-generated SEO endpoints
components/landing/                # Business components
  conversion-provider.tsx          # Funnel state, central download()
  immersive-player.tsx             # 10-minute preview gate core
  conversion-dialogs.tsx           # Download prompt modals
lib/
  content/movies.ts                # Film catalog + chart data
  config/site.ts                   # Product & APK config
  analytics.ts                     # Central analytics entry point
  i18n/ · seo.ts                   # Locale rules · SEO generation
dictionaries/{en,pt-br,th}.json    # Localized UI strings
middleware.ts                      # Locale detection & redirects
```