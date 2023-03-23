import {
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  LaunchOptions,
} from 'puppeteer';

type BrowserOptions = LaunchOptions &
  BrowserLaunchArgumentOptions &
  BrowserConnectOptions;

export { BrowserOptions };
