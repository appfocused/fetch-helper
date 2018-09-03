import { pipe, isUndefined, omitBy } from 'lodash/fp';
import { IFetchOptions, FetchMiddleware, NextFn } from '../interfaces';
import { defaultOptions, stringifyBody } from '../middlewares';

const getRequestOptions = (options: Partial<IFetchOptions>) => {
  return omitBy(isUndefined, options);
};

const checkStatus = (response: Response) => {
  const isSuccessful = response.status >= 200 && response.status < 400;
  if (isSuccessful) {
    return response;
  }

  throw response;
};

const parseResponse = (isParsed: boolean = true) => (response: Response) => {
  if (isParsed) {
    return response.json ? response.json() : Promise.reject(response);
  }

  return response;
};

const rawFetch = (nextOptions: IFetchOptions) => {
  const { url, isParsed, ...remainingOptions } = nextOptions;
  return fetch(url, getRequestOptions(remainingOptions))
    .then(parseResponse(isParsed))
    .then(checkStatus);
};

export const coreApiFetch = (options: IFetchOptions, middlewares: FetchMiddleware[] = []) => {
  const steps = [...middlewares];
  const next: NextFn = nextOptions => {
    const nextMiddleware = steps.pop();
    return nextMiddleware ? nextMiddleware(nextOptions, next) : nextOptions;
  };

  return pipe(
    next,
    rawFetch
  )(options);
};

export const apiFetch = (options: IFetchOptions, middlewares: FetchMiddleware[] = []) =>
  coreApiFetch(options, [defaultOptions, stringifyBody, ...middlewares]);
