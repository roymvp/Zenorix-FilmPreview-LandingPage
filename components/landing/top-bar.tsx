import { ContactLink } from '@/components/landing/contact-link'
import { LanguageSwitcher } from '@/components/landing/language-switcher'
import { SITE } from '@/lib/config/site'
import type { Locale } from '@/lib/i18n/config'

/**
 * Frosted-glass bar layered over the hero's poster wall.
 *
 * It is translucent rather than solid so the art keeps running underneath, and
 * blurred rather than merely transparent because the wall behind it is
 * high-contrast key art — plain transparency would leave the wordmark fighting
 * whatever poster happens to be under it.
 *
 * Since the hero dropped its lockup, this bar is the ONLY place the brand is
 * stated: the mark plus a wordmark set in the display face (see `.zx-brand-name`).
 */
export function TopBar({
  locale,
  homeHref,
  homeLabel,
  languageMenuLabel,
  localeHrefs,
  contact,
}: {
  locale: Locale
  homeHref: string
  homeLabel: string
  languageMenuLabel: string
  localeHrefs: Record<Locale, string>
  /**
   * Support link shown beside the language switcher. Only the accessible name is
   * needed — this placement renders no visible label.
   */
  contact: { aria: string }
}) {
  return (
    <header className="zx-topbar">
      <a className="zx-brand" href={homeHref} aria-label={homeLabel}>
        {/* The mark alone, not the full lockup: the wordmark is set in live text
            beside it, so shipping the lockup here would print "ZENORIX" twice.
            alt="" + aria-hidden because the link is already named by homeLabel.
            eslint-disable — a 128px transparent WebP needs no image loader.
            
            width/height MUST match the file's real intrinsic size (128x98 after
            build-brand-assets.mjs halved it from 256). CSS sets `height: 26px;
            width: auto`, so these attributes are what reserve the correct box
            before the image lands; a stale 256x196 would describe the right aspect
            but is a claim about the file that is no longer true. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="zx-brand-mark"
          src="/brand/zenorix-mark.webp"
          alt=""
          aria-hidden="true"
          width={128}
          height={98}
        />
        {/* aria-hidden: the link already announces itself via homeLabel, so
            reading the wordmark too would just duplicate it. */}
        <span className="zx-brand-name" aria-hidden="true">
          {SITE.name}
        </span>
      </a>

      {/* NOTE: a compact filled "Install" button sat beside the language
          switcher (source="topbar", `.zx-topbar-cta`). Removed deliberately —
          the page keeps three full-width install CTAs (hero, about, final), and
          the white pill was the only fully opaque element on the glass, so it
          pulled the eye away from the hero's own CTA sitting right below it.
          If a persistent install affordance is wanted back, prefer a sticky
          bottom bar over restoring this one: it would not compete with the hero. */}
      <div className="zx-topbar-actions">
        {/* Glyph only, and no fill. The note above records why the install pill
            was pulled from this bar: it was the only opaque element on the glass
            and it competed with the hero's own CTA. Support is tertiary, so
            button chrome here would repeat that mistake for a weaker action.

            `contact.label` is deliberately NOT passed — no visible text at any
            width. The accessible name still arrives via `aria-label`, and mouse
            users get it as a tooltip; see contact-link.tsx. */}
        <ContactLink
          ariaLabel={contact.aria}
          source="topbar"
          className="zx-contact zx-contact--bar"
          icon="chat_bubble"
        />
        <LanguageSwitcher
          current={locale}
          menuLabel={languageMenuLabel}
          hrefs={localeHrefs}
        />
      </div>
    </header>
  )
}
