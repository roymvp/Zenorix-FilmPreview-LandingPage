/**
 * Single funnel-instrumentation entry point.
 *
 * RESERVED INTEGRATION POINT (Firebase Analytics):
 *   import { getAnalytics, logEvent } from "firebase/analytics"
 *   logEvent(getAnalytics(), name, params)
 * Nothing else in the app talks to an analytics SDK, so wiring Firebase (or
 * GA4 / AppsFlyer) is a one-file change.
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

export function trackEvent(
  name: ConversionEvent,
  params: Record<string, string | number | boolean> = {},
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[v0] analytics', name, params)
  }
  // RESERVED: forward to Firebase Analytics here.
}
