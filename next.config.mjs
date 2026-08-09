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
  `style-src 'self' 'unsafe-inline' ${FONT_CSS}`,
  `font-src 'self' ${FONT_FILES}`,
  "connect-src 'self'",
  /* Next.js injects inline hydration scripts, so expect script-src reports here.
     The correct fix is a nonce; 'unsafe-inline' would only silence the reports and
     give up most of what CSP is for. Resolve this BEFORE switching to enforcing. */
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
