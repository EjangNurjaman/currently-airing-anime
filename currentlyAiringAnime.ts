export type Season = 'WINTER'|'SPRING'|'SUMMER'|'FALL'

export type Options = {
  malId?: number|number[]
  aniId?: number|number[]
  userId?: number|number[]
  season?: Season
  seasonYear?: number|number[]
}

type PageInfo = {
  total: number
  currentPage: number
  lastPage: number
  hastNextPage: boolean
  perPage: number
}

export type AiringEpisode = {
  id: number
  episode: number
  airingAt: number
  timeUntilAiring: number
}

export type Media = {
  id: number
  idMal: number
  title: {
    romaji: string
    english: string
    native: string
  }
  studios: {
    edges: {
      node: {
        name: string
      }
    }[]
  }
  genres: string[]
  status: 'FINISHED'|'RELEASING'|'NOT_YET_RELEASED'|'CANCELLED'
  coverImage: {
    large: string
  }
  episodes: number
  nextAiringEpisode: AiringEpisode
  airingSchedule: {
    edges: {
      node: AiringEpisode
    }[]
  }
}

type ApiResponse = {
  data: {
    Page: {
      pageInfo: PageInfo
      media: Media[]
    }
  }|null
  errors?: {
    message: string
  }[]
}

export type AiringAnime = {
  shows: Media[],
  next: () => Promise<AiringAnime>|null
}

const apiEndpoint = 'https://graphql.anilist.co'

const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
}

const airingAnimeQuery = `
  query (
    $page: Int
    $season: MediaSeason
    $seasonYear: Int
  ) {
    Page (page: $page) {
      pageInfo {
        total
        currentPage
        lastPage
        hastNextPage
        perPage
      }

      media(season: $season, seasonYear: $seasonYear) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        studios {
          edges {
            node {
              name
            }
          }
        }
        genres
        status
        coverImage {
          large
        }
        episodes
        nextAiringEpisode {
          id
          episode
          airingAt
          timeUntilAiring
        }
        airingSchedule {
          edges {
            node {
              episode
              airingAt
              timeUntilAiring
            }
          }
        }
      }
    }
  }
`

// WINTER: Months December to February
// SPRING: Months March to Spring
// SUMMER: Months June to August
// FALL: Months September to November

function getCurrentSeason(): Season {
  return 'SUMMER'
}

function getCurrentSeasonYear(): number {
  return (new Date()).getFullYear();
}

async function makeRequest(variables: object): Promise<ApiResponse> {
  const fetchOptions = Object.assign(requestOptions, {
    body: JSON.stringify({query: airingAnimeQuery, variables})
  })

  const response = await fetch(apiEndpoint, fetchOptions)

  const result = await response.json() as ApiResponse

  if (result.errors) {
    throw new Error(result.errors[0].message)
  }

  return result
}

async function currentlyAiringAnime(options: Options = {}): Promise<AiringAnime> {
  let page = 0

  options.season = options.season || getCurrentSeason();
  options.seasonYear = options.seasonYear || getCurrentSeasonYear();

  async function request(): Promise<AiringAnime> {
    page++

    const {data} = await makeRequest({
      page: page,
      season: options.season,
      seasonYear: options.seasonYear
    })

    const hasNextPage = data.Page.pageInfo.hastNextPage

    return {
      shows: data.Page.media,
      next: hasNextPage ? request : null
    }
  }

  return await request()
}

export default currentlyAiringAnime
