#!/usr/bin/env node

import { init } from './utils/init.js';
import { cli } from './cli.js';
import { logger } from '../src/logger/logger.js';
import { fetch } from './utils/fetch.js';
import { saveTo } from './utils/save.js';
import { summaryOf } from './utils/summary.js';
import config from '../src/utils/config.js';

export type CliFlags = {
  clear: boolean;
  debug: boolean;
  help: boolean;
  output: string;
  usernames: string;
  fetchers: string;
  verbose: boolean;
};

const input = cli.input;

const { clear, debug, help, usernames, fetchers, verbose, output } =
  cli.flags as CliFlags;

(async (): Promise<void> => {
  await init({
    clear,
    verbose,
    debug,
  });

  debug && logger.dump(cli.flags);

  (input.includes(`help`) || help) && cli.showHelp(0);

  const data = await fetch(usernames, fetchers);

  saveTo(output ?? config('OUTPUT_PATH'), data);

  summaryOf(data);

  logger.info('data', data);
})();
