/**
 * Baseline security response headers.
 *
 * None of these are required for the site to run — they are defense in depth on a
 * static, cookie-free marketing page. They are set here rather than in `<meta
 * http-equiv>` because a meta tag cannot express report-only CSP at all, and an
 * enforcing meta CSP breaks the v0 preview.
 *
 * CSP ships as TWO headers: an enforced policy covering every resource type that
 * can be locked down today, and a report-only policy carrying the strict
 * `script-src` that cannot be. The reasoning, and the measurements behind it, are
 * at `ENFORCED_DIRECTIVES` below.
 *
 * The v0 chat preview strips framing and CSP headers so the page still renders in
 * an iframe; everything else passes through, and all of it applies on the deployed
 * site.
 */

/* The only two third-party origins this site touches, both Google Fonts, verified
   against the live document rather than assumed:
     fonts.googleapis.com  the Material Symbols stylesheet
     fonts.gstatic.com     the .woff2 the stylesheet points at
   The page makes no fetch/XHR/WebSocket calls at all, and every image, script and
   style is same-origin. Add an origin here the moment that stops being true —
   `connect-src` falls back to `default-src 'self'`, so a new endpoint would be
   blocked once this policy is enforced. */
const FONT_CSS = 'https://fonts.googleapis.com'
const FONT_FILES = 'https://fonts.gstatic.com'

/* EVERY DIRECTIVE THIS SITE NEEDS, in one place so the two policies below cannot
   drift apart. Each value was verified against a real production build rather than
   assumed — see the notes on the individual entries. */
const DIRECTIVES = {
  'default-src': "'self'",
  'base-uri': "'self'",
  /* 'self', NOT 'none' — and this is the one directive the audit changed my mind
     about. None of OUR pages contain a <form>; the earlier comment here said so and
     concluded 'none' was free. Scanning the 101 prerendered pages found one anyway:
     Next.js's own `_global-error.html` implements its "Reload" button as
     `<form style="margin:0"><button type="submit">Reload</button></form>`. A form
     with no `action` submits to the current URL, which is exactly how that button
     reloads.
     
     Under 'none' that submission is blocked, so the single recovery control on the
     crash page would silently do nothing — the worst possible moment for a dead
     button. 'self' allows it and still blocks the actual attack, which is an
     injected form POSTing scraped data to someone else's host. Effectively all of
     the protection, none of the breakage.
     
     Worth noting the failure mode: this would never have shown up in normal
     browsing, because the page it breaks only renders after an unhandled error. */
  'form-action': "'self'",
  /* Nothing is embedded, and nothing may embed this — the modern equivalent of the
     X-Frame-Options below, which is kept for older browsers. */
  'frame-ancestors': "'none'",
  'frame-src': "'none'",
  'object-src': "'none'",
  /* Local posters/logos. `data:` covers the inline SVG placeholders Next emits.
     Verified: of 115 requests on the built homepage, the only cross-origin ones are
     the two font hosts below. Every image is same-origin. */
  'img-src': "'self' data:",
  /* No <video>/<audio> anywhere in app/ or components/ — this is here so that
     omitting it from the enforced list below cannot leave media unrestricted. */
  'media-src': "'self'",
  /* 'unsafe-inline' is needed for real, and for two separate reasons — the second
     of which the previous comment here got wrong by claiming the pages had no
     <style> elements:
       - 14 `style=` ATTRIBUTES across the build (poster-wall tile positioning and
         the comparison bars' widths, both computed per render). A nonce cannot
         cover style attributes at all, only <style> elements.
       - 2 <style> ELEMENTS, in Next.js's own `_global-error.html` and
         `_not-found.html`, which inline their `--next-error-*` theme variables.
     Both are same-document inline CSS, so 'unsafe-inline' is unavoidable here. It
     is a far smaller concession than it would be for scripts: inline CSS cannot
     execute, and the exfiltration trick it can theoretically enable (smuggling data
     out through a crafted background-image URL) is shut off by `img-src 'self'`. */
  'style-src': `'self' 'unsafe-inline' ${FONT_CSS}`,
  'font-src': `'self' ${FONT_FILES}`,
  /* 'self' IS correct in production even though the site loads Vercel Analytics.
     Confirmed by reading @vercel/analytics' own `getScriptSrc()`: the cross-origin
     `va.vercel-scripts.com/v1/script.debug.js` is returned only when
     `isDevelopment()`; production returns the same-origin `/_vercel/insights/
     script.js`, which Vercel's edge proxies. That same-origin path is the whole
     reason the endpoint lives under `/_vercel/` — it is designed to survive ad
     blockers, and it survives this too. The `insights/event` URL that does appear
     with a host attached is in the package's SERVER bundle, which CSP does not
     govern because it never runs in a browser.
     
     This is the highest-value directive in the enforced set: it is what stops an
     injected script from POSTING anything it scrapes to an attacker's server. */
  'connect-src': "'self'",
  'script-src': "'self'",
}

