import alert from 'cli-alerts';

export const sleep = (ms: number): Promise<number> =>
  new Promise((resolve) => setTimeout(resolve.bind(null, ms), ms));

export const die = (): void => {
  alert({
    type: `error`,
    name: `PROCESS EXIT`,
    msg: 'DIE()',
  });

  console.trace();

  process.exit();
};
