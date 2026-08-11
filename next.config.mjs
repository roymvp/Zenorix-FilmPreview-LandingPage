/**
 * Baseline security response headers.
 *
 * None of these are required for the site to run — they are defense in depth on a
 * static, cookie-free marketing page. They are set here rather than in `<meta
 * http-equiv>` because a meta tag cannot express report-only CSP at all, and an
 * enforcing meta CSP breaks the v0 preview.
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

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  /* No <form> on the page, so nothing legitimately submits anywhere. */
  "form-action 'none'",
  /* Nothing is embedded, and nothing may embed this — the modern equivalent of the
     X-Frame-Options below, which is kept for older browsers. */
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  /* Local posters/logos. `data:` covers the inline SVG placeholders Next emits. */
  "img-src 'self' data:",
  /* 'unsafe-inline' is needed for real: the document carries 4 `style=` attributes
     (poster-wall tile positioning and the comparison bars' widths, both computed
     per render). A nonce cannot cover style ATTRIBUTES, only <style> elements, of
     which the page has none. */
  `style-src 'self' 'unsafe-inline' ${FONT_CSS}`,
  `font-src 'self' ${FONT_FILES}`,
  "connect-src 'self'",
  /* WHY THIS POLICY STAYS REPORT-ONLY. A production build emits 38 inline scripts
     per page (React hydration payloads), so enforcing this as-is would break the
     site. All three standard fixes were measured against a real build, and each was
     rejected on evidence rather than taste:

       nonce   Requires dynamic rendering on every page — Next.js injects nonces
               during SSR, so a prerendered page has no request to draw one from.
               These pages are static and CDN-served (verified: `x-vercel-cache:
               HIT`), which is what buys the ~630ms LCP. Trading that away is a
               real, every-visitor cost.
       SRI     `experimental.sri` builds fine and keeps pages static, but it only
               stamped `integrity` on the 6 EXTERNAL scripts. `integrity` is
               meaningless for inline code, so all 38 inline scripts stay blocked.
       hashes  Enumerating sha256 hashes of those inline scripts yielded 72 across
               the three locales, only 18 of them shared — the rest embed localized
               data. Every copy edit would silently invalidate a hash and
               white-screen a page: a permanent release hazard, not a one-time setup.

     So, stated honestly: this header currently protects nothing (report-only only
     logs), and the page it guards has no form, no cookie, and no user data, so the
     realistic XSS surface is small. Do NOT "fix" this by adding 'unsafe-inline' —
     that silences the reports while giving up most of what CSP is for, which is
     worse than the current honest no-op.

     What would change the calculus: React shipping nonce-less streaming hydration,
     or dynamic rendering becoming acceptable because the page gains authenticated
     or user-specific behavior. Re-measure then rather than assuming. */
  "script-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

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
  /* REPORT-ONLY on purpose. Report-only logs and protects nothing, so this is a
     staging step, not the finish line: watch the console for violations (chiefly
     the inline-script reports noted above), then rename this header to
     `Content-Security-Policy` to actually enforce it. */
  { key: 'Content-Security-Policy-Report-Only', value: CSP },
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
