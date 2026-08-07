import { DownloadCta } from '@/components/landing/download-cta'
import { LanguageSwitcher } from '@/components/landing/language-switcher'
import { SITE } from '@/lib/config/site'
import type { Locale } from '@/lib/i18n/config'

/**
 * Frosted-glass bar layered over the hero's poster wall.
 *
 * It is translucent rather than solid so the art keeps running underneath, and
 * blurred rather than merely transparent because the wall behind it is
 * high-contrast key art — plain transparency would leave the wordmark and the
 * install button fighting whatever poster happens to be under them.
 */
export function TopBar({
  locale,
  homeHref,
  homeLabel,
  languageMenuLabel,
  installLabel,
  localeHrefs,
}: {
  locale: Locale
  homeHref: string
  homeLabel: string
  languageMenuLabel: string
  /** Short label for the compact install button (the long sentence is used
      by the in-page CTAs, which have a full row to themselves). */
  installLabel: string
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

      <div className="zx-topbar-actions">
        <LanguageSwitcher
          current={locale}
          menuLabel={languageMenuLabel}
          hrefs={localeHrefs}
        />
        <DownloadCta
          label={installLabel}
          source="topbar"
          className="zx-topbar-cta"
          bare
        />
      </div>
    </header>
  )
}
