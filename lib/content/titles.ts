import type { ChartEntryId } from '@/lib/content/charts'
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
  id: ChartEntryId
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
  /**
   * Series only: seasons and episodes aired so far, and the network that carries
   * it. A film leaves all three undefined, which is what the page keys off to
   * decide between rendering a runtime and rendering a season count — rather than
   * re-deriving `kind` from `charts.ts`.
   *
   * `episodes` counts EPISODES RELEASED, not ordered. Lioness season 3 has an
   * eight-episode order with two aired at the time of writing, and a page that
   * claims 24 episodes exist sends a reader looking for eighteen that do not.
   */
  seasons?: number
  episodes?: number
  network?: string
  /**
   * Films are credited to a director; series are credited to a creator. These are
   * separate fields rather than one relabelled "directed by", because a series
   * like House of the Dragon has dozens of episode directors and naming Ryan
   * Condal as its director would simply be false. Exactly one of the two is set.
   */
  directors?: Credit[]
  creators?: Credit[]
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

/* Keyed by `ChartEntryId`, not `string`.
   
   This is load-bearing, not decoration. Two records here were first written as
   `superTroopers` and `mastersUniverse` while `charts.ts` calls those titles
   `troopers3` and `masters` — with a `string` key that mismatch compiles
   perfectly, `getTitle` just never finds the record, and the only symptom is a
   chart card that quietly stays a button and a page that never exists. Typing the
   key makes that a build error instead of a silently missing page.
   
   `Partial` because coverage is deliberately incomplete: see the file header. */
