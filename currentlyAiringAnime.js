(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.currentlyAiringAnime = factory());
}(this, (function () { 'use strict';

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const apiEndpoint = 'https://graphql.anilist.co';
const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};
const getAiringAnimeQuery = (includeSchedule = false) => `
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
        hasNextPage
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
function makeRequest(variables) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetchOptions = Object.assign(requestOptions, {
            body: JSON.stringify({ query: getAiringAnimeQuery(), variables })
        });
        const response = yield fetch(apiEndpoint, fetchOptions);
        const result = yield response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        return result;
    });
}
function currentlyAiringAnime(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
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
        let page = 0;
        function request() {
            return __awaiter(this, void 0, void 0, function* () {
                page++;
                const requestOptions = {
                    page: page,
                    malIdIn: options.malIdIn,
                    aniIdIn: options.aniIdIn,
                    sort: options.sort
                };
                if (options.season && options.seasonYear) {
                    requestOptions['season'] = options.season;
                    requestOptions['seasonYear'] = options.seasonYear;
                }
                const { data } = yield makeRequest(requestOptions);
                const hasNextPage = data.Page.pageInfo.hasNextPage;
                return {
                    shows: data.Page.media,
                    next: hasNextPage ? request : null
                };
            });
        }
        return yield request();
    });
}

return currentlyAiringAnime;

})));
