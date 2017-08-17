# Currently Airing Anime

Currently Airing Anime is a simple package that allows you to retrieve currently airing anime from AniList.

```js
import currentlyAiringAnime from 'currently-airing-anime'

currentlyAiringAnime().then(({shows, next}) => {

  console.log(shows) // --> logs up an array containing up to 50 array airing anime shows

  // The next variable allows for paginating to the next 50 items.
  if (next) {

    next().then(({shows, next}) => {
      console.log(shows) // --> logs shows    
  
      if (next) {
        // ...
      }
    })  
  }
})
```

```js
// Possible configuration options
currentlyAiringAnime({
  season: 'SUMMER', // 'WINTER', 'SPRING', 'SUMMER', 'FALL'
  seasonYear: 2017,
  malIdIn: [34914, 34902, 34881], // Include only these MyAnimeList Ids
  aniIdIn: [98292, 98291, 98251], // Include only these AniList ids
  sort: ['START_DATE'] // An array of sort options (see below for all ssort options)
})
```

See the `example/` folder for an implementation example for the browser.

### Installing

Install the package with npm or download include the `currentlyAiringAnime.js` file in the browser.

```sh
npm install currently-airing-anime
```

For node you will need to include the package `node-fetch`

```sh
npm install node-fetch
```

```js
import fetch from 'node-fetch'

global.fetch = fetch

import currentlyAiringAnime from '../currentlyAiringAnime'

currentlyAiringAnime().then(({shows, next}) => {
  console.log(shows)
})
```

#### Sort Options

```
ID
ID_DESC
TITLE_ROMAJI
TITLE_ROMAJI_DESC
TITLE_ENGLISH
TITLE_ENGLISH_DESC
TITLE_NATIVE
TITLE_NATIVE_DESC
TYPE
TYPE_DESC
FORMAT
FORMAT_DESC
START_DATE
START_DATE_DESC
END_DATE
END_DATE_DESC
SCORE
SCORE_DESC
POPULARITY
POPULARITY_DESC
EPISODES
EPISODES_DESC
DURATION
DURATION_DESC
STATUS
STATUS_DESC
CHAPTERS
CHAPTERS_DESC
VOLUMES
VOLUMES_DESC
UPDATED_AT
UPDATED_AT_DESC
```
