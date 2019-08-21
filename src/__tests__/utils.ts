export const RATE_LIMIT = 2000;

export const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
