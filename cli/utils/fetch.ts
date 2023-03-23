import { InFetcher } from '../../src/in-fetcher.js';
import { Person } from '../../src/types.d/index.js';
import { asFetcher } from '../../src/fetchers/index.js';
import { spinner } from './spinner.js';

export const fetch = async (usernames:string, fetchers:string): Promise<Person[]> => {
  spinner.start('Fetching...');

  const manager = new InFetcher();

  fetchers && manager.setFetchers(fetchers.split(',').map(asFetcher));

  usernames && manager.setUsernames(usernames.split(','));

  const response = await manager.run();

  spinner.succeed('Fetching... DONE');

  return response;
};