/* prettier-ignore */
const TITLES: Partial<Record<ChartEntryId, TitleRecord>> = {
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

  moana: {
    id: 'moana',
    slug: 'moana-live-action',
    synopsis: 'A live-action retelling of the 2016 film: the ocean chooses Moana, daughter of Motunui\u2019s chief, to find the demigod Maui and restore the stolen heart of Te Fiti.',
    released: '2026-07-10',
    runtime: 115,
    directors: ['Thomas Kail'],
    writers: ['Jared Bush', 'Dana Ledoux Miller'],
    cast: ['Catherine Laga\u2019aia', 'Dwayne Johnson', 'Rena Owen', 'John Tui', 'Frankie Adams', 'Jemaine Clement'],
    genres: ['Musical', 'Adventure', 'Family'],
    productionCompanies: ['Walt Disney Pictures', 'Seven Bucks Productions', 'Flynn Picture Co.', '5000 Broadway Productions'],
    distributors: ['Walt Disney Studios Motion Pictures'],
    streamingOn: 'disney-plus',
    /* A genuinely poorly reviewed film. Recorded as found — the point of citing a
       source is that the number is not ours to choose. */
    rottenTomatoes: { value: 32, reviewCount: 193, asOf: '2026-08-10', url: 'https://www.rottentomatoes.com/m/moana_2026' },
    metacritic:     { value: 42, reviewCount: 40,  asOf: '2026-07-14', url: 'https://www.metacritic.com/movie/moana-2026/' },
  },

  troopers3: {
    id: 'troopers3',
    slug: 'super-troopers-3',
    synopsis: 'The Vermont state troopers reunite for Farva\u2019s wedding to Thorny\u2019s sister, while a new narcotic called Canadian Crystal turns up in their jurisdiction.',
    released: '2026-08-07',
    runtime: 104,
    directors: ['Jay Chandrasekhar'],
    writers: ['Broken Lizard'],
    cast: ['Jay Chandrasekhar', 'Kevin Heffernan', 'Steve Lemme', 'Paul Soter', 'Erik Stolhanske', 'Hannah Simone', 'Nat Faxon', 'Chace Crawford', 'Brian Cox'],
    genres: ['Comedy'],
    productionCompanies: ['Broken Lizard Industries', 'Cataland Films'],
    distributors: ['Searchlight Pictures'],
    rottenTomatoes: { value: 49, reviewCount: 35, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/super_troopers_3' },
    metacritic:     { value: 37, reviewCount: 9,  asOf: '2026-08-08', url: 'https://www.metacritic.com/movie/super-troopers-3/' },
  },

  masters: {
    id: 'masters',
    slug: 'masters-of-the-universe',
    synopsis: 'Raised on Earth after fleeing Eternia as a child, Prince Adam recovers the Sword of Power and returns home to face the warlock Skeletor.',
    released: '2026-06-05',
    runtime: 140,
    directors: ['Travis Knight'],
    writers: ['Chris Butler', 'Aaron Nee', 'Adam Nee', 'David Callaham'],
    cast: ['Nicholas Galitzine', 'Camila Mendes', 'Alison Brie', 'James Purefoy', 'Morena Baccarin', 'Kristen Wiig', 'Jared Leto', 'Idris Elba'],
    genres: ['Sword and sorcery', 'Fantasy', 'Action'],
    productionCompanies: ['Metro-Goldwyn-Mayer', 'Mattel Studios', 'Escape Artists'],
    distributors: ['Amazon MGM Studios', 'Sony Pictures Releasing International'],
    streamingOn: 'prime-video',
    rottenTomatoes: { value: 67, reviewCount: 255, asOf: '2026-08-05', url: 'https://www.rottentomatoes.com/m/masters_of_the_universe' },
    metacritic:     { value: 52, reviewCount: 44,  asOf: '2026-06-15', url: 'https://www.metacritic.com/movie/masters-of-the-universe/' },
  },

  /* Series. `released` is the SERIES premiere, not the current season's — the
     field is documented as first release and a reader comparing two shows needs
     the same measure on both. The scores below are for the season now airing,
     which is the one a visitor is looking for; `asOf` carries the date and the
     review count keeps it honest. */
  dragon: {
    id: 'dragon',
    slug: 'house-of-the-dragon',
    synopsis: 'Two centuries before Game of Thrones, the Targaryen succession splits the family into rival courts and ignites the civil war known as the Dance of the Dragons.',
    released: '2022-08-21',
    seasons: 3,
    episodes: 26,
    network: 'HBO',
    creators: ['Ryan Condal', 'George R. R. Martin'],
    cast: ['Emma D\u2019Arcy', 'Olivia Cooke', 'Matt Smith', 'Rhys Ifans', 'Steve Toussaint', 'Eve Best', 'Fabien Frankel', 'Tom Glynn-Carney', 'Ewan Mitchell'],
    genres: ['Fantasy', 'Drama', 'Action'],
    productionCompanies: ['HBO Entertainment', 'Bastard Sword', '1:26 Pictures'],
    distributors: ['HBO'],
    streamingOn: 'hbo-max',
    /* Season 3, the season airing as of this writing. */
    rottenTomatoes: { value: 91, reviewCount: 163, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/tv/house_of_the_dragon/s03' },
    metacritic:     { value: 75, reviewCount: 27,  asOf: '2026-07-29', url: 'https://www.metacritic.com/tv/house-of-the-dragon/season-3/' },
  },

  lioness: {
    id: 'lioness',
    slug: 'special-ops-lioness',
    synopsis: 'A CIA officer runs a programme that embeds female operatives inside the inner circles of targets in the war on terror, at mounting cost to the women sent in.',
    released: '2023-07-23',
    seasons: 3,
    /* 18 released of a 24-episode run: season 3 has an eight-episode order with
       two aired. See the `episodes` note on the type. */
    episodes: 18,
    network: 'Paramount+',
    creators: ['Taylor Sheridan'],
    cast: ['Zoe Salda\u00f1a', 'Laysla De Oliveira', 'Nicole Kidman', 'Morgan Freeman', 'Michael Kelly', 'Dave Annable', 'Genesis Rodriguez'],
    genres: ['Spy thriller', 'Action', 'Drama'],
    productionCompanies: ['Bosque Ranch Productions', '101 Studios', 'Blossom Films', 'Paramount Television Studios'],
    distributors: ['Paramount+'],
    streamingOn: 'paramount-plus',
    /* Season 3. A low review count on purpose — 11 critics is what the season has
       drawn so far, and printing the count is what keeps an 82% honest. */
    rottenTomatoes: { value: 82, reviewCount: 11, asOf: '2026-08-04', url: 'https://www.rottentomatoes.com/tv/lioness/s03' },
    metacritic:     { value: 76, reviewCount: 5,  asOf: '2026-08-04', url: 'https://www.metacritic.com/tv/lioness/season-3/' },
  },

  rickMorty: {
    id: 'rickMorty',
    slug: 'rick-and-morty',
    synopsis: 'An alcoholic mad scientist drags his anxious grandson through an infinite number of realities, splitting their time between interdimensional catastrophe and suburban family life.',
    released: '2013-12-02',
    seasons: 9,
    episodes: 91,
    network: 'Adult Swim',
    creators: ['Justin Roiland', 'Dan Harmon'],
    /* Cardoni and Belden voice Rick and Morty from season 7 on, after Adult Swim
       recast the roles. Billed first because they are who a viewer of the current
       season actually hears; Roiland is deliberately not listed. */
    cast: ['Ian Cardoni', 'Harry Belden', 'Chris Parnell', 'Spencer Grammer', 'Sarah Chalke'],
    genres: ['Adult animation', 'Science fiction', 'Black comedy', 'Adventure'],
    productionCompanies: ['Williams Street', 'Harmonious Claptrap', 'Starburns Industries', 'Green Portal Productions'],
    distributors: ['Adult Swim'],
    streamingOn: 'hbo-max',
    /* Season 9, which finished airing 2026-07-26. Nine critics is a small sample,
       and printing the count is what stops a bare "100%" from reading as a bigger
       claim than it is. Metacritic has no score for this season, so none is set. */
    rottenTomatoes: { value: 100, reviewCount: 9, asOf: '2026-08-12', url: 'https://www.rottentomatoes.com/tv/rick_and_morty/s09' },
  },

  walterBoys: {
    id: 'walterBoys',
    slug: 'my-life-with-the-walter-boys',
    synopsis: 'Orphaned at fifteen, a Manhattan teenager is taken in by family friends on a rural Colorado ranch and has to find her footing in a house of ten siblings.',
    released: '2023-12-07',
    seasons: 3,
    episodes: 30,
    network: 'Netflix',
    creators: ['Melanie Halsall'],
    cast: ['Nikki Rodriguez', 'Noah LaLonde', 'Ashby Gentry', 'Connor Stanhope', 'Jaylan Evans', 'Sarah Rafferty', 'Marc Blucas'],
    genres: ['Teen drama', 'Romance'],
    productionCompanies: ['Nomadic Pictures', 'iGeneration Studios', 'Sony Pictures Television'],
    distributors: ['Netflix'],
    streamingOn: 'netflix',
    /* Season 3, released 2026-08-06, on five reviews. The series' own history is
       the reason the season is labelled rather than the show: season 1 scored 45%
       and season 2 67%, so an unqualified "100%" here would be misleading. */
    rottenTomatoes: { value: 100, reviewCount: 5, asOf: '2026-08-12', url: 'https://www.rottentomatoes.com/tv/my_life_with_the_walter_boys/s03' },
  },

  findYou: {
    id: 'findYou',
    slug: 'i-will-find-you',
    synopsis: 'Wrongly imprisoned for murdering his three-year-old son, a former law professor breaks out after his ex-sister-in-law brings him a recent photograph in which the boy appears to be alive.',
    released: '2026-06-18',
    /* A closed-ended limited series: one season, eight episodes, all released the
       same day. `seasons: 1` is the true figure rather than an omission — the page
       reads it to label the title a series at all. */
    seasons: 1,
    episodes: 8,
    network: 'Netflix',
    creators: ['Robert Hull', 'Harlan Coben'],
    cast: ['Sam Worthington', 'Britt Lower', 'Milo Ventimiglia', 'Erin Richards', 'Jonathan Tucker', 'Madeleine Stowe', 'Logan Browning', 'Chi McBride'],
    genres: ['Crime drama', 'Thriller'],
    productionCompanies: ['Final Twist Productions', 'I Have an Idea Productions', 'Netflix Worldwide Productions'],
    distributors: ['Netflix'],
    streamingOn: 'netflix',
    rottenTomatoes: { value: 64, reviewCount: 38, asOf: '2026-07-28', url: 'https://www.rottentomatoes.com/tv/i_will_find_you/s01' },
    metacritic:     { value: 56, reviewCount: 19, asOf: '2026-06-19', url: 'https://www.metacritic.com/tv/i-will-find-you/season-1/' },
  },

  stuart: {
    id: 'stuart',
    slug: 'stuart-fails-to-save-the-universe',
    synopsis: 'After breaking a quantum device built by his physicist friends, a comic shop owner is left hopping between collapsing parallel universes trying to undo the damage.',
    released: '2026-07-23',
    seasons: 1,
    /* 3 of a 10-episode order, airing weekly. This is the `episodes` rule in the
       type doing real work: the season is announced through 2026-09-24, and
       recording 10 would send a reader looking for seven episodes that do not
       exist yet. */
    episodes: 3,
    network: 'HBO Max',
    creators: ['Chuck Lorre', 'Zak Penn', 'Bill Prady'],
    cast: ['Kevin Sussman', 'Lauren Lapkus', 'Brian Posehn', 'John Ross Bowie'],
    genres: ['Comedy', 'Science fiction', 'Action-adventure'],
    productionCompanies: ['Chuck Lorre Productions', 'Warner Bros. Television'],
    distributors: ['HBO Max'],
    streamingOn: 'hbo-max',
    rottenTomatoes: { value: 76, reviewCount: 41, asOf: '2026-08-06', url: 'https://www.rottentomatoes.com/tv/stuart_fails_to_save_the_universe/s01' },
    metacritic:     { value: 62, reviewCount: 19, asOf: '2026-07-29', url: 'https://www.metacritic.com/tv/stuart-fails-to-save-the-universe/season-1/' },
  },
}

/* The key and the record's own `id` are two places to write the same string, so
   assert once that they agree. `Object.entries` on a `Partial` yields possibly-
   undefined values, hence the guard.
   
   Module scope, so it runs at import — a mismatch fails the build rather than
   waiting for someone to hit the page. */
for (const [key, record] of Object.entries(TITLES)) {
  if (!record) continue

  if (record.id !== key) {
    throw new Error(
      `titles.ts: record keyed "${key}" has id "${record.id}" — they must match, ` +
        'because getTitle() looks up by key and the chart card links by id.',
    )
  }

  /* `directors` and `creators` are both optional at the type level so a film and a
     series can each omit the other's field. Nothing in the type stops a record
     from setting BOTH or NEITHER, though, and either would render a page with a
     contradictory or empty credit block. Assert the exclusive-or here. */
  if (!record.directors === !record.creators) {
    throw new Error(
      `titles.ts: "${key}" must set exactly one of directors (films) or ` +
        'creators (series).',
    )
  }
}

/** Every record, for the sitemap and the index list. */
export const allTitles = (): TitleRecord[] =>
  Object.values(TITLES).filter((record): record is TitleRecord => Boolean(record))

/**
 * The record for a chart entry, or `undefined` when none has been researched yet.
 *
 * Callers MUST handle `undefined` by leaving the card as it is. See the file
 * header: a title with no verified facts gets no page.
 */
export const getTitle = (id: string): TitleRecord | undefined =>
  (TITLES as Record<string, TitleRecord | undefined>)[id]

/** Lookup by URL segment, for the route. */
export const getTitleBySlug = (slug: string): TitleRecord | undefined =>
  allTitles().find((title) => title.slug === slug)

/** Display name of the service a title streams on. */
export const streamingName = (record: TitleRecord): string | undefined =>
  record.streamingOn ? PLATFORMS[record.streamingOn].name : undefined
