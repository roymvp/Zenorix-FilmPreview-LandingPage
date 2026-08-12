import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * JSX typings for the `md-*` custom elements used in this app.
 * Attributes are kebab-case on custom elements, and DOM event handlers are
 * lowercase (`onchange` / `oninput`) so React 19 assigns them as properties.
 */
type MdElement<Extra = Record<string, unknown>> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Extra & {
    slot?: string
    /**
     * Lowercase DOM handlers: React 19 assigns these as element properties, so
     * native custom-element events attach correctly.
     */
    oninput?: (event: Event) => void
    onchange?: (event: Event) => void
    onclose?: (event: Event) => void
    oncancel?: (event: Event) => void
    onopened?: (event: Event) => void
    onclosed?: (event: Event) => void
  }

/**
 * EXACTLY THE THREE ELEMENTS THE APP RENDERS, matched one-to-one with
 * MaterialWebLoader's REGISTRATIONS. Nothing speculative.
 *
 * This declared 25 elements — buttons, fabs, chips, cards, lists, sliders,
 * progress indicators, `md-icon`, `md-ripple` — for components that appear nowhere
 * in the app. That is not free: a declared type makes the tag compile, so the ONLY
 * thing standing between `<md-icon>` and being silently reintroduced was a comment.
 * With the type gone, an unregistered element is a typecheck failure instead of an
 * element that renders as an invisible unknown tag at runtime.
 *
 * `md-icon` in particular is deliberately absent: icons are `<span class="zx-icon">`
 * (see globals.css), and reintroducing the tag would restore the render-blocking
 * behaviour that was removed. Add a type here only alongside its registration in
 * MaterialWebLoader.
 */
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'md-dialog': MdElement<{ open?: boolean; type?: 'alert' | undefined }>
        'md-menu': MdElement<{
          open?: boolean
          anchor?: string
          positioning?: 'absolute' | 'fixed' | 'document' | 'popover'
          'has-overflow'?: boolean
          quick?: boolean
        }>
        'md-menu-item': MdElement<{
          disabled?: boolean
          selected?: boolean
          type?: string
          href?: string
          target?: string
          'keep-open'?: boolean
        }>
      }
    }
  }
}
