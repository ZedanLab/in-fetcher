import { urls } from '../constants.js';
import { RecommendationsFetcher } from './recommendations_fetcher.js';

/**
 * @class GivenRecommendationsFetcher
 * @extends Fetcher
 */
export class GivenRecommendationsFetcher extends RecommendationsFetcher {
  protected getUrl(): string {
    return urls.givenRecommendations(this._username);
  }
}
