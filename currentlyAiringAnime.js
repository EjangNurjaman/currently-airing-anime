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
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var apiEndpoint = 'https://graphql.anilist.co';
var requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};
var airingAnimeQuery = "\n  query (\n    $page: Int\n    $season: MediaSeason\n\t\t$seasonYear: Int\n\t\t$malIdIn: [Int]\n\t\t$aniIdIn: [Int]\n\t\t$sort: [MediaSort]\n  ) {\n    Page (page: $page) {\n      pageInfo {\n        total\n        currentPage\n        lastPage\n        hasNextPage\n        perPage\n      }\n\n      media(\n\t\t\t\tseason: $season,\n\t\t\t\tseasonYear: $seasonYear\n\t\t\t\tidMal_in: $malIdIn,\n\t\t\t\tid_in: $aniIdIn,\n        sort: $sort\n        status: RELEASING\n\t\t\t) {\n        id\n        description\n        idMal\n        title {\n          romaji\n          native\n          english\n        }\n        studios {\n          edges {\n            node {\n              name\n            }\n          }\n\t\t\t\t}\n\t\t\t\tformat\n        genres\n        status\n        coverImage {\n          large\n        }\n        episodes\n        nextAiringEpisode {\n          id\n          episode\n          airingAt\n          timeUntilAiring\n        }\n        airingSchedule {\n          edges {\n            node {\n              episode\n              airingAt\n              timeUntilAiring\n            }\n          }\n        }\n      }\n    }\n  }\n";
// WINTER: Months December to February
// SPRING: Months March to Spring
// SUMMER: Months June to August
// FALL: Months September to November
function getCurrentSeason() {
    var month = (new Date()).getMonth() + 1; // Add 1 because getMonth starts a 0
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
    return __awaiter(this, void 0, void 0, function () {
        var fetchOptions, response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchOptions = Object.assign(requestOptions, {
                        body: JSON.stringify({ query: airingAnimeQuery, variables: variables })
                    });
                    return [4 /*yield*/, fetch(apiEndpoint, fetchOptions)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.errors) {
                        throw new Error(result.errors[0].message);
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
function currentlyAiringAnime(options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        function request() {
            return __awaiter(this, void 0, void 0, function () {
                var requestOptions, data, hasNextPage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            page++;
                            requestOptions = {
                                page: page,
                                malIdIn: options.malIdIn,
                                aniIdIn: options.aniIdIn,
                                sort: options.sort
                            };
                            if (options.season && options.seasonYear) {
                                requestOptions['season'] = options.season;
                                requestOptions['seasonYear'] = options.seasonYear;
                            }
                            return [4 /*yield*/, makeRequest(requestOptions)];
                        case 1:
                            data = (_a.sent()).data;
                            hasNextPage = data.Page.pageInfo.hasNextPage;
                            return [2 /*return*/, {
                                    shows: data.Page.media,
                                    next: hasNextPage ? request : null
                                }];
                    }
                });
            });
        }
        var page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (options.season === undefined || options.seasonYear === undefined) {
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
                    page = 0;
                    return [4 /*yield*/, request()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}

return currentlyAiringAnime;

})));
