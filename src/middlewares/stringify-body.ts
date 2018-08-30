import { FetchMiddleware } from '../lib';

export const stringifyBody: FetchMiddleware = (options, next) => {
  const getBody = () => {
    if (typeof options.body === 'string') {
      return options.body;
    }

    return JSON.stringify(options.body);
  };

  return next({
    ...options,
    body: getBody()
  });
};
