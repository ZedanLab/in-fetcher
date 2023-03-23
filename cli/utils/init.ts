import unhandled from 'cli-handle-unhandled';
import { logger } from '../../src/logger/logger.js';
import { welcome } from '../welcome.js';
import { spinner } from './spinner.js';

export const init = async ({
  clear = true,
  verbose = false,
  debug = false,
}): Promise<void> => {
  spinner.start('Initializing in-Fetcher...');

  verbose && logger.enableInfo();

  if (debug) {
    logger.enableWarn();
    logger.enableError();
    logger.enableDebug();
  }

  unhandled();
  welcome(clear);

  spinner.succeed('Initializing in-Fetcher... DONE');
};
