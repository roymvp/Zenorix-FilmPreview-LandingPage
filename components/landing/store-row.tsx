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
 * Their job is expectation-setting: an iPhone visitor who sees only an APK button
 * concludes the product is Android-only and leaves. Seeing "iOS — coming soon"
 * tells them to come back. That is also why these sit BELOW the APK button and are
 * visibly quieter than it — the one action that works today must stay the loudest
 * thing in the hero.
 */
export function StoreRow({
  upcomingLabel,
  stores,
}: {
  /** Shared "Coming soon" badge text, rendered once per row. */
  upcomingLabel: string
  stores: {
    id: string
    /** Store name as shown, e.g. "iOS". */
    name: string
    /** Brand mark path under /public/brand. */
    icon: string
    /**
     * Full sentence naming the store AND its unavailability, e.g.
     * "iOS — coming soon". This is the ONLY thing a screen reader gets for the
     * item: the visible name and badge are split across two elements and would
     * otherwise be announced as two unrelated fragments, and the badge text is
     * repeated identically on both rows.
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
              "image, iOS, Coming soon". */}
          <span className="zx-store-face" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="zx-store-icon"
              src={store.icon}
              alt=""
              width={18}
              height={18}
              loading="lazy"
              decoding="async"
            />
            <span className="zx-store-name">{store.name}</span>
            <span className="zx-store-badge">{upcomingLabel}</span>
          </span>
          <span className="zx-visually-hidden">{store.srLabel}</span>
        </li>
      ))}
    </ul>
  )
}
