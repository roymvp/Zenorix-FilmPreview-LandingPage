import { track } from '@vercel/analytics'

/**
 * Single funnel-instrumentation entry point. Forwards to Vercel Web Analytics.
 *
 * The `<Analytics />` component in `app/[lang]/layout.tsx` is what loads the
 * collector; without it `track()` is a silent no-op, so the two must ship
 * together. In production the script and its beacon are same-origin
 * (`/_vercel/insights/*`), which is why enabling this did NOT add a new origin to
 * the CSP in next.config.mjs — `script-src 'self'` and `connect-src 'self'`
 * already cover it. (Only `debug: true` pulls from va.vercel-scripts.com.)
 *
 * TWO PLATFORM LIMITS shape the call sites, not just this file:
 *   1. Custom events need Pro or above. This team is on Pro, so they land — but
 *      Pro includes NO free event allowance ($0.03/1K, page views included), so
 *      every event added here has a real, if small, bill attached. That is the
 *      reason for the "no emitter, no union member" rule below.
 *   2. Pro allows 2 PROPERTIES PER EVENT. All six events sit at 1-2 today, three
 *      of them exactly at the ceiling. Adding a third property to `modal_view`,
 *      `apk_download_click` or `language_switch` will NOT error — production
 *      silently strips the excess (`parseProperties(..., { strip: true })`), so
 *      the data just quietly goes missing. Drop a property before adding one, or
 *      buy the Plus add-on, which raises the cap to 8.
 *
 * Keep property values LOW-CARDINALITY. They are dashboard group-by keys, so an
 * interpolated title or id shatters one comparable bar into hundreds of
 * single-hit rows. `<ConversionCta>` in conversion-dialog.tsx used to report
 * `content_lock:${title}` for exactly that reason and now reports `content_lock`;
 * the title still reaches the dashboard via `modal_view`, which necessarily
 * fires before any click inside that modal.
 */
/**
 * Every event this app can emit — grep each one and you will find its call site.
 *
 * Four `preview_*` events used to sit here (play, unmute, limit_reached,
 * scrub_locked) from when the page was a film detail page with a trailer player.
 * That player is gone, so they were names for things that can no longer happen —
 * a union member with no emitter is worse than nothing, because it implies a
 * funnel step and quietly turns up empty in whatever dashboard is wired later.
 */
export type ConversionEvent =
  | 'modal_view'
  | 'modal_dismiss'
  | 'apk_download_click'
  | 'language_switch'
  /* Emitted by `<ContactLink>`, which reports its placement as `source`: the
     three entry points sit at very different scroll depths, so a single
     undifferentiated count could not say which one actually earns the ask. */
  | 'contact_click'
  /* Emitted by `<SocialLinks>`, reporting `network` — `x` or `x_community`. ONE
     event with a property rather than two events: the question is which of the two
     destinations people choose, which is a group-by on a single bar, not a
     comparison across separate counters. Both values are fixed strings, so
     cardinality stays at two. */
  | 'social_click'

/**
 * Every download CTA on the page, and the `source` property of
 * `apk_download_click`. This answers "which CTA earns the install", so it is a
 * CLOSED SET on purpose: as a plain `string` it already drifted once into
 * `content_lock:${title}`, which is unusable as a dashboard group-by. The union
 * makes that a compile error instead of a silent data problem discovered weeks
 * later in the dashboard.
 *
 * Adding a CTA means adding its name here — that is the intended friction, since
 * every value becomes a permanent row in the funnel report. Ordered roughly by
 * scroll depth so the type reads like the page.
 *
 * NOT the same axis as `<ContactLink source>`, which labels support entry points
 * rather than download placements; the two are independent and deliberately not
 * merged.
 */
export type CtaSource =
  | 'topbar'
  | 'hero'
  /* The "see more" tail under both Top 10 rails. It calls `download()` directly
     rather than rendering a `<DownloadCta>`, which is exactly why this union
     earned its keep: it was missed when these values were collected by hand and
     only surfaced as a type error. */
  | 'chart_more'
  | 'about'
  | 'final_cta'
  | 'footer'
  /* The locked-content upsell modal — one value for the whole modal, not one per
     title. See the comment at the top of this file. */
  | 'content_lock'

export function trackEvent(
  name: ConversionEvent,
  params: Record<string, string | number | boolean> = {},
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[v0] analytics', name, params)
  }
  /* Deliberately unguarded: `track()` throws in development when called outside
     the browser, and that is the behaviour we want. Every call site today is a
     DOM event handler in a client component, so a server-side call would mean a
     genuine mistake, and failing loudly in dev beats discovering months of
     missing production data later. In production the same case only warns, so a
     mistake can never take the page down for a visitor. */
  track(name, params)
}
