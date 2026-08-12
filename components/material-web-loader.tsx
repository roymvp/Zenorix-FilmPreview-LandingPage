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
 * ONLY the five elements this page renders are registered. Nothing else may be
 * added speculatively: an unused registration is pure download weight on a page
 * that has no other use for it.
 *
 * WHY THIS IS RETRIED AND AWAITED
 * Until these imports resolve, every `md-*` tag on the page is an unknown element
 * (see the `:not(:defined)` guard in globals.css), so a failure leaves the upsell
 * dialog and the language menu permanently inert.
 *
 * That is no longer the whole page, and the comment here used to claim it was
 * ("the entire UI is unusable... the single most load-bearing fetch in the app").
 * The install CTA is a native `<button>` and the icons are plain spans, so first
 * paint and the primary conversion path now survive this fetch failing outright.
 * The retry stays because a dead dialog is still a real defect and a silent one —
 * it is simply no longer a white screen.
 *
 * These were previously five unawaited `import()` calls with no error handling.
 * A dynamic import returns a promise, so a failed chunk — a dropped connection,
 * or a stale chunk URL after a dev rebuild — rejected silently, unhandled, and
 * the page stayed permanently stuck in the unupgraded state with no console
 * error explaining why. Awaiting them lets a failure be caught, retried, and
 * finally logged instead of vanishing.
 */

/**
 * Each entry is a thunk so a retry re-invokes the import from scratch.
 *
 * This list must match the `md-*` tags actually present in the markup — grep for
 * `<md-` to confirm. It is currently exactly three:
 *   md-dialog         the one conversion dialog (x2 instances)
 *   md-menu           language switcher
 *   md-menu-item      language switcher options
 *
 * EVERYTHING LEFT ON THIS LIST IS CLICK-GATED, and that is now the rule for being
 * here. Two entries have been removed for failing it, both for the same reason:
 *
 *   md-filled-button  the download CTA, removed when it became a native `<button>`.
 *                     It was above the fold and stayed invisible until this fetch
 *                     resolved. See the note in download-cta.tsx.
 *   md-icon           all 12 icons on the page, removed in favour of
 *                     `<span class="zx-icon">`. Same defect at larger scale: the
 *                     glyphs come from a webfont that is preloaded and needs no JS
 *                     at all, yet the `:not(:defined)` guard held every one of them
 *                     hidden until these chunks landed (~1450ms vs ~1000ms FCP).
 *                     Material contributed a font-family and a 24px box, both of
 *                     which are now four lines of CSS in globals.css.
 *
 * So before adding an entry, check whether the element is reached by a deliberate
 * click. A dialog and the language menu are, so arriving late costs nothing. Anything
 * that renders as part of first paint does not belong here.
 *
 * This used to be `all.js` plus four labs imports. `all.js` pulls in EVERY
 * non-labs component, so the bundle carried sliders, checkboxes, switches,
 * radios, tabs, lists, chips and progress indicators that appear nowhere in this
 * app; the four labs imports (three card variants + badge) were not rendered at
 * all. Registering only what exists dropped the definitions chunk from 443 KB.
 */
const REGISTRATIONS: Array<() => Promise<unknown>> = [
  () => import('@material/web/dialog/dialog.js'),
  () => import('@material/web/menu/menu.js'),
  () => import('@material/web/menu/menu-item.js'),
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
          // Promise.all, so the chunks download in parallel — awaiting adds
          // error visibility, not latency.
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
