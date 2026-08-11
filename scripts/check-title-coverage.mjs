/**
 * Lists which `charts.ts` entries still have no `titles.ts` record.
 *
 * Deliberately a throwaway reporting script and NOT a build step: incomplete
 * coverage is the intended state (see the header of `titles.ts` — a title with no
 * researched facts is supposed to stay a download button rather than gain an empty
 * page). A check that failed the build on a missing record would invert that rule
 * and pressure whoever hit it into writing a stub.
 */
import { readFileSync } from 'node:fs'

/* Both files write each entry's id twice — once as the object key and once as an
   `id:` property, which the assertion loops in those files exist to keep in sync.
   Reading the `id:` property works for both layouts: `charts.ts` puts a whole
   entry on one line, `titles.ts` spreads a record over many. */
const idsIn = (path) =>
  [...readFileSync(path, 'utf8').matchAll(/\bid: '(\w+)'/g)].map((m) => m[1])

const charted = idsIn('lib/content/charts.ts')
const recorded = new Set(idsIn('lib/content/titles.ts'))
const missing = charted.filter((id) => !recorded.has(id))

console.log(`charted: ${charted.length}, with records: ${charted.length - missing.length}`)
console.log(`no record yet: ${missing.join(', ') || '(none)'}`)
