// puppeteer.use(require('puppeteer-extra-plugin-stealth')()); // TODO: breaks with new target tabs: to investigate

import { deepmerge } from 'deepmerge-ts';
import EventEmitter from 'events';
import { Page } from 'puppeteer';
import { Browser } from './browser.js';
import config from './utils/config.js';
import { urls } from './constants.js';
import { IEventListeners } from './events.js';
import { Fetcher } from './fetchers/index.js';
import { logger } from './logger/logger.js';
import { BrowserOptions } from './types.d/index.js';
import { Person } from './types.d/index.js';
import TypedEventEmitter from './utils/typed_event_emitter.js';

export declare type ManagerState =
  | 'notInitialized'
  | 'initializing'
  | 'initialized'
  | 'failed';

/**
 * InFetcher class
 *
 * @extends TypedEventEmitter
 * @param {string[]|string} usernames
 * @param {Fetcher[] | Fetcher} fetchers
 * @param {BrowserOptions} options Puppeteer browser options, for more information see https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-puppeteerlaunchoptions
 */
class InFetcher extends (EventEmitter as new () => TypedEventEmitter<IEventListeners>) {
  private _browser: Browser | undefined = undefined;
  private _options: BrowserOptions;
  private _fetchers: Fetcher[];
  private _usernames: string[];

  /**
   * @constructor
   *
   * @param {string[] | string} usernames
   * @param {Fetcher[] | Fetcher} fetchers
   * @param {BrowserOptions} options
   */
  constructor(
    usernames?: string[] | string,
    fetchers?: Fetcher[] | Fetcher,
    options?: BrowserOptions,
  ) {
    super();

    options && this.setOptions(options);

    this.setFetchers(
      fetchers ?? (config('FETCHERS') as unknown as Fetcher | Fetcher[]),
    );

    this.setUsernames(usernames ?? config('USERNAMES'));
  }

  /**
   * Set fetcher options
   *
   * @param {BrowserOptions} options
   * @returns {this} The current instance.
   */
  public setOptions(options: BrowserOptions): this {
    this._options = deepmerge(this._options, options);

    return this;
  }

  /**
   * Set fetchers
   *
   * @param {Fetcher[] | Fetcher} fetchers
   * @returns {this} The current instance.
   */
  public setFetchers(fetchers: Fetcher[] | Fetcher): this {
    if (fetchers instanceof Fetcher) {
      fetchers = [fetchers];
    }

    this._fetchers = fetchers;

    return this;
  }

  /**
   * Set the username of profile(s) you want to fetch.
   *
   * @param {string[] | string} usernames The profile(s) you want to fetch.
   * @returns {this} The current instance.
   */
  public setUsernames(usernames: string[] | string): this {
    if (typeof usernames == 'string') {
      usernames = [usernames];
    }

    this._usernames = usernames;

    return this;
  }

  /**
   * Run the fetching process.
   *
   * @return {Promise<Person[]>}
   */
  public run = async (): Promise<Person[]> => {
    this._browser = await new Browser(this, this._options).init();

    const window = await this.setLinkedInCookie();

    const profiles: Person[] = [];

    for await (const username of this._usernames) {
      profiles.push(
        await Fetcher.fetch(username, this, window, this._fetchers),
      );
    }

    this._browser.close();

    return profiles;
  };

  protected async setLinkedInCookie(): Promise<Page> {
    const window = await this._browser.newWindow();

    await window.goto(urls.home, {
      waitUntil: 'load',
    });

    await window.setCookie({
      name: 'li_at',
      value: config('LI_AT_COOKIE'),
      domain: '.www.linkedin.com',
    });

    logger.info('[Browser]', 'Setting LinkedIn cookie...');

    return window;
  }
}

export { InFetcher };
