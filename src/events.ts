import { BrowserEmittedEvents } from 'puppeteer';
import { FetchedDataWithMeta } from './fetchers/fetcher.js';

interface IEvents {
  fetcher: {
    error: 'fetcher:error';
    invalidSession: 'fetcher:invalid-session';
    end: 'fetcher:end';
    data: 'fetcher:data';
  };
  puppeteer: {
    browser: {
      disconnected: BrowserEmittedEvents;
      targetchanged: BrowserEmittedEvents;
      targetcreated: BrowserEmittedEvents;
      targetdestroyed: BrowserEmittedEvents;
    };
  };
}

const events: IEvents = {
  fetcher: {
    error: 'fetcher:error',
    invalidSession: 'fetcher:invalid-session',
    end: 'fetcher:end',
    data: 'fetcher:data',
  },
  puppeteer: {
    browser: {
      disconnected: BrowserEmittedEvents.Disconnected,
      targetchanged: BrowserEmittedEvents.TargetChanged,
      targetcreated: BrowserEmittedEvents.TargetCreated,
      targetdestroyed: BrowserEmittedEvents.TargetDestroyed,
    },
  },
};

export type IEventListeners = {
  ['fetcher:error']: (error: Error | string) => void;
  ['fetcher:invalid-session']: () => void;
  ['fetcher:end']: () => void;
  ['fetcher:data']: (data: FetchedDataWithMeta) => void;
  ['disconnected']: (...args: unknown[]) => void;
  ['targetchanged']: (...args: unknown[]) => void;
  ['targetcreated']: (...args: unknown[]) => void;
  ['targetdestroyed']: (...args: unknown[]) => void;
};

export { events };
