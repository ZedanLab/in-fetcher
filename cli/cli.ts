import meow, { AnyFlags, Options } from 'meow';
import meowHelp from 'cli-meow-help';

const flags = {
  usernames: {
    type: `string`,
    isRequired: false,
    alias: `u`,
    desc: `LinkedIn username(s) that you want to fetch separated with comma`,
  },
  fetchers: {
    type: `string`,
    isRequired: false,
    alias: `f`,
    desc: `LinkedIn profile section(s) that you want to fetch separated with comma`,
  },
  output: {
    type: `string`,
    isRequired: false,
    alias: `o`,
    desc: `The output file path`,
  },
  version: {
    type: `boolean`,
    alias: `v`,
    desc: `Print CLI version`,
  },
  help: {
    type: `boolean`,
    alias: `h`,
    desc: `Print help info`,
  },
  verbose: {
    type: `boolean`,
    desc: `Display detailed processing information`,
  },
  debug: {
    type: `boolean`,
    default: false,
    desc: `Print debug info`,
  },
  noClear: {
    type: `boolean`,
    default: false,
    desc: `Don't clear the console`,
  },
};

const commands = {
  help: { desc: `Print help info` },
};

const helpText = meowHelp({
  name: `in-fetcher`,
  flags,
  commands,
});

const options: Options<AnyFlags> = {
  flags: flags as unknown as AnyFlags,
  inferType: true,
  description: false,
  hardRejection: false,
  importMeta: import.meta,
};

export const cli = meow(helpText, options);
