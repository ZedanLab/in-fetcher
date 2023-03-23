import { urls } from '../constants.js';
import { logger } from '../logger/logger.js';
import { Recommendation } from '../types.d/recommendation.js';
import { FetchedData, Fetcher } from './fetcher.js';
import { __html } from '../utils/html.js';
import * as cheerio from 'cheerio';
import chalk from 'chalk';

const selectors = {
  list: 'section > div.artdeco-tabs.artdeco-tabs--size-t-48.ember-view > div.artdeco-tabpanel.active.ember-view > div > div > div.scaffold-finite-scroll__content > ul',
  main: '#main',
  empty: '.artdeco-empty-state',
  recommendation: '.pvs-entity',
  profileUrl: 'div > div > div:nth-child(1) > a',
  avatar: 'div > div:nth-child(1) > a > div > div > img',
  name: 'div.display-flex.flex-row.justify-space-between > a > div > span.mr1.hoverable-link-text.t-bold > span:nth-child(1)',
  headline:
    'div.display-flex.flex-row.justify-space-between > a > span:nth-child(2) > span:nth-child(1)',
  description:
    'div.display-flex.flex-row.justify-space-between > a > span.t-14.t-normal.t-black--light > span:nth-child(1)',
  body: 'div.pvs-list__outer-container > ul > li > div > ul > li > div > div > div > span:nth-child(1)',
};

/**
 * @class RecommendationsFetcher
 * @extends Fetcher
 */
export class RecommendationsFetcher extends Fetcher {
  /**
   * Run fetcher
   *
   * @returns {Promise<void>}
   */
  public async handle(): Promise<null | FetchedData> {
    await this.goto(this.getUrl());

    if (await this._isEmpty()) {
      logger.info(
        chalk.bgYellowBright(
          `[${this.constructor.name}]`,
          `${this._username} haven't received a recommendation yet.`,
        ),
      );
      return [];
    }

    this._html = __html(await this.evalHtml(selectors.main));

    return this.getRecommendations();
  }

  protected getUrl(): string {
    return urls.recommendations(this._username);
  }

  protected getRecommendations(): Recommendation[] {
    const recommendations = this._html(selectors.list).find(
      selectors.recommendation,
    );

    return recommendations
      .map((_i, rec) => this.getRecommendation(rec))
      .toArray();
  }

  protected getRecommendation(
    el: string | cheerio.AnyNode | Buffer,
  ): Recommendation {
    const rec = __html(el);

    const profileUrl = rec(selectors.profileUrl).attr('href');
    const avatar = rec(selectors.avatar).attr('src');
    const name = rec(selectors.name).text().trim();
    const headline = rec(selectors.headline).text().trim();
    const description = rec(selectors.description).text().trim();
    const body = rec(selectors.body).text().trim();

    return {
      recommender: {
        name: name,
        headline: headline,
        url: profileUrl as unknown as URL,
        avatar: avatar as unknown as URL,
      },
      description: description,
      recommendation: body,
    };
  }

  protected async _isEmpty(): Promise<boolean> {
    const html = await this.evalHtml(`${selectors.main}`, 10000);

    if (html == null) return false;

    return __html(html)(selectors.empty).children().length > 0;
  }
}
