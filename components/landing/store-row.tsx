/**
 * The two upcoming store builds, shown beneath the hero's APK button.
 *
 * These are DELIBERATELY NOT BUTTONS. Nothing here is clickable, focusable or
 * hoverable, because there is nothing to click yet — the iOS and Google Play
 * builds do not exist. Rendering them as disabled buttons would have been the
 * obvious move and is the wrong one: a disabled control still reads as "this is
 * the way in, and it is broken/locked for me", which invites tapping and then
 * says no. A plain labelled row reads as a roadmap, which is what it is.
 *
 * So this is a `ul` of static `li`s. No `md-filled-button`, no `<a>`, no
 * `aria-disabled`, no click handler that swallows the event. It also means the
 * component ships zero JavaScript and stays a server component, unlike
 * `DownloadCta`.
 *
 * SHAPED LIKE THE REAL STORE BADGES, though. Apple's and Google's official badges
 * are one fixed lockup: rounded-rect, solid dark fill, hairline border, the store
 * glyph on the left, and two stacked lines of text — a small eyebrow over the
 * store's wordmark set noticeably larger. That silhouette is what makes a badge
 * instantly legible as "get it here", so the composition below follows it exactly
 * while the copy states the truth ("Coming soon to the / App Store").
 *
 * What it deliberately does NOT do is ship Apple's or Google's actual badge
 * artwork. Both are trademarked lockups whose guidelines require the real store
 * name, forbid alteration, and do not contemplate a "coming soon" variant — so
 * pasting the official SVG and retitling it would breach the terms it ships under.
 * A same-shaped badge built from our own type and the plain brand glyph carries
 * the affordance without misrepresenting availability.
 *
 * Their job is expectation-setting: an iPhone visitor who sees only an APK button
 * concludes the product is Android-only and leaves. Seeing "Coming soon to the App
 * Store" tells them to come back. That is also why these sit BELOW the APK button
 * and stay visibly quieter than it — the one action that works today must remain
 * the loudest thing in the hero.
 */
export function StoreRow({
  stores,
}: {
  stores: {
    id: string
    /**
     * Small first line, e.g. "Coming soon to the". Carries the availability so
     * the wordmark below it can stay the plain store name.
     */
    eyebrow: string
    /** Store wordmark, e.g. "App Store" — the badge's dominant line. */
    name: string
    /** Brand mark path under /public/brand. */
    icon: string
    /**
     * Full sentence naming the store AND its unavailability, e.g.
     * "App Store — coming soon". This is the ONLY thing a screen reader gets for
     * the item: the eyebrow and wordmark are split across two elements and would
     * otherwise be announced as two unrelated fragments.
     */
    srLabel: string
  }[]
}) {
  return (
    <ul className="zx-store-row">
      {stores.map((store) => (
        <li key={store.id} className="zx-store">
          {/* The whole visual composition is hidden from assistive tech and
              replaced by one clean sentence below, rather than being read as
              "image, Coming soon to the, App Store". */}
          <span className="zx-store-face" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="zx-store-icon"
              src={store.icon}
              alt=""
              width={22}
              height={22}
              loading="lazy"
              decoding="async"
            />
            <span className="zx-store-text">
              <span className="zx-store-eyebrow">{store.eyebrow}</span>
              <span className="zx-store-name">{store.name}</span>
            </span>
          </span>
          <span className="zx-visually-hidden">{store.srLabel}</span>
        </li>
      ))}
    </ul>
  )
}
