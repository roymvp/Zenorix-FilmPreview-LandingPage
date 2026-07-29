'use client'

import { useEffect } from 'react'

/**
 * Registers all @material/web custom element definitions on the client,
 * after hydration. Importing the definitions at module top level would
 * upgrade the elements before React hydrates, and Lit elements mutate
 * their own attributes on upgrade (e.g. aria-label -> data-aria-label),
 * which triggers hydration mismatch errors. Loading in an effect means
 * React hydrates the plain server-rendered tags first, then the elements
 * upgrade in place.
 *
 * `all.js` registers every non-labs component. Labs components (cards,
 * segmented buttons, etc.) must be added here individually.
 *
 * WHY THIS IS RETRIED AND AWAITED
 * Until these imports resolve, every `md-*` tag on the page is an unknown
 * element (see the `:not(:defined)` guard in globals.css) — the entire UI is
 * unusable: no buttons, no dialogs, no menus. That makes this the single most
 * load-bearing fetch in the app, so it cannot be fire-and-forget.
 *
 * These were previously five unawaited `import()` calls with no error handling.
 * A dynamic import returns a promise, so a failed chunk — a dropped connection,
 * or a stale chunk URL after a dev rebuild — rejected silently, unhandled, and
 * the page stayed permanently stuck in the unupgraded state with no console
 * error explaining why. Awaiting them lets a failure be caught, retried, and
 * finally logged instead of vanishing.
 */

/** Each entry is a thunk so a retry re-invokes the import from scratch. */
const REGISTRATIONS: Array<() => Promise<unknown>> = [
  () => import('@material/web/all.js'),
  // Labs elements are not part of all.js and must be registered explicitly.
  () => import('@material/web/labs/card/elevated-card.js'),
  () => import('@material/web/labs/card/outlined-card.js'),
  () => import('@material/web/labs/card/filled-card.js'),
  () => import('@material/web/labs/badge/badge.js'),
]

const MAX_ATTEMPTS = 3

export function MaterialWebLoader() {
  useEffect(() => {
    // Guards against a retry landing after unmount (or after Strict Mode's
    // double-invoke), which would otherwise keep looping in the background.
    let cancelled = false

    const load = async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          // Promise.all, so the five chunks still download in parallel exactly as
          // before — awaiting adds error visibility, not latency.
          await Promise.all(REGISTRATIONS.map((register) => register()))
          return
        } catch (error) {
          if (cancelled) return

          if (attempt === MAX_ATTEMPTS) {
            // Loud on purpose. Reaching here means the page is inert, and the
            // silent version of this failure is what made the bug so hard to
            // diagnose from the screenshot alone.
            console.error(
              `[v0] Material Web failed to register after ${MAX_ATTEMPTS} attempts. ` +
                'All md-* elements will stay unupgraded and the UI will not respond.',
              error,
            )
            return
          }

          // Backoff (200ms, 400ms) to ride out a transient network blip rather
          // than hammering a chunk that is briefly unavailable mid-rebuild.
          await new Promise((resolve) => {
            setTimeout(resolve, 200 * 2 ** (attempt - 1))
          })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
