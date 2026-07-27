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

type ButtonLike = {
  disabled?: boolean
  href?: string
  target?: string
  type?: string
  value?: string
  name?: string
  'trailing-icon'?: boolean
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'md-filled-button': MdElement<ButtonLike>
        'md-filled-tonal-button': MdElement<ButtonLike>
        'md-outlined-button': MdElement<ButtonLike>
        'md-text-button': MdElement<ButtonLike>
        'md-elevated-button': MdElement<ButtonLike>
        'md-icon-button': MdElement<
          ButtonLike & { toggle?: boolean; selected?: boolean }
        >
        'md-fab': MdElement<{
          variant?: 'surface' | 'primary' | 'secondary' | 'tertiary'
          size?: 'small' | 'medium' | 'large'
          label?: string
          lowered?: boolean
        }>
        'md-icon': MdElement<{ filled?: boolean }>
        'md-ripple': MdElement<{ disabled?: boolean }>
        'md-divider': MdElement<{ inset?: boolean }>
        'md-elevated-card': MdElement
        'md-filled-card': MdElement
        'md-outlined-card': MdElement
        'md-list': MdElement
        'md-list-item': MdElement<{
          type?: string
          href?: string
          target?: string
          disabled?: boolean
        }>
        'md-linear-progress': MdElement<{
          value?: number
          max?: number
          indeterminate?: boolean
          buffer?: number
          'four-color'?: boolean
        }>
        'md-circular-progress': MdElement<{
          value?: number
          indeterminate?: boolean
        }>
        'md-slider': MdElement<{
          min?: number
          max?: number
          step?: number
          value?: number
          labeled?: boolean
          disabled?: boolean
          name?: string
        }>
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
        'md-assist-chip': MdElement<{
          label?: string
          disabled?: boolean
          elevated?: boolean
          href?: string
        }>
        'md-filter-chip': MdElement<{
          label?: string
          selected?: boolean
          disabled?: boolean
          elevated?: boolean
        }>
        'md-suggestion-chip': MdElement<{
          label?: string
          elevated?: boolean
          href?: string
        }>
        'md-chip-set': MdElement
        'md-badge': MdElement<{ value?: string }>
      }
    }
  }
}
