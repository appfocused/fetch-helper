import 'isomorphic-fetch';
import { pipe } from 'lodash/fp';

import { apiFetch, HTTPMethod, IFetchOptions } from '../src/lib';
import { autoContentType } from '../src/middlewares';

const defaultOptions = {
  url: 'http://localhost:8000/api'
};

const createResponse = pipe(
  JSON.stringify,
  (r: string) => new Response(r)
);
const successResponse = () => createResponse({ foo: 'bar' });
const errorResponse = () => createResponse({ body: { error: 'bar' }, ok: false, status: 500 });

describe('fetch api', () => {
  describe('WHEN promise is fulfilled with valid JSON', () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve(successResponse()));
    });

    it(`should resolve and return a parsed response`, async () => {
      const result = await apiFetch(defaultOptions);
      expect(result.data).toEqual({ foo: 'bar' });
      expect(result.status).toEqual(200);
    });

    it(`should resolve and return an unparsed response`, async () => {
      const result = await apiFetch({ ...defaultOptions, isParsed: false });
      expect(result.body).toEqual('{"foo":"bar"}');
      expect(result.data).toEqual(undefined);
      expect(result.status).toEqual(200);
    });
  });

  describe('WHEN promise is fulfilled with invalid JSON', () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve('foo'));
    });

    it(`should reject`, async () => {
      const result = apiFetch(defaultOptions);
      expect(result).rejects.toEqual('foo');
    });
  });

  describe('WHEN promise is not fullfulled', () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve(errorResponse()));
    });

    it(`should reject`, async () => {
      try {
        await apiFetch(defaultOptions);
      } catch (err) {
        expect(err.status).toEqual(500);
      }
    });
  });

  describe('core middleware', () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve(successResponse()));
    });

    it(`should set default params`, async () => {
      const spy = jest.fn().mockImplementation(() => Promise.resolve(successResponse()));
      window.fetch = spy;

      await apiFetch(defaultOptions);
      expect(spy).toBeCalledWith(defaultOptions.url, {
        credentials: 'same-origin',
        method: 'GET'
      });
    });

    it(`should remove undefined params`, async () => {
      const spy = jest.fn().mockImplementation(() => Promise.resolve(successResponse()));
      window.fetch = spy;

      await apiFetch({
        ...defaultOptions,
        body: undefined,
        method: 'POST'
      });
      expect(spy).toBeCalledWith(defaultOptions.url, {
        credentials: 'same-origin',
        method: 'POST'
      });
    });

    it(`should accept custom middleware`, async () => {
      const spy = jest.fn().mockImplementation(() => Promise.resolve(successResponse()));
      window.fetch = spy;

      let transformedUrl;

      const transformUrlMiddleware = (options: any, next: any) => {
        transformedUrl = '/' + options.url.split('/').pop();
        return next({ ...options, url: transformedUrl });
      };

      await apiFetch(defaultOptions, [transformUrlMiddleware]);
      expect(spy).toBeCalledWith(transformedUrl, {
        credentials: 'same-origin',
        method: 'GET'
      });
    });

    it(`should set content type`, async () => {
      const spy = jest.fn().mockImplementation(() => Promise.resolve(successResponse()));
      window.fetch = spy;
      const options: IFetchOptions = {
        ...defaultOptions,
        body: { foo: 'bar' },
        method: 'POST',
        headers: {
          'x-custom-token': '123456789'
        }
      };

      await apiFetch(options, [autoContentType]);
      expect(spy).toBeCalledWith(defaultOptions.url, {
        body: JSON.stringify(options.body),
        credentials: 'same-origin',
        method: 'POST',
        headers: { ...options.headers, 'Content-Type': 'application/json' }
      });
    });
  });
});
