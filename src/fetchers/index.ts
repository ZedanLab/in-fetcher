import { BasicProfileFetcher } from './basic_profile_fetcher.js';
import { Fetcher } from './fetcher.js';
import { GivenRecommendationsFetcher } from './given_recommendations_fetcher.js';
import { RecommendationsFetcher } from './recommendations_fetcher.js';

export * from './fetcher.js';
export * from './basic_profile_fetcher.js';
export * from './given_recommendations_fetcher.js';
export * from './recommendations_fetcher.js';

export const fetchers = {
  profile: new BasicProfileFetcher(),
  recommendations: new RecommendationsFetcher(),
  givenRecommendations: new GivenRecommendationsFetcher(),
};

export const asFetcher = (fetcher: string): Fetcher => fetchers[fetcher];
