import chalk from 'chalk';
import { urls } from '../constants.js';
import { logger } from '../logger/logger.js';
import { Company } from '../types.d/company.js';
import { Person } from '../types.d/person.js';
import { __html } from '../utils/html.js';
import { FetchedData, Fetcher } from './fetcher.js';

const selectors = {
  main: '#main',
  cover: 'div > div > div > div > img',
  avatar: 'div > div > div > div > button > img',
  name: 'div > div.mt2.relative > div:nth-child(1) > div:nth-child(1) > h1',
  headline:
    'div > div.mt2.relative > div:nth-child(1) > div.text-body-medium.break-words',
  about: 'div.display-flex.pv3 > div > div > div > span:nth-child(1)',
  city: 'div > div.mt2.relative > div.pv-text-details__left-panel.mt2 > span.text-body-small.inline.t-black--light.break-words',
  followers: 'div > ul > li > span',
  currentCompany: 'div > div.mt2.relative > ul > li:nth-child(1) > button',
  educationsDetails: 'div > div.mt2.relative > ul > li:nth-child(2) > button',
};

/**
 * @class BasicProfileFetcher
 * @extends Fetcher
 */
export class BasicProfileFetcher extends Fetcher {
  /**
   * Run fetcher
   *
   * @returns {Promise<void>}
   */
  public async handle(): Promise<null | FetchedData> {
    const url = urls.profile(this._username);

    await this.goto(url);

    const main = await this.evalHtml(selectors.main, 10000);

    if (this.isNotExists(main)) {
      logger.info(
        chalk.bgYellowBright(
          `[${this.constructor.name}]`,
          `@${this._username} profile doesn't exists.`,
        ),
      );
      return null;
    }

    this._html = __html(main);

    const preson = this.getProfile();

    return preson;
  }

  private getProfile(): Person {
    const cover = this._html(selectors.cover).prop('src');

    const avatar = this._html(selectors.avatar).prop('src');

    const name = this._html(selectors.name).text().trim();
    const headline = this._html(selectors.headline).text().trim();
    const about = this._html(selectors.about).text().trim();
    const city = this._html(selectors.city).text().trim();
    const followers = this._html(selectors.followers)
      .text()
      .trim()
      .replaceAll(',', '');
    const timestamp = Date.now();
    const currentCompany: Company = this.getCurrentCompany();
    const educationsDetails: Company = this.getEducationsDetails();

    // TODO: followers sometimes get with connections count

    return {
      url: urls.profile(this._username) as unknown as URL,
      avatar: avatar as unknown as URL,
      cover: cover as unknown as URL,
      name: name,
      headline: headline,
      about: about,
      city: city,
      followers: Number(followers),
      currentCompany: currentCompany,
      educationsDetails: educationsDetails,
      timestamp: timestamp,
    };
  }

  getEducationsDetails(): Company | null {
    if (this._html(selectors.educationsDetails).html() === null) {
      return null;
    }

    return {
      name: this._html(selectors.educationsDetails + ' > span')
        .text()
        .trim(),
      logo: this._html(selectors.educationsDetails + ' > img').prop(
        'src',
      ) as unknown as URL,
    };
  }

  private getCurrentCompany(): Company | null {
    if (this._html(selectors.currentCompany).html() === null) {
      return null;
    }

    return {
      name: this._html(selectors.currentCompany + ' > span')
        .text()
        .trim(),
      logo: this._html(selectors.currentCompany + ' > img').prop(
        'src',
      ) as unknown as URL,
    };
  }

  private isNotExists(main: string): boolean {
    return main === null;
  }
}
