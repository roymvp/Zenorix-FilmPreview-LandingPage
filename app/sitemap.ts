import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config/site'
import { locales } from '@/lib/i18n/config'
import { buildLocaleAlternates } from '@/lib/seo'

/**
 * Three URLs — one per market — each with reciprocal hreflang alternates.
 *
 * It used to list twelve: these three plus nine `/movie/[slug]` URLs that all
 * rendered the same landing page with only a different <title>. Submitting near
 * duplicates competes with itself and is what Google classifies as doorway pages,
 * so the sitemap now lists only pages that are genuinely distinct.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
    /* Shared with the `<head>` alternates via `buildLocaleAlternates`, and
       deliberately not a second local copy of that logic. This file used to build
       its own `languages` map, and the two had already drifted: the helper adds
       `x-default` (the page Google serves to visitors whose language matches none
       of the three markets) and this one did not. Google reads hreflang from both
       the head and the sitemap, so the two were making different claims about the
       same URLs. Import it so that can no longer happen. */
    alternates: buildLocaleAlternates((target) => `/${target}`) as {
      languages: Record<string, string>
    },
  }))
}
