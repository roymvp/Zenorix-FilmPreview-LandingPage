'use client'

import { trackEvent } from '@/lib/analytics'
import { ORG, SITE, SOCIAL } from '@/lib/config/site'

/**
 * The X mark, inline.
 *
 * Hand-written rather than pulled from an icon font because the footer's glyphs
 * come from Material Symbols, which carries no brand logos at all — there is no
 * `md-icon` name that renders this. One path, `currentColor`, so it inherits the
 * link colour and the hover transition like every other icon down here.
 *
 * `aria-hidden`: the anchor supplies the accessible name. Without this the mark
 * would either be announced as a meaningless graphic or, worse, double up on the
 * label.
 */
function XMark() {
  return (
    <svg
      className="zx-footer-contact-mark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/**
 * Every way to reach us, as ONE list in ONE format: glyph, then name.
 *
 * THIS REPLACES FOUR DIFFERENT TREATMENTS OF THE SAME IDEA, which is the entire
 * reason the component exists. The footer used to render its four channels as:
 *
 * - support — a `primary`-coloured link with an icon and a label;
 * - the brand account — a muted link with an icon and NO label;
 * - the community — a muted link with an icon and a label;
 * - email — a bare underlined address, no icon, in a different band of the footer
 *   entirely.
 *
 * Four formats for four peers. Each was defensible alone — and the old comments
 * defended each one — but nobody reads a footer one link at a time. What a reader
 * actually sees is a column where every row looks like a different kind of thing,
 * so the column has no shape and the eye cannot scan it. Uniform rows turn the same
 * four links into a list you can run down in one pass.
 *
 * IT IS A DATA ARRAY, NOT FOUR HAND-WRITTEN ANCHORS, and that is the point rather
 * than terseness: one JSX template renders all four, so the format is structurally
 * guaranteed instead of maintained by hand. Four separate blocks are exactly how the
 * old version drifted apart in the first place — each was edited on its own, each
 * time for a locally sensible reason.
 *
 * Anchor discipline, inherited from the components this replaces: real hrefs so
 * middle-click and "copy link address" work, `noreferrer` alongside `noopener` so no
 * destination is handed the visitor's exact market URL, and click handlers that only
 * report and never `preventDefault()`, so tracking cannot swallow a navigation.
 */
export function FooterContacts({
  contact,
  social,
}: {
  contact: { channel: string; aria: string }
  social: { follow: string; community: { label: string; aria: string } }
}) {
  const channels = [
    {
      key: 'support',
      href: SITE.contactUrl,
      icon: 'chat_bubble',
      /**
       * "Customer service", from the dictionary — NOT `contact.label` and no longer
       * the literal "Telegram".
       *
       * `contact.label` is still wrong for this row: it reads "Contact us" / "Fale com
       * a gente", which is the COLUMN HEADING's job, and in pt-BR it is the identical
       * string, so the row would repeat the heading verbatim. "Telegram" avoided that
       * by naming the transport instead — but the transport is an implementation
       * detail, and naming it made this row answer a different question than the three
       * beneath it. What the reader wants to know is what the channel IS.
       *
       * So it is a separate `contact.channel` key rather than a literal: unlike the
       * brand names beside it this is a common noun and has to translate.
       * `contact.aria` ("Contact us on Telegram") still names the transport in the
       * accessible name, so nothing is lost for someone deciding whether to tap it.
       */
      label: contact.channel,
      aria: contact.aria,
      external: true,
      track: () => trackEvent('contact_click', { source: 'footer' }),
    },
    {
      key: 'x',
      href: SOCIAL.x.url,
      icon: 'x',
      /**
       * The handle, "@zenorix_tv", composed from `SOCIAL.x.handle` rather than
       * hardcoded — the config stores it bare precisely so it can be written either
       * way, and deriving it means the label cannot drift from the `href` above it.
       *
       * It said "X" before, which named the platform the icon had already shown while
       * leaving the actual account unstated. The handle is the useful half: it is what
       * a reader searches for, and it distinguishes this row from the community below
       * it — both live on X, so "X" was never what told them apart.
       */
      label: `@${SOCIAL.x.handle}`,
      aria: social.follow,
      external: true,
      track: () => trackEvent('social_click', { network: 'x' }),
    },
    {
      key: 'community',
      href: SOCIAL.xCommunity.url,
      icon: 'group',
      /* Stays localized: unlike Telegram and X this is a common noun, not a brand. */
      label: social.community.label,
      aria: social.community.aria,
      external: true,
      track: () => trackEvent('social_click', { network: 'x_community' }),
    },
    {
      key: 'email',
      href: `mailto:${ORG.email}`,
      icon: 'mail',
      label: ORG.email,
      /**
       * LAST, and that ordering is load-bearing. `ORG.email` is the company's
       * address of record for rights and privacy correspondence — NOT a support
       * channel (see the note on `SITE.contactUrl`), and the two must not read as
       * alternatives. Uniform rows make them look more alike than they are, so the
       * distinction is carried by putting the three real support channels first and
       * by an accessible name that states what the address is for rather than just
       * reading the address aloud.
       */
      aria: `${ORG.email} — ${ORG.legalName}`,
      /* No `target="_blank"`: a `mailto:` hands off to a mail client, and a new tab
         would either be a blank one left behind or a webmail compose window the
         visitor did not ask to have opened in this tab's place. */
      external: false,
      track: () => trackEvent('contact_click', { source: 'footer_email' }),
    },
  ]

  return (
    <ul className="zx-footer-contact-list">
      {channels.map((channel) => (
        <li key={channel.key}>
          <a
            className="zx-footer-contact"
            href={channel.href}
            aria-label={channel.aria}
            {...(channel.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : null)}
            onClick={channel.track}
          >
            {channel.icon === 'x' ? (
              <XMark />
            ) : (
              <span className="zx-icon" aria-hidden="true">{channel.icon}</span>
            )}
            {channel.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
