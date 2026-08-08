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
}: {
  locale: Locale
  homeHref: string
  homeLabel: string
  languageMenuLabel: string
  localeHrefs: Record<Locale, string>
}) {
  return (
    <header className="zx-topbar">
      <a className="zx-brand" href={homeHref} aria-label={homeLabel}>
        {/* The mark alone, not the full lockup: the wordmark is set in live text
            beside it, so shipping the lockup here would print "ZENORIX" twice.
            alt="" + aria-hidden because the link is already named by homeLabel.
            eslint-disable — a 256px transparent WebP needs no image loader. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="zx-brand-mark"
          src="/brand/zenorix-mark.webp"
          alt=""
          aria-hidden="true"
          width={256}
          height={196}
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
        <LanguageSwitcher
          current={locale}
          menuLabel={languageMenuLabel}
          hrefs={localeHrefs}
        />
      </div>
    </header>
  )
}
