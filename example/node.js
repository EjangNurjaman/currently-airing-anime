import fetch from 'node-fetch'

global.fetch = fetch

import currentlyAiringAnime from '../currentlyAiringAnime'

currentlyAiringAnime().then(({shows, next}) => {
  console.log(shows)
})
