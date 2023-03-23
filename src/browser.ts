import { deepmerge } from 'deepmerge-ts';
import puppeteer, {
  Browser as PuppeteerBrowser,
  BrowserContext,
  HTTPRequest,
  Page,
} from 'puppeteer';
import config from './utils/config.js';
import { defaultsOptions } from './constants.js';
import { events } from './events.js';
import { logger } from './logger/logger.js';
import { InFetcher } from './in-fetcher.js';
import { BrowserOptions } from './types.d/index.js';
import { getBlockedHosts } from './utils/blocked_hosts.js';
import { getRandomUserAgent } from './utils/browser.js';

export declare type BrowserState =
  | 'notInitialized'
  | 'initializing'
  | 'initialized'
  | 'failed';

class Browser {
  private _options: BrowserOptions = defaultsOptions;
  private _browser: PuppeteerBrowser | undefined = undefined;
  private _context: BrowserContext | undefined = undefined;
  private _state: BrowserState = 'notInitialized' as BrowserState;
  private _manager: InFetcher;

  /**
   * @constructor
   * @param {BrowserOptions} options?
   */
  constructor(manager: InFetcher, options?: BrowserOptions) {
    this._manager = manager;

    this.setOptions(options ?? (config('BROWSER_OPTIONS') as BrowserOptions));
  }

  /**
   * Set browser options
   *
   * @param {BrowserOptions} options
   * @returns {this}
   */
  public setOptions(options: BrowserOptions): this {
    this._options = deepmerge(this._options, options);

    return this;
  }

  /**
   * Close browser instance
   *
   * @returns {Promise<void>}
   */
  public close = async (): Promise<void> => {
    try {
      if (this._browser) {
        this._browser.removeAllListeners() && (await this._browser.close());
      }
    } finally {
      this._browser = undefined;
      this._setState('notInitialized');
    }
  };

  /**
   * Close browser window / page by URL or tab position
   *
   * @param {number|string} window
   * @returns {Promise<void>}
   */
  public closeWindow = async (window: number | string): Promise<void> => {
    const pages = await this._browser.pages();

    for (let position = 0; position < pages.length; position++) {
      // if the given window is a number return window with the same position
      if (Number.isSafeInteger(window) && position == Number(window)) {
        await pages[position].close();
        continue;
      }

      // if the given window is a string return windows if
      if (pages[position].url() == window) {
        await pages[position].close();
        continue;
      }
    }
  };

  /**
   * Open new page in current context
   *
   * @returns {Promise<void>}
   */
  public newWindow = async (): Promise<Page> => {
    const page = await this._context.newPage();

    // Create Chrome Developer Tools session
    const cdpSession = await page.target().createCDPSession();

    // Disable Content Security Policy: needed for pagination to work properly in anonymous mode
    await page.setBypassCSP(true);

    // Tricks to speed up page
    await cdpSession.send('Page.enable');
    await cdpSession.send('Page.setWebLifecycleState', {
      state: 'active',
    });

    // Set a random user agent
    await page.setUserAgent(getRandomUserAgent());

    // Enable request interception
    await page.setRequestInterception(true);

    // Add listener
    page.on('request', this.abortBlockedRequests);

    // Error response and rate limiting check
    page.on('response', (response) => {
      if (response.status() === 429) {
        logger.warn(
          '[Browser]',
          "Error 429 too many requests. You would probably need to use a higher 'slowMo' value and/or reduce the number of concurrent queries.",
        );
      } else if (response.status() >= 400) {
        logger.warn(
          '[Browser]',
          response.status(),
          `Error for request ${response.request().url()}`,
        );
      }
    });

    return page;
  };

  private async abortBlockedRequests(request: HTTPRequest): Promise<void> {
    const url = new URL(request.url());
    const blockedResourcesByHost = ['script', 'xhr', 'fetch', 'document'];
    const blockedResources = [
      // 'image',
      'media',
      'font',
      'texttrack',
      'object',
      'beacon',
      'csp_report',
      'imageset',
    ];
    const blockedPaths = [
      'li/track',
      'realtime.www.linkedin.com/realtime',
      'platform.linkedin.com/litms/utag/voyager-web-jobs',
    ];

    // block resources
    if (blockedResources.includes(request.resourceType())) {
      return request.abort();
    }

    // Block all script requests from certain host names
    if (
      blockedResourcesByHost.includes(request.resourceType()) &&
      url.hostname &&
      getBlockedHosts[url.hostname] === true
    ) {
      return request.abort();
    }

    // Block paths
    if (blockedPaths.some((e) => url.pathname.includes(e))) {
      return request.abort();
    }

    return request.continue();
  }

  /**
   * Get browser state
   *
   * @returns {BrowserState}
   */
  public state(): BrowserState {
    return this._state;
  }

  /**
   * Set browser state
   *
   * @param {BrowserState} state
   * @returns {this}
   */
  private _setState(state: string): this {
    this._state = state as BrowserState;

    return this;
  }

  /**
   * Launch puppeteer browser with the given options
   *
   * @returns {this}
   */
  private async _launch(): Promise<this> {
    this._browser = await puppeteer.launch(this._options);
    this._context = this._browser.defaultBrowserContext();

    return this;
  }

  /**
   * Create incognito browser.
   *
   * @returns {this}
   */
  private async _launchIncognito(): Promise<this> {
    this._context = await this._browser.createIncognitoBrowserContext();

    return this;
  }

  /**
   * Emit fetching manager events on puppeteer browser events
   *
   * @returns {this}
   */
  private _setupPuppeteerListeners(): this {
    this._browser.on(events.puppeteer.browser.disconnected, () => {
      this._manager.emit(events.puppeteer.browser.disconnected);
    });

    this._browser.on(events.puppeteer.browser.targetcreated, () => {
      this._manager.emit(events.puppeteer.browser.targetcreated);
    });

    this._browser.on(events.puppeteer.browser.targetchanged, () => {
      this._manager.emit(events.puppeteer.browser.targetchanged);
    });

    this._browser.on(events.puppeteer.browser.targetdestroyed, () => {
      this._manager.emit(events.puppeteer.browser.targetdestroyed);
    });

    return this;
  }

  /**
   * Initialize browser
   * @private
   */
  public async init(): Promise<this> {
    try {
      logger.info('[Browser]', 'Launching browser in incognito...');

      // updating current status
      this._setState('initializing');

      // reset puppeteer browser if it initiated.
      await this.close();

      // launch puppeteer browser with the given options
      await this._launch();

      // close initial browser window / page
      await this.closeWindow(0);

      // open incognito window / page
      await this._launchIncognito();

      // emit InFetcher events on puppeteer browser events
      this._setupPuppeteerListeners();

      // updating current status
      this._setState('initialized');

      logger.info('[Browser]', 'Launched.');

      return this;
    } catch (err) {
      this._manager.emit(events.fetcher.error, err);
      await this.close();
      throw err;
    }
  }
}

export { Browser };
