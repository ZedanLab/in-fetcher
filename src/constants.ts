import { BrowserOptions } from './types.d/index.js';

const urls = {
  home: 'https://linkedin.com',
  profile: (username: string): string => `${urls.home}/in/${username}`,
  recommendations: (username: string): string =>
    urls.profile(username) + '/details/recommendations',
  givenRecommendations: (username: string): string =>
    urls.recommendations(username) + '/?detailScreenTabIndex=1',
};

const defaultWidth = 1472;
const defaultHeight = 828;

const defaultsOptions: BrowserOptions = {
  headless: true,
  args: [
    '--enable-automation',
    '--start-maximized',
    `--window-size=${defaultWidth},${defaultHeight}`,
    '--lang=en-GB',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-accelerated-2d-canvas',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    "--proxy-server='direct://",
    '--proxy-bypass-list=*',
    '--allow-running-insecure-content',
    '--disable-web-security',
    '--disable-client-side-phishing-detection',
    '--disable-notifications',
    '--mute-audio',
  ],
  defaultViewport: null,
  pipe: true,
  slowMo: 20,
};

export { urls, defaultsOptions };
