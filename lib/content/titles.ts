import { PLATFORMS, type PlatformId } from '@/lib/content/platforms'

/**
 * Per-title factual records behind `/[lang]/titles/[slug]`.
 *
 * READ THIS BEFORE ADDING A TITLE.
 *
 * `charts.ts` carries a warning that a `/movie/[slug]` route already existed here
 * once and was deleted as a doorway page: every URL rendered the same landing
 * page with a different `<title>`. These pages are only defensible because they
 * are the opposite case — each one states facts that appear nowhere else on the
 * site (cast, director, studios, ratings, synopsis) and that differ completely
 * from title to title. A record with nothing in it but a name would recreate
 * exactly the problem that got the old route removed.
 *
 * That is why `getTitle` is allowed to return `undefined` and why the chart card
 * only becomes a link when a record EXISTS. A chart entry with no record here
 * keeps the old download-dialog behaviour rather than gaining an empty page. Do
 * not add a stub to "cover" a title.
 *
 * EVERY FIELD IS RESEARCHED, NOT GENERATED. Each record below was taken from that
 * title's Wikipedia article, which cites the primary trade sources
 * (Deadline/Variety/THR) and the aggregators directly. If a fact could not be
 * verified it is OMITTED, never estimated — the optional fields exist so the page
 * can render an honest partial record.
 */

/** A person credit. Kept as plain strings — there are no per-person pages. */
type Credit = string

/**
 * A third-party critic score.
 *
 * `asOf` is REQUIRED and rendered next to the number. These scores move as
 * reviews land (Spider-Man's RT sat at 91% in early August and 90% a week later
 * on 402 reviews), so a bare number silently ages into a false claim. Stating the
 * date makes the value a citation instead: correct as of a day, verifiable
 * against the linked source.
 *
 * `reviewCount` is here because a percentage alone is not comparable — 64% on 200
 * critics and 94% on 490 are different kinds of statement, and Google's review
 * snippet guidelines expect the count alongside the value.
 */
type Score = {
  /** Percentage for Rotten Tomatoes, 0-100 weighted average for Metacritic. */
  value: number
  reviewCount: number
  /** ISO date the score was read from the source. */
  asOf: string
  /** Deep link to the score's own page, so a reader can check it. */
  url: string
}

export type TitleRecord = {
  /** Matches the `ChartEntry.id` in `charts.ts`; that file owns title and poster. */
  id: string
  /** URL segment. Stable — changing one breaks a live, indexed URL. */
  slug: string
  /**
   * One-sentence factual synopsis, written from the plot the studio and reviews
   * describe. Deliberately short: the page's job is to confirm what the title is
   * and send the reader to the app, not to host a plot summary that competes with
   * Wikipedia for the same query and loses.
   */
  synopsis: string
  /** ISO date of the title's first wide release in its home market. */
  released: string
  /** Runtime in minutes. Films only — a series has no single runtime. */
  runtime?: number
  directors: Credit[]
  writers?: Credit[]
  /** Billed principal cast, in credit order. Trimmed to the top billing block. */
  cast: Credit[]
  /** Genre words used as-is for display and for the `genre` field in JSON-LD. */
  genres: string[]
  productionCompanies: string[]
  distributors: string[]
  /**
   * Where it streams, if it has reached streaming. This is a DIFFERENT claim from
   * `ChartEntry.platform`, which is the badge burned onto the chart card — see the
   * note in `charts.ts` about the badge having to match the poster art. Where the
   * two disagree the chart badge is the one to fix.
   */
  streamingOn?: PlatformId
  rottenTomatoes?: Score
  metacritic?: Score
  /**
   * NO `imdb` FIELD, on purpose. IMDb's user rating is not published in a form
   * that can be cited with a review count and a date the way the two aggregator
   * scores above can, and it drifts continuously. A number here that nobody can
   * check is exactly the invented-rating case that `AggregateRating` markup is
   * penalised for.
   */
}

