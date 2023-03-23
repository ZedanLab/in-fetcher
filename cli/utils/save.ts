import { Person } from '../../src/types.d/index.js';
import { spinner } from './spinner.js';
import { writeFileSync } from 'fs';

export const saveTo = (path: string, data: Person[]): void => {
  try {
    spinner.start(`Saving data to ${path}...`);
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
    spinner.succeed(`Saving data to ${path}... DONE`);
  } catch (error) {
    spinner.fail(`Saving data to ${path}... FAILED`);
    console.log('An error has occurred ', error);
  }
};
