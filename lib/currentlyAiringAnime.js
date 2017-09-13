(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.currentlyAiringAnime = factory());
}(this, (function () { 'use strict';

var sendFetchRequest = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(query, variables) {
        var options, response, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        options = Object.assign({
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        }, {
                            body: JSON.stringify({ query: query, variables: variables })
                        });
                        _context.next = 3;
                        return fetch(apiEndpoint, options);

                    case 3:
                        response = _context.sent;
                        _context.next = 6;
                        return response.json();

                    case 6:
                        result = _context.sent;

                        if (!result.errors) {
                            _context.next = 9;
                            break;
                        }

                        throw new Error(result.errors[0].message);

                    case 9:
                        return _context.abrupt('return', result);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function sendFetchRequest(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var currentlyAiringAnime = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var amountOfOptions;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        amountOfOptions = Object.keys(options).length;

                        if (!amountOfOptions || amountOfOptions === 1 && options.sort !== undefined) {
                            options.season = getCurrentSeason();
                            options.seasonYear = getCurrentSeasonYear();
                        }
                        options.malIdIn = options.malIdIn || undefined;
                        options.aniIdIn = options.aniIdIn || undefined;
                        options.sort = options.sort || ['START_DATE'];

                        if (!(options.malIdIn !== undefined && !Array.isArray(options.malIdIn))) {
                            _context3.next = 7;
                            break;
                        }

                        throw new Error('malIdIn should be an array');

                    case 7:
                        if (!(options.aniIdIn !== undefined && !Array.isArray(options.aniIdIn))) {
                            _context3.next = 9;
                            break;
                        }

                        throw new Error('malIdIn should be an array');

                    case 9:
                        _context3.next = 11;
                        return makeRequestFactory({
                            page: 1,
                            malIdIn: options.malIdIn,
                            aniIdIn: options.aniIdIn,
                            sort: options.sort,
                            season: options.season,
                            seasonYear: options.seasonYear,
                            includeSchedule: options.includeSchedule,
                            status: options.isReleasing ? 'RELEASING' : undefined
                        })();

                    case 11:
                        return _context3.abrupt('return', _context3.sent);

                    case 12:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function currentlyAiringAnime() {
        return _ref4.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var apiEndpoint = 'https://graphql.anilist.co';
var getAiringAnimeQuery = function getAiringAnimeQuery(includeSchedule) {
    return '\n  query (\n    $page: Int\n    $season: MediaSeason\n\t\t$seasonYear: Int\n\t\t$malIdIn: [Int]\n\t\t$aniIdIn: [Int]\n    $sort: [MediaSort]\n    $status: MediaStatus\n  ) {\n    Page (page: $page) {\n      pageInfo {\n        total\n        currentPage\n        lastPage\n        hasNextPage\n        perPage\n      }\n\n      media(\n\t\t\t\tseason: $season,\n\t\t\t\tseasonYear: $seasonYear\n\t\t\t\tidMal_in: $malIdIn,\n\t\t\t\tid_in: $aniIdIn,\n        sort: $sort\n        status: $status\n\t\t\t) {\n        id\n        description\n        idMal\n        title {\n          romaji\n          native\n          english\n        }\n        studios {\n          edges {\n            node {\n              name\n            }\n          }\n\t\t\t\t}\n\t\t\t\tformat\n        genres\n        status\n        coverImage {\n          large\n        }\n        episodes\n        startDate {\n          year\n          month\n          day\n        }\n        nextAiringEpisode {\n          id\n          episode\n          airingAt\n          timeUntilAiring\n        }\n        ' + (includeSchedule ? '\n          airingSchedule {\n            edges {\n              node {\n                episode\n                airingAt\n                timeUntilAiring\n              }\n            }\n          }\n        ' : '') + '\n      }\n    }\n  }\n';
};
// WINTER: Months December to February
// SPRING: Months March to Spring
// SUMMER: Months June to August
// FALL: Months September to November
function getCurrentSeason() {
    var month = new Date().getMonth() + 1; // Add 1 because getMonth starts a 0
    if (month === 12 || month >= 1 && month <= 2) {
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
    return new Date().getFullYear();
}

function makeRequestFactory(requestOptions) {
    var includeSchedule = requestOptions.includeSchedule;
    delete requestOptions.includeSchedule;
    return function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            var _ref3, data, hasNextPage;

            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return sendFetchRequest(getAiringAnimeQuery(includeSchedule), requestOptions);

                        case 2:
                            _ref3 = _context2.sent;
                            data = _ref3.data;
                            hasNextPage = data.Page.pageInfo.hasNextPage;

                            requestOptions.page = requestOptions.page + 1;
                            return _context2.abrupt('return', {
                                shows: data.Page.media,
                                next: hasNextPage ? makeRequest : null
                            });

                        case 7:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function makeRequest() {
            return _ref2.apply(this, arguments);
        }

        return makeRequest;
    }();
}

return currentlyAiringAnime;

})));
