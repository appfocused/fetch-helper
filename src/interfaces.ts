import { IFetchOptions } from './interfaces';

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'DELETE'
  | 'PATCH'
  | 'PUT'
  | 'HEAD'
  | 'OPTIONS'
  | 'CONNECT';

export enum ContentType {
  NONE = '',
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
  FORM_DATA = 'multipart/form-data',
  TEXT = 'text/plain',
  BLOB = 'application/octet-stream',
  ARRAY_BUFFER = 'application/octet-stream'
}

export interface IFetchOptions extends IRequest {
  url: string;
  isParsed?: boolean;
}

interface IRequest {
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  mode?: RequestMode;
  method?: HTTPMethod;
  redirect?: RequestRedirect;
  referrerPolicy?: ReferrerPolicy;
  body?: any;
}

export type NextFn = (options: IFetchOptions) => IFetchOptions;
export type FetchMiddleware = (options: IFetchOptions, next: NextFn) => IFetchOptions;