/* prettier-ignore */
const TITLES: Record<string, TitleRecord> = {
  spiderMan: {
    id: 'spiderMan',
    slug: 'spider-man-brand-new-day',
    synopsis: 'Four years after a spell erased him from the world\u2019s memory, Peter Parker protects New York anonymously while his powers begin to mutate and a young telepath hunts the agency that took her sister.',
    released: '2026-07-31',
    runtime: 145,
    directors: ['Destin Daniel Cretton'],
    writers: ['Chris McKenna', 'Erik Sommers'],
    cast: ['Tom Holland', 'Zendaya', 'Sadie Sink', 'Jacob Batalon', 'Jon Bernthal', 'Florence Pugh', 'Tramell Tillman', 'Marisa Tomei', 'Mark Ruffalo'],
    genres: ['Superhero', 'Action', 'Adventure'],
    productionCompanies: ['Columbia Pictures', 'Marvel Studios', 'Pascal Pictures'],
    distributors: ['Sony Pictures Releasing'],
    streamingOn: 'netflix',
    rottenTomatoes: { value: 90, reviewCount: 402, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/spider_man_brand_new_day' },
    metacritic:     { value: 66, reviewCount: 56,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/spider-man-brand-new-day/' },
  },

  odyssey: {
    id: 'odyssey',
    slug: 'the-odyssey',
    synopsis: 'Odysseus, king of Ithaca, endures a twenty-year journey home from the Trojan War while his wife Penelope holds off the suitors besieging his throne.',
    released: '2026-07-17',
    runtime: 173,
    directors: ['Christopher Nolan'],
    writers: ['Christopher Nolan'],
    cast: ['Matt Damon', 'Tom Holland', 'Anne Hathaway', 'Robert Pattinson', 'Lupita Nyong\u2019o', 'Zendaya', 'Charlize Theron'],
    genres: ['Epic', 'Action', 'Fantasy'],
    productionCompanies: ['Universal Pictures', 'Syncopy'],
    distributors: ['Universal Pictures'],
    streamingOn: 'peacock',
    rottenTomatoes: { value: 94, reviewCount: 490, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/the_odyssey' },
    metacritic:     { value: 88, reviewCount: 62,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/the-odyssey/' },
  },

  toyStory5: {
    id: 'toyStory5',
    slug: 'toy-story-5',
    synopsis: 'Jessie leads Bonnie\u2019s toys against Lilypad, a frog-shaped tablet that has become their kid\u2019s favourite plaything.',
    released: '2026-06-19',
    runtime: 102,
    directors: ['Andrew Stanton'],
    writers: ['Andrew Stanton', 'Kenna Harris'],
    cast: ['Tom Hanks', 'Tim Allen', 'Joan Cusack', 'Conan O\u2019Brien', 'Greta Lee', 'Craig Robinson', 'Mykal-Michelle Harris'],
    genres: ['Animation', 'Comedy', 'Family'],
    productionCompanies: ['Pixar Animation Studios'],
    distributors: ['Walt Disney Studios Motion Pictures'],
    streamingOn: 'disney-plus',
    rottenTomatoes: { value: 93, reviewCount: 320, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/toy_story_5' },
    metacritic:     { value: 73, reviewCount: 54,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/toy-story-5/' },
  },

  avatar: {
    id: 'avatar',
    slug: 'avatar-fire-and-ash',
    synopsis: 'Grieving the loss of their eldest son, the Sully family faces the RDA and the Mangkwan, a fire-worshipping Na\u2019vi clan led by the matriarch Varang.',
    released: '2025-12-19',
    runtime: 197,
    directors: ['James Cameron'],
    writers: ['James Cameron', 'Rick Jaffa', 'Amanda Silver'],
    cast: ['Sam Worthington', 'Zoe Salda\u00f1a', 'Sigourney Weaver', 'Stephen Lang', 'Kate Winslet', 'Oona Chaplin'],
    genres: ['Science fiction', 'Epic', 'Adventure'],
    productionCompanies: ['Lightstorm Entertainment'],
    distributors: ['20th Century Studios'],
    streamingOn: 'disney-plus',
    rottenTomatoes: { value: 66, reviewCount: 360, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/avatar_fire_and_ash' },
    metacritic:     { value: 61, reviewCount: 59,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/avatar-fire-and-ash/' },
  },

  kombat: {
    id: 'kombat',
    slug: 'mortal-kombat-ii',
    synopsis: 'Washed-up action star Johnny Cage is recruited into an interdimensional tournament against Outworld, where Earthrealm\u2019s champions must stop the immortal Shao Kahn.',
    released: '2026-05-08',
    runtime: 116,
    directors: ['Simon McQuoid'],
    writers: ['Jeremy Slater'],
    cast: ['Karl Urban', 'Adeline Rudolph', 'Jessica McNamee', 'Josh Lawson', 'Tati Gabrielle', 'Hiroyuki Sanada', 'Joe Taslim'],
    genres: ['Martial arts', 'Fantasy', 'Action'],
    productionCompanies: ['New Line Cinema', 'Atomic Monster', 'Broken Road Productions', 'Fireside Films'],
    distributors: ['Warner Bros. Pictures'],
    streamingOn: 'hbo-max',
    rottenTomatoes: { value: 64, reviewCount: 200, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/mortal_kombat_ii' },
    metacritic:     { value: 46, reviewCount: 35,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/mortal-kombat-ii/' },
  },

  hailMary: {
    id: 'hailMary',
    slug: 'project-hail-mary',
    synopsis: 'A middle school teacher wakes with amnesia aboard an interstellar ship, the last of his crew, and finds an unlikely ally in an alien engineer on the same desperate errand.',
    released: '2026-03-20',
    runtime: 156,
    directors: ['Phil Lord', 'Christopher Miller'],
    writers: ['Drew Goddard'],
    cast: ['Ryan Gosling', 'Sandra H\u00fcller', 'James Ortiz', 'Lionel Boyce'],
    genres: ['Science fiction', 'Adventure', 'Drama'],
    productionCompanies: ['Metro-Goldwyn-Mayer', 'Lord Miller Productions', 'Pascal Pictures'],
    distributors: ['Amazon MGM Studios', 'Sony Pictures Releasing International'],
    streamingOn: 'prime-video',
    rottenTomatoes: { value: 95, reviewCount: 424, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/project_hail_mary' },
    metacritic:     { value: 77, reviewCount: 60,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/project-hail-mary/' },
  },

  prada: {
    id: 'prada',
    slug: 'the-devil-wears-prada-2',
    synopsis: 'Two decades on, Andy Sachs returns to Runway as features editor and has to help Miranda Priestly save the magazine from a new owner who would replace its staff with AI.',
    released: '2026-05-01',
    runtime: 119,
    directors: ['David Frankel'],
    writers: ['Aline Brosh McKenna'],
    cast: ['Meryl Streep', 'Anne Hathaway', 'Emily Blunt', 'Justin Theroux', 'Kenneth Branagh', 'Stanley Tucci', 'Lucy Liu'],
    genres: ['Comedy', 'Drama'],
    productionCompanies: ['Wendy Finerman Productions'],
    distributors: ['20th Century Studios'],
    streamingOn: 'disney-plus',
    rottenTomatoes: { value: 78, reviewCount: 343, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/the_devil_wears_prada_2' },
    metacritic:     { value: 63, reviewCount: 57,  asOf: '2026-08-11', url: 'https://www.metacritic.com/movie/the-devil-wears-prada-2/' },
  },
}

/** Every record, for the sitemap and the index list. */
export const allTitles = (): TitleRecord[] => Object.values(TITLES)

/**
 * The record for a chart entry, or `undefined` when none has been researched yet.
 *
 * Callers MUST handle `undefined` by leaving the card as it is. See the file
 * header: a title with no verified facts gets no page.
 */
export const getTitle = (id: string): TitleRecord | undefined => TITLES[id]

/** Lookup by URL segment, for the route. */
export const getTitleBySlug = (slug: string): TitleRecord | undefined =>
  allTitles().find((title) => title.slug === slug)

/** Display name of the service a title streams on. */
export const streamingName = (record: TitleRecord): string | undefined =>
  record.streamingOn ? PLATFORMS[record.streamingOn].name : undefined
