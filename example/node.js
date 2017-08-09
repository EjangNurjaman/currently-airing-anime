import fetch from 'node-fetch'

global.fetch = fetch

import currentlyAiringAnime from '../currentlyAiringAnime'

currentlyAiringAnime().then(result => {
  console.log('first', result)
})
