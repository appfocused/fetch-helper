import { FetchMiddleware, ContentType } from '../interfaces';

export const autoContentType: FetchMiddleware = (options, next) => {
  const type = detectContentType(options.body);

  return next({
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': type
    }
  });
};

export const detectContentType = (body: any): ContentType => {
  if (body === null || body === undefined) {
    return ContentType.NONE;
  } else if (body instanceof URLSearchParams) {
    return ContentType.FORM;
  } else if (body instanceof FormData) {
    return ContentType.FORM_DATA;
  } else if (body instanceof Blob) {
    return ContentType.BLOB;
  } else if (body instanceof ArrayBuffer) {
    return ContentType.ARRAY_BUFFER;
  } else if (body && typeof body === 'object') {
    return ContentType.JSON;
  } else {
    return ContentType.TEXT;
  }
};

// tslint:disable-next-line:no-empty
const noop = () => {};
const w: any = typeof window === 'object' ? window : noop;
const FormData = w.FormData || noop;
const Blob = w.Blob || noop;
export const ArrayBuffer: ArrayBufferConstructor = w.ArrayBuffer || noop;
