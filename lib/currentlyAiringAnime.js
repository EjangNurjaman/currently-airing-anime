(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.currentlyAiringAnime = factory());
}(this, (function () { 'use strict';

const apiEndpoint = 'https://graphql.anilist.co';
const getAiringAnimeQuery = (includeSchedule) => `
  query (
    $page: Int
    $season: MediaSeason
		$seasonYear: Int
		$malIdIn: [Int]
		$aniIdIn: [Int]
    $sort: [MediaSort]
    $status: MediaStatus
  ) {
    Page (page: $page) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }

      media(
				season: $season,
				seasonYear: $seasonYear
				idMal_in: $malIdIn,
				id_in: $aniIdIn,
        sort: $sort
        status: $status
			) {
        id
        description
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
        startDate {
          year
          month
          day
        }
        nextAiringEpisode {
          id
          episode
          airingAt
          timeUntilAiring
        }
        ${includeSchedule ? `
          airingSchedule {
            edges {
              node {
                episode
                airingAt
                timeUntilAiring
              }
            }
          }
        ` : ''}
      }
    }
  }
`;
// WINTER: Months December to February
// SPRING: Months March to Spring
// SUMMER: Months June to August
// FALL: Months September to November
function getCurrentSeason() {
    const month = (new Date()).getMonth() + 1; // Add 1 because getMonth starts a 0
    if (month === 12 || (month >= 1 && month <= 2)) {
        return 'WINTER';
    }
    if (month >= 3 && month <= 5) {
        return 'SPRING';
    }
    if (month >= 6 && month <= 8) {
        return 'SUMMER';
    }
    return 'FALL';
}
function getCurrentSeasonYear() {
    return (new Date()).getFullYear();
}
async function sendFetchRequest(query, variables) {
    const options = Object.assign({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }, {
        body: JSON.stringify({ query, variables })
    });
    const response = await fetch(apiEndpoint, options);
    const result = await response.json();
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    return result;
}
function makeRequestFactory(requestOptions) {
    const includeSchedule = requestOptions.includeSchedule;
    delete requestOptions.includeSchedule;
    return async function makeRequest() {
        const { data } = await sendFetchRequest(getAiringAnimeQuery(includeSchedule), requestOptions);
        const hasNextPage = data.Page.pageInfo.hasNextPage;
        requestOptions.page = requestOptions.page + 1;
        return {
            shows: data.Page.media,
            next: hasNextPage ? makeRequest : null
        };
    };
}
async function currentlyAiringAnime(options = {}) {
    const amountOfOptions = Object.keys(options).length;
    if (!amountOfOptions || (amountOfOptions === 1 && options.sort !== undefined)) {
        options.season = getCurrentSeason();
        options.seasonYear = getCurrentSeasonYear();
    }
    options.malIdIn = options.malIdIn || undefined;
    options.aniIdIn = options.aniIdIn || undefined;
    options.sort = options.sort || ['START_DATE'];
    if (options.malIdIn !== undefined && !Array.isArray(options.malIdIn)) {
        throw new Error('malIdIn should be an array');
    }
    if (options.aniIdIn !== undefined && !Array.isArray(options.aniIdIn)) {
        throw new Error('malIdIn should be an array');
    }
    // User called media data.
    return await makeRequestFactory({
        page: 1,
        malIdIn: options.malIdIn,
        aniIdIn: options.aniIdIn,
        sort: options.sort,
        season: options.season,
        seasonYear: options.seasonYear,
        includeSchedule: options.includeSchedule,
        status: options.isReleasing ? 'RELEASING' : undefined,
    })();
}

return currentlyAiringAnime;

})));
