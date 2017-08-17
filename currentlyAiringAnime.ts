export type Season = 'WINTER'|'SPRING'|'SUMMER'|'FALL'

export type MediaSort =
	'ID'|
	'ID_DESC'|
	'TITLE_ROMAJI'|
	'TITLE_ROMAJI_DESC'|
	'TITLE_ENGLISH'|
	'TITLE_ENGLISH_DESC'|
	'TITLE_NATIVE'|
	'TITLE_NATIVE_DESC'|
	'TYPE'|
	'TYPE_DESC'|
	'FORMAT'|
	'FORMAT_DESC'|
	'START_DATE'|
	'START_DATE_DESC'|
	'END_DATE'|
	'END_DATE_DESC'|
	'SCORE'|
	'SCORE_DESC'|
	'POPULARITY'|
	'POPULARITY_DESC'|
	'EPISODES'|
	'EPISODES_DESC'|
	'DURATION'|
	'DURATION_DESC'|
	'STATUS'|
	'STATUS_DESC'|
	'UPDATED_AT'|
	'UPDATED_AT_DESC';

export type Options = {
  malIdIn?: number|number[]
  aniIdIn?: number|number[]
  userId?: number|number[]
  season?: Season
	seasonYear?: number|number[]
	sort?: [string]
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
		$malIdIn: [Int]
		$aniIdIn: [Int]
		$sort: [MediaSort]
  ) {
    Page (page: $page) {
      pageInfo {
        total
        currentPage
        lastPage
        hastNextPage
        perPage
      }

      media(
				season: $season,
				seasonYear: $seasonYear
				idMal_in: $malIdIn,
				id_in: $aniIdIn,
				sort: $sort
			) {
        id
        idMal
        title {
          romaji
          native
          english
        }
        studios {
          edges {
            node {
              name
            }
          }
				}
				format
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
 	const month = (new Date()).getMonth() + 1 // Add 1 because getMonth starts a 0

	if (month === 12 || (month >= 1 && month <= 2)) {
		return 'WINTER'
	}

	if (month >= 3 && month <= 5) {
		return 'SPRING'
	}

	if (month >= 6 && month <= 8) {
		return 'SUMMER'
	}

  return 'FALL'
}

function getCurrentSeasonYear(): number {
  return (new Date()).getFullYear()
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
  options.season = options.season || getCurrentSeason()
  options.seasonYear = options.seasonYear || getCurrentSeasonYear()
	options.malIdIn = options.malIdIn || undefined
	options.aniIdIn = options.aniIdIn || undefined
	options.sort = options.sort || ['START_DATE'];

	if (options.malIdIn !== undefined && !Array.isArray(options.malIdIn)) {
		throw new Error('malIdIn should be an array')
	}

	if (options.aniIdIn !== undefined && !Array.isArray(options.aniIdIn)) {
		throw new Error('malIdIn should be an array')
	}

  let page = 0
  async function request(): Promise<AiringAnime> {
    page++

    const {data} = await makeRequest({
      page: page,
      season: options.season,
			seasonYear: options.seasonYear,
			malIdIn: options.malIdIn,
			aniIdIn: options.aniIdIn,
			sort: options.sort
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