/* WHICH DIRECTIVES ARE ENFORCED TODAY.
   
   Note what is NOT in this list: `script-src` AND `default-src`. That pairing is the
   entire trick, and getting it wrong white-screens the site. A production build
   emits 39–41 inline scripts per page (React hydration payloads) and inline code
   does not match `'self'`; because CSP falls back to `default-src` for any directive
   you omit, shipping `default-src` here would silently re-impose the same
   restriction on scripts and break all 101 prerendered pages. Leaving both out
   means scripts are unrestricted in the ENFORCED policy while every other resource
   type is locked down — and the strict `script-src` keeps reporting via the
   report-only policy below.
   
   This replaces an earlier all-or-nothing arrangement where the whole policy sat in
   report-only and therefore blocked exactly nothing. The three textbook ways to
   enforce `script-src` were each measured against a real build and rejected on
   evidence:
   
     nonce   Requires dynamic rendering on every page — Next.js injects nonces
             during SSR, so a prerendered page has no request to draw one from.
             These pages are static and CDN-served (verified: `x-vercel-cache:
             HIT`), which is what buys the ~690ms LCP. Trading that away is a real,
             every-visitor cost.
     SRI     `experimental.sri` builds fine and keeps pages static, but it only
             stamps `integrity` on the 9 EXTERNAL scripts. `integrity` is
             meaningless for inline code, so the ~40 inline scripts stay blocked.
     hashes  Enumerating sha256 hashes of those inline scripts yielded 107 distinct
             values across the three locales out of 143 total — only 36 shared, the
             rest embed localized data. Every copy edit would silently invalidate a
             hash and white-screen a page: a permanent release hazard, not one-time
             setup.
   
   So `script-src` stays report-only, and that limitation is stated plainly rather
   than papered over. Do NOT "fix" it by adding 'unsafe-inline' and promoting it —
   that silences the reports while giving up most of what CSP is for, which is worse
   than an honest gap. What would change the calculus: React shipping nonce-less
   streaming hydration, or dynamic rendering becoming acceptable because the page
   gains authenticated behavior. Re-measure then rather than assuming. */
const ENFORCED_DIRECTIVES = [
  'base-uri',
  'form-action',
  'frame-ancestors',
  'frame-src',
  'object-src',
  'img-src',
  'media-src',
  'style-src',
  'font-src',
  'connect-src',
]

const serializeCsp = (names) =>
  [...names.map((name) => `${name} ${DIRECTIVES[name]}`), 'upgrade-insecure-requests'].join('; ')

/* Enforced: everything above that is accurate and cannot break the build output. */
const CSP_ENFORCED = serializeCsp(ENFORCED_DIRECTIVES)

/* Report-only: the strict policy, INCLUDING `default-src` and `script-src`, so the
   inline-script violations keep arriving in the console and the day a real fix
   becomes available there is a live signal to verify it against. Sending both
   headers is explicitly supported — the browser evaluates each independently. */
const CSP_REPORT_ONLY = serializeCsp(Object.keys(DIRECTIVES))

const securityHeaders = [
  /* Stops the browser from second-guessing our Content-Type — the .apk and the
     WebP/JPEG assets should never be sniffed into something executable. */
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /* Full URL on same-origin navigations, bare origin cross-origin, nothing at all
     when downgrading to HTTP. */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  /* Two years. No `includeSubDomains`: this is asserted for the apex host only,
     since nothing here knows whether every future subdomain will be HTTPS. */
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  /* The site's main CTA is a download link, which is exactly the kind of thing
     worth framing and overlaying, and there is no reason to embed a landing page
     elsewhere. */
  { key: 'X-Frame-Options', value: 'DENY' },
  /* Empty `()` denies outright. The page uses none of these; if one is ever added,
     switch that entry to `=(self)` rather than deleting the header. */
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  /* TWO CSP HEADERS, on purpose — see the notes above `ENFORCED_DIRECTIVES`.
     
     This one is ENFORCED and actually blocks: an injected script cannot phone home
     (`connect-src`), cannot rewrite relative URLs out from under the page
     (`base-uri`), cannot submit anywhere (`form-action`), and cannot pull in an
     external stylesheet, font, image or plugin. It deliberately omits `script-src`
     and `default-src`, which is what keeps React's inline hydration payloads
     running. */
  { key: 'Content-Security-Policy', value: CSP_ENFORCED },
  /* And this one REPORTS ONLY, carrying the strict `script-src` that cannot be
     enforced yet. It blocks nothing by design; its job is to keep the violation
     stream alive so the gap stays visible instead of being forgotten. */
  { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
]

/* The canonical host, derived from the same env var lib/config/site.ts reads so this
   redirect can never disagree with the canonical tags. `www.` is stripped
   defensively: if that var is ever set WITH a www prefix, using its host unchanged
   as the redirect SOURCE would send www to itself and loop. */
const CANONICAL_HOST = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenorix.space',
).host.replace(/^www\./, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  /**
   * Collapse `www` onto the bare domain.
   *
   * Google is currently indexing the homepage as `http://www.zenorix.space` — the
   * http, www variant — even though every canonical tag on this site says
   * `https://zenorix.space/<locale>`. When a site answers on more than one host
   * variant, Google can treat them as separate sites and split link and ranking
   * signals between them, which is the last thing a domain competing against six
   * unrelated companies for its own brand name can afford.
   *
   * `permanent` (308) rather than temporary: this states which host is canonical
   * forever, and only a permanent redirect consolidates signals onto the target.
   * HTTP→HTTPS is handled by the platform, so this only fixes the host half.
   *
   * CAVEAT, so this is not mistaken for the whole fix: this runs INSIDE the app, so
   * it only fires if `www.<domain>` actually resolves to this deployment. If www is
   * a DNS record pointing somewhere else, the real fix is in the Vercel project's
   * domain settings (add both hosts, mark the bare domain primary). If the platform
   * already redirects www, this rule is simply never reached — harmless either way,
   * which is what makes it safe to add without being able to test www from here.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www.${CANONICAL_HOST}` }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
