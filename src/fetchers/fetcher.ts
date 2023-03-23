import { HTTPResponse, Page } from 'puppeteer';
import { logger } from '../logger/logger.js';
import * as cheerio from 'cheerio';
import { InFetcher } from '../in-fetcher.js';
import { events } from '../events.js';
import { Person, Recommendation } from '../types.d/index.js';
import { camelCase } from 'camel-case';
import { BasicProfileFetcher } from './basic_profile_fetcher.js';

const selectors = {
  chatPanel: '.msg-overlay-list-bubble',
  privacyAcceptBtn: 'button.artdeco-global-alert__action',
};

export type FetchedData = Array<Recommendation> | Person;
export type FetchedDataWithMeta = {
  username: string;
  fetcher: string;
  fetchedData: FetchedData;
};

export abstract class Fetcher {
  protected _username: string;
  protected _window: Page;
  protected _html: cheerio.CheerioAPI;
  protected _manager: InFetcher;

  /**
   * @constructor
   */
  constructor(username?: string, window?: Page) {
    username && this.setUsername(username);
    window && this.setWindow(window);
  }

  /**
   * Set account username
   *
   * @param {string} username
   */
  public setUsername(username: string): this {
    this._username = username;

    return this;
  }

  /**
   * Set window
   *
   * @param {Page} window
   */
  public setWindow(window: Page): this {
    this._window = window;

    return this;
  }

  /**
   * Check if session is authenticated
   */
  protected _isAuthenticatedSession = async (): Promise<boolean> => {
    const cookies = await this._window.cookies();
    return cookies.some((e) => e.name === 'li_at');
  };

  /**
   * Hide chat panel
   */
  protected _hideChatPanel = async (): Promise<void> => {
    try {
      await this._window.evaluate((selector) => {
        const div = document.querySelector(selector) as HTMLElement;
        if (div) {
          div.style.display = 'none';
        }
      }, selectors.chatPanel);
    } catch (err) {
      logger.debug(`[${this.constructor.name}]`, 'Failed to hide chat panel');
    }
  };

  /**
   * Accept cookies
   *
   */
  protected _acceptCookies = async (): Promise<void> => {
    try {
      await this._window.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cookieButton = buttons.find((e) =>
          e.innerText.includes('Accept cookies'),
        );

        if (cookieButton) {
          cookieButton.click();
        }
      });
    } catch (err) {
      logger.debug(`[${this.constructor.name}]`, 'Failed to accept cookies');
    }
  };

  /**
   * Accept privacy
   *
   * @param {Page} page
   * @param {string} tag
   */
  protected _acceptPrivacy = async (): Promise<void> => {
    try {
      await this._window.evaluate((selector) => {
        const privacyButton: HTMLElement | undefined = Array.from(
          document.querySelectorAll<HTMLElement>(selector),
        ).find((e) => e.innerText === 'Accept');

        if (privacyButton) {
          privacyButton.click();
        }
      }, selectors.privacyAcceptBtn);
    } catch (err) {
      logger.debug(`[${this.constructor.name}]`, 'Failed to accept privacy');
    }
  };

  protected goto = async (url: string): Promise<HTTPResponse> => {
    logger.info('[Browser]', 'Opening', url);

    return await this._window.goto(url, {
      waitUntil: 'load',
    });
  };

  protected async evalHtml(
    selector: string,
    timeout = 3000,
  ): Promise<string | null> {
    try {
      await this._window.waitForSelector(selector, {
        timeout,
      });

      return await this._window.$eval(selector, (el) => el.innerHTML);
    } catch (error) {
      return null;
    }
  }

  public async run(manager: InFetcher): Promise<FetchedDataWithMeta> {
    this._manager = manager;

    logger.info(`[${this.constructor.name}]`, `@in/${this._username}'s`);

    await this._isAuthenticatedSession();
    await this._hideChatPanel();
    await this._acceptCookies();
    await this._acceptPrivacy();

    const fetchedData = await this.handle();
    logger.enable();
    logger.info(
      `[${this.constructor.name}]`,
      `@in/${this._username}'s ... DONE`,
    );

    const data: FetchedDataWithMeta = {
      username: this._username,
      fetcher: this.getKey(),
      fetchedData,
    };

    this._manager.emit(events.fetcher.data, data);

    return data;
  }

  public static async fetch(
    username: string,
    manager: InFetcher,
    window: Page,
    fetchers?: Fetcher[],
  ): Promise<Person> {
    const profileFetcher = new BasicProfileFetcher(username, window);

    fetchers = fetchers
      ? fetchers.filter((fetcher) => fetcher.getKey() !== 'basicProfile')
      : [];

    const profile = await profileFetcher.run(manager);

    for await (const fetcher of fetchers) {
      const data = await fetcher
        .setWindow(window)
        .setUsername(username)
        .run(manager);

      profile.fetchedData[data.fetcher] = data.fetchedData;
    }

    return profile.fetchedData as Person;
  }

  protected getKey(): string {
    return camelCase(`[${this.constructor.name}]`.replace('Fetcher', ''));
  }

  protected abstract handle(): Promise<null | FetchedData>;
}
