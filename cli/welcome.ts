import figlet from 'figlet';
import gradient from 'gradient-string';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import clearConsole from 'clear-any-console';

const pkg = JSON.parse(
  readFileSync(
    new URL('./../../package.json', import.meta.url),
  ) as unknown as string,
);

export const welcome = (clear = true): void => {
  const { author, displayName, version, description } = pkg;

  clear && clearConsole();

  console.log();

  console.log(
    gradient.mind(
      figlet.textSync(displayName, {
        font: 'Doom',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      }),
    ),
  );

  console.log(`${chalk.dim(description)} v${version} By ${chalk.dim(author)}`);
  console.log();
};
