import { FetchMiddleware } from '../lib';

export const defaultOptions: FetchMiddleware = (options, next) => {
  const {
    credentials = 'same-origin',
    method = 'GET',
    isParsed = true,
    ...remainingOptions
  } = options;

  return next({
    credentials,
    method,
    isParsed,
    ...remainingOptions
  });
};
