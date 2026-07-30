import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config/site'

/* See app/sitemap.ts — `output: 'export'` requires metadata routes be static. */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
