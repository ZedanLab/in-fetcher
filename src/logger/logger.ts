import debug from 'debug';
import alert from 'cli-alerts';
import { die } from '../utils/utils.js';

const namespace = 'in-fetcher';

const namespaces = {
  DEBUG: `${namespace}:debug`,
  INFO: `${namespace}:info`,
  WARN: `${namespace}:warn`,
  ERROR: `${namespace}:error`,
};

class Logger {
  public debug: debug.Debugger;
  public info: debug.Debugger;
  public warn: debug.Debugger;
  public error: debug.Debugger;

  constructor() {
    this.debug = this._debug();
    this.info = this._info();
    this.warn = this._warn();
    this.error = this._error();
  }

  private _debug = (): debug.Debugger => {
    return debug(namespaces.DEBUG);
  };

  private _info = (): debug.Debugger => {
    return debug(namespaces.INFO);
  };

  private _warn = (): debug.Debugger => {
    return debug(namespaces.WARN);
  };

  private _error = (): debug.Debugger => {
    return debug(namespaces.ERROR);
  };

  public enable = (): void => {
    debug.enable(`${namespace}:*`);
  };

  public disable = (): void => {
    debug.disable();
  };

  private _changeTo = (enable: boolean, namespace: string): void => {
    if (debug.namespaces) {
      namespace = `${debug.namespaces},${namespace}`;
    }

    enable ? debug.enable(namespace) : debug.disable(namespace);
  };

  public enableInfo = (enable = true): void => {
    this._changeTo(enable, namespaces.INFO);
  };

  public enableWarn = (enable = true): void => {
    this._changeTo(enable, namespaces.WARN);
  };

  public enableError = (enable = true): void => {
    this._changeTo(enable, namespaces.ERROR);
  };

  public enableDebug = (enable = true): void => {
    this._changeTo(enable, namespaces.DEBUG);
  };

  public dump = (...arg: debug.Debugger): void => {
    if (!this.debug.enabled) {
      return;
    }

    alert({
      type: `warning`,
      name: `DEBUG LOG`,
      msg: import.meta.url,
    });

    this.debug(...arg);
  };

  public dd = (...arg: debug.Debugger): void => {
    this.dump(...arg);
    die();
  };
}

/**
 * The Singleton class Logger instance.
 */
class Singleton {
  private static instance: Logger;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    //
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Logger {
    if (!Singleton.instance) {
      Singleton.instance = new Logger();
      Singleton._handle(Singleton.instance);
    }

    return Singleton.instance;
  }

  /**
   * Handle the execution on its instance.
   */
  private static _handle(instance: Logger): void {
    // Bind INFO to console (default is stderr)
    instance.info.log = console.log.bind(console);
    // instance.enable();
  }
}

export const logger = Singleton.getInstance();
