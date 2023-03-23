import path from 'path';
import config from 'config';
import alert from 'cli-alerts';
import { BrowserOptions } from '../types.d/index.js';
import { defaultsOptions } from '../constants.js';
import { Fetcher, asFetcher } from '../fetchers/index.js';

type ENV = {
  LI_AT_COOKIE: string;
  BROWSER_OPTIONS: BrowserOptions;
  FETCHERS: Fetcher[];
  USERNAMES: string[];
  OUTPUT_PATH: string;
};

class ConfigManager {
  protected _values: ENV;
  protected _path: string;

  constructor() {
    this.setConfigPath();
  }

  // Parsing the env file.
  public setConfigPath = (envPath?: string, validate = false): this => {
    this._path = envPath ?? path.resolve(path.dirname('.').concat('env'));

    alert({
      type: `DEBUG`,
      msg: 'NODE_ENV: ' + config.util.getEnv('NODE_CONFIG_DIR'),
      name: `lodaing from`,
    });

    this._setValues();
    validate && this.validate();

    return this;
  };

  // Get config value
  public get = (key: string): string => {
    return this._values[key];
  };

  // Throwing an Error if any field was undefined
  public validate = (): void => {
    for (const [key, value] of Object.entries(this._values)) {
      if (value !== undefined) {
        continue;
      }

      alert({
        type: `error`,
        name: `Error`,
        msg: `Missing key ${key} in ${this._path} file`,
      });

      process.exit(1);
    }
  };

  private _setValues(): void {
    this._values = {
      LI_AT_COOKIE: config.get('LI_AT_COOKIE'),
      BROWSER_OPTIONS: this._getBrowserOptions(),
      FETCHERS: this._getFetchers(),
      USERNAMES: this._getUsernames(),
      OUTPUT_PATH: this._getOutputPath(),
    };
  }

  private _getBrowserOptions(): BrowserOptions {
    if (config.has('BROWSER_OPTIONS')) {
      return config.get('BROWSER_OPTIONS');
    }

    return defaultsOptions;
  }

  private _getFetchers(): Fetcher[] {
    if (config.has('FETCHERS'))
      return (config.get('FETCHERS') as string[]).map(asFetcher);

    return [];
  }

  private _getUsernames(): string[] {
    if (config.has('USERNAMES')) return config.get('USERNAMES');

    return [];
  }

  private _getOutputPath():string {
    if (config.has('OUTPUT_PATH')) return config.get('OUTPUT_PATH');

    return './in-fetcher-output.json';
  }
}

const configManager = new ConfigManager();
export default configManager.get;
export const Config = configManager;
