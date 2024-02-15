import type { MiddlewareHandler } from 'hono';

export type ControllerMeta = {
  middlewares?: MiddlewareHandler[],
  handlers?: {
    [key: string]: HonoHandlerMeta
  }
};

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
  middlewares?: MiddlewareHandler[];
};