import { fetchers, InFetcher, events } from './index.js';

const profiles = await new InFetcher()
  .on(events.fetcher.data, () => {
    // console.log('username', data.username);
    // console.log('fetcher', data.fetcher);
    // console.log('fetchedData', data.fetchedData);
  })
  .setFetchers([fetchers.recommendations, fetchers.givenRecommendations])
  .setUsernames(['mozedan'])
  .setOptions({
    headless: true,
    args: [
      '--remote-debugging-address=0.0.0.0',
      '--remote-debugging-port=9222',
    ],
    slowMo: 20,
  })
  .run();

console.log(profiles);
