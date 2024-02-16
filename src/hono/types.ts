import type { Handler, MiddlewareHandler, Context } from 'hono';

export type HonoContext = Context;
export type HonoHandler = Handler;
export type HonoMiddlewareHandler = MiddlewareHandler;

export enum StandartMethod {
  USE = 'USE',
  ALL = 'ALL',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export type HonoHandlerMeta = {
  method?: StandartMethod | string;
  path?: string;
  middlewares?: HonoMiddlewareHandler[];
};

export type HonoControllerMeta = {
  middlewares?: HonoMiddlewareHandler[];
  handlers?: {
    [key: string]: HonoHandlerMeta;
  };
};
