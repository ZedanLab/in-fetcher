import { exec } from 'child_process';

import randomUserAgent from 'random-useragent';
import { UserAgent } from '../types.d/user_agent.js';

const browsers = [
  {
    name: 'Chrome',
    minVersion: 55,
  },
  {
    name: 'Firefox',
    minVersion: 50,
  },
];

const folders = [
  '/Browsers - Linux',
  '/Browsers - Mac',
  // "Browsers - Windows",
];

const getRandomUserAgent = (): string => {
  return randomUserAgent.getRandom((ua: UserAgent) => {
    return (
      folders.some((e) => e === ua.folder) &&
      browsers.some(
        (e) =>
          ua.browserName === e.name &&
          parseInt(ua.browserMajor, 10) > e.minVersion,
      )
    );
  }) as string;
};

const killChromium = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Killing Chromium processes');
    const cmd =
      "ps aux | grep -v grep | grep -i \"chromium\" | awk -F ' +' '{print $2}' | xargs kill -9 || :";
    exec(cmd, (err, stdout) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      console.log(stdout);
      return resolve();
    });
  });
};

export { getRandomUserAgent, killChromium };
