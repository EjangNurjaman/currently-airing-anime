import fetch from 'node-fetch';
global.fetch = fetch;
import currentlyAiringAnime from 'currently-airing-anime';

currentlyAiringAnime().then(res => console.log(res));
