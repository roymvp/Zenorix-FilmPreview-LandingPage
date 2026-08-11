import {
  getMovieChart,
  getSeriesChart,
  type ChartEntryId,
} from '@/lib/content/charts'
import { PLATFORMS, type PlatformId } from '@/lib/content/platforms'
import type { Locale } from '@/lib/i18n/config'

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
  /**
   * Billed principal cast, in credit order. Trimmed to the top billing block.
   *
   * Optional, like the other credit fields, because documentaries have no cast.
   * `idaho` is a true-crime series whose participants are the victims' bereaved
   * families and the detectives on the case — real people appearing as themselves,
   * who must not be listed under "Cast" as though they had been booked to play a
   * part. Omitted there, and the page and the JSON-LD `actor` both drop the block
   * rather than rendering an empty heading.
   */
  cast?: Credit[]
  /**
   * The age rating from the body that issues it in the US: the MPA for films, the
   * TV Parental Guidelines for series. `reason` is that body's OWN descriptor
   * ("for strong bloody violence and gore, and for language"), quoted rather than
   * paraphrased, because the descriptor is the part a parent is actually reading
   * for and rewriting it turns a citation into an opinion.
   *
   * Optional, and genuinely absent on several records: a rating exists only once
   * the film has been submitted, so an unreleased title has none to state. Nothing
   * is inferred from the franchise — Toy Story 5 is the first main-series entry
   * rated PG rather than G, and a record that assumed G from the four films before
   * it would have been confidently wrong.
   */
  contentRating?: { value: string; reason?: string }
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
    contentRating: { value: 'PG-13', reason: 'for sequences of action and violence and some language' },
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
    contentRating: { value: 'R', reason: 'for violence and some language' },
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
    /* PG, not G — the first main-series Toy Story to be rated above G in 31 years. */
    contentRating: { value: 'PG', reason: 'for some thematic elements and rude humor' },
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
    contentRating: { value: 'PG-13', reason: 'for intense sequences of violence and action, bloody images, some strong language, thematic elements and suggestive material' },
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
    contentRating: { value: 'R', reason: 'for strong bloody violence and gore, and for language' },
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
    contentRating: { value: 'PG-13', reason: 'for some thematic material and suggestive references' },
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
    contentRating: { value: 'PG-13', reason: 'for strong language and some suggestive references' },
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
    contentRating: { value: 'PG', reason: 'for action and peril, some scary images, rude humor and brief thematic elements' },
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
    contentRating: { value: 'R', reason: 'for sexual content, nudity, language throughout and drug content' },
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
    contentRating: { value: 'PG-13', reason: 'for sequences of violence and action, some suggestive material and language' },
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
    contentRating: { value: 'TV-MA' },
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
    contentRating: { value: 'TV-MA' },
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
    contentRating: { value: 'TV-MA' },
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
    contentRating: { value: 'TV-14' },
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
    contentRating: { value: 'TV-MA' },
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
    /* TV-MA carries no descriptor of its own, so `reason` is omitted rather than
       filled with a paraphrase of what the rating implies. */
    contentRating: { value: 'TV-MA' },
    genres: ['Comedy', 'Science fiction', 'Action-adventure'],
    productionCompanies: ['Chuck Lorre Productions', 'Warner Bros. Television'],
    distributors: ['HBO Max'],
    streamingOn: 'hbo-max',
    rottenTomatoes: { value: 76, reviewCount: 41, asOf: '2026-08-06', url: 'https://www.rottentomatoes.com/tv/stuart_fails_to_save_the_universe/s01' },
    metacritic:     { value: 62, reviewCount: 19, asOf: '2026-07-29', url: 'https://www.metacritic.com/tv/stuart-fails-to-save-the-universe/season-1/' },
  },

  /* The two 2026-08-07 wide releases below deliberately omit `streamingOn`, even
     though `charts.ts` assigns each a platform (Peacock and HBO Max respectively).
     Five days after a theatrical opening neither is streaming anywhere yet, and
     "Streaming on Peacock" is a concrete, checkable claim that would be false
     today. A chart badge pointing at where a film will land is fine; this page
     states facts, so it says nothing rather than something wrong. Add the field
     when each actually hits its service. */

  oneNight: {
    id: 'oneNight',
    slug: 'one-night-only',
    synopsis: 'Premarital sex has been outlawed for three years, with one 12-hour exemption a year. Two strangers spend that night crossing New York looking for someone worth it, and keep running into each other instead.',
    released: '2026-08-07',
    runtime: 102,
    directors: ['Will Gluck'],
    /* Braun is the ONLY credited writer, so he is the only name here. Deadline and
       Variety both report Gluck rewrote the script himself, and he says so on the
       record — but an uncredited rewrite is not a writing credit, and this field
       mirrors the credits rather than the reporting. */
    writers: ['Travis Braun'],
    cast: ['Monica Barbaro', 'Callum Turner', 'Molly Ringwald', 'LeVar Burton', 'Maya Hawke', 'Julia Fox', 'Nicholas Braun', 'Pete Davidson'],
    contentRating: { value: 'R', reason: 'for sexual material, language and brief nudity' },
    genres: ['Romantic comedy'],
    productionCompanies: ['Olive Bridge Entertainment'],
    distributors: ['Universal Pictures'],
    rottenTomatoes: { value: 44, reviewCount: 131, asOf: '2026-08-10', url: 'https://www.rottentomatoes.com/m/one_night_only_2026' },
    metacritic:     { value: 43, reviewCount: 31,  asOf: '2026-08-07', url: 'https://www.metacritic.com/movie/one-night-only-2026/' },
  },

  iceCream: {
    id: 'iceCream',
    slug: 'ice-cream-man',
    synopsis: 'An ice cream truck arrives in a quiet bayside town and the children who eat from it start killing the adults, leaving a lactose-intolerant boy who never touched the stuff to work out why.',
    released: '2026-08-07',
    runtime: 86,
    directors: ['Eli Roth'],
    writers: ['Eli Roth', 'Noah Belson'],
    cast: ['Ari Millen', 'Charlie Zeltzer', 'Shiloh O\u2019Reilly', 'Kiori Mirza Waldman', 'Sarah Abbott', 'Benjamin Byron Davis'],
    /* Unrated is a FACT here, not a missing field: Roth released the film without
       submitting it to the MPA so the gore would survive, and it carries an 18 from
       the BBFC in the UK. Stated rather than omitted, because "Unrated" is what a
       cinema listing shows and it means something different from "no rating yet". */
    contentRating: { value: 'Unrated', reason: 'released without an MPA rating' },
    genres: ['Slasher', 'Horror'],
    productionCompanies: ['The Horror Section', 'MCT Studios'],
    distributors: ['Iconic Events Releasing'],
    rottenTomatoes: { value: 28, reviewCount: 107, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/ice_cream_man_2026' },
    metacritic:     { value: 34, reviewCount: 18,  asOf: '2026-08-06', url: 'https://www.metacritic.com/movie/ice-cream-man-2026/' },
  },

  sterling: {
    id: 'sterling',
    slug: 'sterling-point',
    synopsis: 'Annie Jacobson inherits her estranged grandfather\u2019s island in Ontario cottage country and spends a summer there among new friends, first romances and the family secrets the place was hiding.',
    released: '2026-08-05',
    seasons: 1,
    episodes: 8,
    network: 'Prime Video',
    creators: ['Megan Park'],
    cast: ['Ella Rubin', 'Am\u00e9lie Hoeferle', 'Jacob Whiteduck-Lavoie', 'Daniel Quinn-Toye', 'Bo Bragason', 'Keen Ruffalo', 'Missi Pyle', 'Jay Duplass', 'Jeffrey Dean Morgan'],
    contentRating: { value: 'TV-MA' },
    genres: ['Drama', 'Coming-of-age'],
    productionCompanies: ['LuckyChap', 'Fake Empire', 'Heart Fugue Productions', 'Reunion Pacific Entertainment', 'Amazon MGM Studios'],
    distributors: ['Prime Video'],
    streamingOn: 'prime-video',
    rottenTomatoes: { value: 93, reviewCount: 28, asOf: '2026-08-10', url: 'https://www.rottentomatoes.com/tv/sterling_point/s01' },
    metacritic:     { value: 76, reviewCount: 6,  asOf: '2026-08-04', url: 'https://www.metacritic.com/tv/sterling-point/season-1/' },
  },

  curtis: {
    id: 'curtis',
    slug: 'president-curtis',
    synopsis: 'A Rick and Morty spin-off in which President Andre Curtis and his staff handle the interdimensional, paranormal and otherwise unexplained crises that Rick tends to walk away from.',
    released: '2026-07-26',
    seasons: 1,
    /* 3, NOT 10. Season 1 is a ten-episode order airing weekly, and three had aired
       as of this writing — the field is documented as episodes RELEASED. Bump this
       as the season airs; it is the one number on this record with a known
       expiry. */
    episodes: 3,
    network: 'Adult Swim',
    creators: ['James Siciliano', 'Dan Harmon'],
    cast: ['Keith David', 'Stephanie Beatriz', 'Jim Rash'],
    contentRating: { value: 'TV-MA' },
    genres: ['Adult animation', 'Science fiction', 'Satire'],
    productionCompanies: ['Pug Party', 'Harmonious Claptrap', 'Williams Street'],
    distributors: ['Adult Swim'],
    streamingOn: 'hbo-max',
    /* No Metacritic score exists for this season, so the field is absent rather
       than filled in from the Rotten Tomatoes average. 12 critics on a show three
       episodes into its run is why the count is printed beside the 100%. */
    rottenTomatoes: { value: 100, reviewCount: 12, asOf: '2026-07-24', url: 'https://www.rottentomatoes.com/tv/president_curtis/s01' },
  },

  shards: {
    id: 'shards',
    slug: 'the-shards',
    synopsis: 'Los Angeles, 1981. A 17-year-old Bret Easton Ellis is in his last year at an elite prep school when a magnetic new student arrives, just as a serial killer known as the Trawler begins working the city.',
    released: '2026-08-05',
    seasons: 1,
    /* 4 released, of a 9-episode season running to 2026-09-09. Episodes 3 and 4
       both dropped today (2026-08-12) — Wikipedia's infobox still says 2, which is
       a reminder that the infobox lags the episode table. Counted from the table. */
    episodes: 4,
    /* FX is the network, Hulu is where it streams — the FX-on-Hulu arrangement. The
       chart badge said `disney-plus`; corrected to `hulu` in `charts.ts`, since that
       badge sits next to poster art and has to name the actual service. */
    network: 'FX',
    creators: ['Ryan Murphy', 'Bret Easton Ellis'],
    cast: ['Igby Rigney', 'Kaia Gerber', 'Homer Gere', 'Hayes Warner', 'Graham Campbell', 'Evan Rachel Wood', 'Wes Bentley'],
    contentRating: { value: 'TV-MA' },
    genres: ['Teen drama', 'Thriller', 'Coming-of-age'],
    productionCompanies: ['20th Television', 'Ryan Murphy Television', 'Color Force', 'Sodium Fox Productions'],
    distributors: ['FX'],
    streamingOn: 'hulu',
    rottenTomatoes: { value: 53, reviewCount: 43, asOf: '2026-08-07', url: 'https://www.rottentomatoes.com/tv/the_shards/s01' },
    metacritic:     { value: 56, reviewCount: 23, asOf: '2026-08-06', url: 'https://www.metacritic.com/tv/the-shards/season-1/' },
  },

  furious: {
    id: 'furious',
    slug: 'furious',
    synopsis: 'An FBI agent hunts a methodical female serial killer who targets wealthy men. As the two women\u2019s lives begin to intersect, each walking her own road to justice, the line between right and wrong stops holding.',
    released: '2026-07-27',
    seasons: 1,
    /* 5 released, of an 8-episode season running to 2026-08-31. Premiered with
       three episodes at once, then weekly — episode 5 landed 2026-08-10. */
    episodes: 5,
    network: 'Hulu',
    creators: ['Elizabeth Meriwether'],
    cast: ['Emmy Rossum', 'Lola Petticrew', 'Quincy Tyler Bernstine', 'Scoot McNairy'],
    contentRating: { value: 'TV-MA' },
    genres: ['Crime drama', 'Thriller'],
    productionCompanies: ['Elizabeth Meriwether Pictures', 'Composition 8', 'Searchlight Television', '20th Television'],
    distributors: ['Hulu'],
    streamingOn: 'hulu',
    rottenTomatoes: { value: 98, reviewCount: 42, asOf: '2026-08-05', url: 'https://www.rottentomatoes.com/tv/furious/s01' },
    metacritic:     { value: 81, reviewCount: 21, asOf: '2026-07-26', url: 'https://www.metacritic.com/tv/furious/season-1/' },
  },

  offCampus: {
    id: 'offCampus',
    slug: 'off-campus',
    synopsis: 'A music major agrees to tutor the captain of the Briar University hockey team, and the pair strike a deal to fake a relationship. Adapted from Elle Kennedy\u2019s Off-Campus novels.',
    released: '2026-05-13',
    /* A complete season, all eight episodes released at once, so this figure is
       stable — unlike the mid-run records above. Season 2 is ordered but unaired,
       so `seasons` stays 1: the field counts what exists, not what is greenlit. */
    seasons: 1,
    episodes: 8,
    network: 'Prime Video',
    creators: ['Louisa Levy'],
    cast: ['Ella Bright', 'Belmont Cameli', 'Mika Abdalla', 'Stephen Kalyn', 'Jalen Thomas Brooks', 'Antonio Cipriano', 'Josh Heuston'],
    contentRating: { value: 'TV-MA' },
    genres: ['Romantic drama'],
    productionCompanies: ['28 In Blue', 'Drowning Girl Productions', 'Temple Hill Entertainment', 'Billings Productions', 'Amazon MGM Studios'],
    distributors: ['Prime Video'],
    streamingOn: 'prime-video',
    rottenTomatoes: { value: 91, reviewCount: 33, asOf: '2026-05-21', url: 'https://www.rottentomatoes.com/tv/off_campus/s01' },
    metacritic:     { value: 71, reviewCount: 11, asOf: '2026-05-12', url: 'https://www.metacritic.com/tv/off-campus/season-1/' },
  },

  hours72: {
    id: 'hours72',
    slug: '72-hours',
    synopsis: 'Passed over for a promotion for being too old, a 40-year-old ad man accepts a bachelor-party invitation he was added to by mistake and spends a weekend in Miami trying to keep up with strangers half his age.',
    released: '2026-07-24',
    runtime: 105,
    directors: ['Tim Story'],
    writers: ['Jon Hurwitz', 'Hayden Schlossberg', 'Kevin Burrows', 'Matt Mider'],
    cast: ['Kevin Hart', 'Marcello Hern\u00e1ndez', 'Mason Gooding', 'Kam Patterson', 'Ben Marshall', 'Teyana Taylor'],
    /* An MPA R, not a TV-MA: it is a film that premiered on Netflix, and Netflix
       originals carry the film rating rather than the TV Parental Guidelines one. */
    contentRating: { value: 'R', reason: 'for pervasive language, sexual material, drug use and graphic nudity' },
    genres: ['Comedy'],
    productionCompanies: ['Sony Pictures', 'Davis Entertainment', 'Counterbalance Entertainment', 'Hartbeat Productions', 'Will Packer Productions', 'The Story Company'],
    distributors: ['Netflix'],
    /* A Netflix original: it premiered on the service rather than in cinemas, so
       unlike the 2026-08-07 theatrical pair above this one genuinely is streaming
       and the field is safe to state. The 2026-07-20 Paris Theater screening was a
       premiere event, not a theatrical run, so `released` is the Netflix date. */
    streamingOn: 'netflix',
    rottenTomatoes: { value: 14, reviewCount: 35, asOf: '2026-08-05', url: 'https://www.rottentomatoes.com/m/72_hours_2026' },
    metacritic:     { value: 41, reviewCount: 15, asOf: '2026-07-31', url: 'https://www.metacritic.com/movie/72-hours-2026/' },
  },

  lastHouse: {
    id: 'lastHouse',
    slug: 'the-last-house',
    synopsis: 'A suburban Seattle family wakes to find every door and window in their house sealed shut and the world outside drowning. Survival becomes a years-long project, and the rain brings something with it.',
    released: '2026-08-07',
    runtime: 112,
    directors: ['Louis Leterrier'],
    writers: ['Matthew Robinson'],
    /* Just the two credited leads. The article's cast section lists the child roles
       across three age brackets each, which belongs on a cast page rather than in a
       two-line credit on a landing page. */
    cast: ['Greta Lee', 'Wagner Moura'],
    /* PG-13 with no published descriptor found, so `reason` is left off rather than
       written from the trailer. */
    contentRating: { value: 'PG-13' },
    genres: ['Science fiction', 'Thriller'],
    productionCompanies: ['Chernin Entertainment', '3 Arts Entertainment'],
    distributors: ['Netflix'],
    /* Released straight to Netflix, so this is stated. Same 2026-08-07 date as the
       two theatrical films above, which is exactly why the distinction matters:
       release date alone does not tell you whether something is streaming. */
    streamingOn: 'netflix',
    /* No Metacritic score published, so the field is omitted rather than guessed
       from the 4.6/10 critic average. */
    rottenTomatoes: { value: 28, reviewCount: 47, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/the_last_house' },
  },

  devilMouth: {
    id: 'devilMouth',
    slug: 'the-devils-mouth',
    synopsis: 'Five friends on a graduation trip to Thailand talk their guide into the dangerous route through a flooded cave system, where a storm surge has trapped a bull shark in the freshwater passages with them.',
    released: '2026-07-29',
    runtime: 104,
    directors: ['Jeff Wadlow'],
    writers: ['Aja Gabel', 'Myung Joh Wesner'],
    cast: ['Kathryn Newton', 'Lana Condor', 'Gavin Casalegno', 'Nico Hiraga', 'Tommi Rose', 'Tayme Thapthimthong'],
    contentRating: { value: 'PG-13', reason: 'for violent content, bloody images, some language and suggestive material' },
    genres: ['Survival thriller', 'Horror'],
    productionCompanies: ['Lionsgate', 'Thunder Road Films'],
    /* Amazon MGM Studios distributes, via Prime Video. The chart badge said `hulu`,
       which was simply wrong; corrected to `prime-video` in `charts.ts` per the rule
       that the badge must name the service that actually streams the title. */
    distributors: ['Amazon MGM Studios'],
    streamingOn: 'prime-video',
    rottenTomatoes: { value: 33, reviewCount: 39, asOf: '2026-08-09', url: 'https://www.rottentomatoes.com/m/the_devils_mouth' },
    metacritic:     { value: 46, reviewCount: 8,  asOf: '2026-07-31', url: 'https://www.metacritic.com/movie/the-devils-mouth/' },
  },

  minions: {
    id: 'minions',
    slug: 'minions-and-monsters',
    synopsis: 'Old Hollywood, long before the events of Minions. A tribe of Minions stumbles into the silent-film business, and when talkies end their careers one of them sets out to make a monster movie of his own \u2014 using real monsters.',
    /* The 2026-07-01 US theatrical date, not the 2026-06-21 Annecy premiere. A
       festival screening is not a release, the same call made for `hours72` above
       with its Paris Theater premiere. */
    released: '2026-07-01',
    runtime: 90,
    directors: ['Pierre Coffin'],
    writers: ['Brian Lynch', 'Pierre Coffin'],
    cast: ['Pierre Coffin', 'Trey Parker', 'Allison Janney', 'Christoph Waltz', 'Jesse Eisenberg', 'Jeff Bridges', 'Zoey Deutch', 'Bobby Moynihan', 'Phil LaMarr'],
    contentRating: { value: 'PG', reason: 'for action/violence, language and rude/macabre humor' },
    genres: ['Animation', 'Comedy', 'Family'],
    productionCompanies: ['Universal Pictures', 'Illumination'],
    distributors: ['Universal Pictures'],
    /* No `streamingOn`, though this one is subtler than the theatrical pair above.
       It reached digital DOWNLOAD on 2026-08-11 — that is a purchase, not a
       subscription service, and the chart badges it `peacock`, where it has not
       landed. "Streaming on Peacock" is exactly the claim being avoided. */
    rottenTomatoes: { value: 89, reviewCount: 179, asOf: '2026-08-11', url: 'https://www.rottentomatoes.com/m/minions_and_monsters' },
    metacritic:     { value: 70, reviewCount: 30,  asOf: '2026-07-07', url: 'https://www.metacritic.com/movie/minions-and-monsters/' },
  },

  /* NOT the Prime Video documentary about the same murders. Researching this one
     turned up "One Night in Idaho: The College Murders" (Liz Garbus, Prime Video,
     2025) and it looked at first like the chart had the title and platform wrong.
     It does not: these are two separate productions about the 2022 University of
     Idaho case, and this is the Netflix one. Verified before changing anything —
     the near-miss is recorded here so the next person does not "fix" it. */
  idaho: {
    id: 'idaho',
    slug: 'the-idaho-murders-college-nightmare',
    synopsis: 'A three-part account of the 2022 University of Idaho student murders, built from bodycam footage, text messages and interviews with the victims\u2019 families and the investigators who worked the case.',
    released: '2026-07-29',
    seasons: 1,
    episodes: 3,
    network: 'Netflix',
    /* Borgman directed. Joe Berlinger is an executive producer and is deliberately
       not here — `creators` is a creator/showrunner credit, and an EP credit is a
       different claim. */
    creators: ['Skye Borgman'],
    /* No `cast` — see the field's note. The people on screen are the victims'
       families and law enforcement, appearing as themselves. */
    contentRating: { value: 'TV-MA' },
    genres: ['Documentary', 'True crime'],
    productionCompanies: ['RadicalMedia', 'Third Eye Motion Picture Company'],
    distributors: ['Netflix'],
    streamingOn: 'netflix',
    /* NO SCORES AT ALL. Rotten Tomatoes lists the series but publishes no critic
       score, and it has no Metacritic entry. Both omitted, which is the "honest
       partial record" the header describes: this page earns its place on credits,
       network, episode count and synopsis, and the ratings block simply does not
       render. */
  },

  invite: {
    id: 'invite',
    slug: 'the-invite',
    /* Kept to the setup. The third act turns on the neighbours' proposition, and a
       one-line synopsis that leads with it would be both a spoiler and a lurid
       misread of what the reviews describe as a marital comedy. */
    synopsis: 'A San Francisco music teacher comes home to find his wife has invited the upstairs neighbours to dinner \u2014 the ones whose noise they have been arguing about. Over one evening the two couples take each other\u2019s marriages apart.',
    /* The 2026-07-10 WIDE release, not the 2026-06-26 limited one and not the
       Sundance premiere on 2026-01-24, because the field is defined as first wide
       release. Wikipedia's infobox leads with the limited date, so this is a
       deliberate reading of the field rather than a transcription of the box. */
    released: '2026-07-10',
    runtime: 107,
    directors: ['Olivia Wilde'],
    writers: ['Will McCormack', 'Rashida Jones'],
    cast: ['Seth Rogen', 'Olivia Wilde', 'Pen\u00e9lope Cruz', 'Edward Norton'],
    contentRating: { value: 'R', reason: 'for sexual material, language throughout and drug use' },
    genres: ['Comedy', 'Drama'],
    productionCompanies: ['Annapurna Pictures', 'FilmNation Entertainment', 'Permut Presentations'],
    distributors: ['A24'],
    /* No `streamingOn`. The chart badges `hbo-max` on the strength of A24's output
       deal, but the film is not on the service — it reached digital purchase on
       2026-08-11 and nothing more. An expected future window is not a fact about
       where it streams today, so the field stays off until it lands. */
    rottenTomatoes: { value: 97, reviewCount: 267, asOf: '2026-08-08', url: 'https://www.rottentomatoes.com/m/the_invite' },
    metacritic:     { value: 82, reviewCount: 47,  asOf: '2026-07-13', url: 'https://www.metacritic.com/movie/the-invite/' },
  },

  /* `catFest` (CatVideoFest 2026) IS DELIBERATELY ABSENT, and this note exists so
     nobody adds it to "finish the set". It is a touring programme of internet cat
     videos, not a title: there is no director, no cast, no studio and no critic
     score, because there is nothing for a critic to review but a curator's reel
     that changes between screenings. Every field this page is built to state would
     be either empty or invented, which is precisely the doorway page the header
     describes. It keeps its chart card and its download dialog, which is the
     correct outcome rather than a gap to be filled.

     Same test for anything else added later: if the honest record is a name and a
     date, it does not get a page. */
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

/**
 * The technical plates every title on Zenorix plays back at.
 *
 * ONE SHARED LIST, NOT A PER-RECORD FIELD, and that is the honest shape rather
 * than a shortcut. These are facts about the STREAM the app serves, not about the
 * film — the same 2160p/HDR/Atmos ladder applies to everything in the catalogue,
 * and it is the claim the landing page already makes in `about.viewing` ("4K Ultra
 * HD", "Dolby Atmos"). A per-title array would invite exactly what the file header
 * forbids: 29 records of guessed masters, with no source to check any of them
 * against.
 *
 * Deliberately NOT localized. These are the vendors' own registered wordings, the
 * same strings printed on a disc case in every market, and a translated
 * certification mark is no longer the mark.
 */
export const PLAYBACK_FORMATS = ['4K UHD', 'HDR10', 'Dolby Vision', 'Dolby Atmos'] as const

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

/**
 * Chart-ordered links to title pages, for the footer's catalogue columns.
 *
 * Derived from `getMovieChart`/`getSeriesChart` rather than from `allTitles()`, so
 * the footer lists the same titles in the same order as the rails above it — and so
 * a market with its own show ranking gets its own footer order for free.
 *
 * WHY THE `getTitle` FILTER EXISTS. Not every chart entry has a page: a title with
 * no researched facts deliberately gets no record (see the file header), and
 * `getTitle` returning `undefined` is precisely that signal. Mapping the chart
 * straight to hrefs would emit a link to a route that 404s, in the footer, on every
 * page of the site — where a crawler finds it first.
 *
 * Measured honestly, at today's data and `limit: 6` the filter changes nothing: the
 * movie chart's one page-less entry ('CatVideoFest 2026') sits at index 9, past the
 * cut. So this is a GUARD, not an active fix — it earns its place because the two
 * things that would break it are both routine (raising the limit, or a chart
 * reshuffle that promotes an unresearched title), and the failure would be silent
 * and site-wide. Do not "simplify" it away on the grounds that the output is
 * currently identical without it.
 */
export function catalogueLinks(
  locale: Locale,
  kind: 'movie' | 'series',
  limit: number,
): { label: string; href: string }[] {
  const chart = kind === 'movie' ? getMovieChart(locale) : getSeriesChart(locale)
  const links: { label: string; href: string }[] = []

  for (const entry of chart) {
    const record = getTitle(entry.id)
    if (!record) continue
    /* Display name from the CHART entry, not the record: `charts.ts` owns title and
       poster, and this file deliberately does not duplicate them. */
    links.push({ label: entry.title, href: `/${locale}/titles/${record.slug}` })
    if (links.length === limit) break
  }

  return links
}

/* `streamingName()` used to live here, returning just the service's display name
   for a text row on the detail page. That row is a chip with the service's mark
   beside its name now, so the caller needs the whole registry entry and reads
   `PLATFORMS[record.streamingOn]` directly. A helper that hands back one field of
   an object the caller already has to look up is a step backwards, so it is gone
   rather than kept "in case". */
