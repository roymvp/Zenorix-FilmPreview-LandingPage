/**
 * Single funnel-instrumentation entry point.
 *
 * RESERVED INTEGRATION POINT (Firebase Analytics):
 *   import { getAnalytics, logEvent } from "firebase/analytics"
 *   logEvent(getAnalytics(), name, params)
 * Nothing else in the app talks to an analytics SDK, so wiring Firebase (or
 * GA4 / AppsFlyer) is a one-file change.
 */
export type ConversionEvent =
  | 'preview_play'
  | 'preview_unmute'
  | 'preview_limit_reached'
  | 'preview_scrub_locked'
  | 'modal_view'
  | 'modal_dismiss'
  | 'apk_download_click'
  | 'language_switch'

export function trackEvent(
  name: ConversionEvent,
  params: Record<string, string | number | boolean> = {},
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[v0] analytics', name, params)
  }
  // RESERVED: forward to Firebase Analytics here.
}
