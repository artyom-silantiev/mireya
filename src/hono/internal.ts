import type { MiddlewareHandler } from 'hono';
import { Metadata } from '../internal/metadata';
import type { ControllerMeta, StandartMethod } from './types';

export const controllersMeta = new Metadata();

export function baseHonoMiddlewares(
  middlewares: MiddlewareHandler[],
  target: any,
  key?: string,
) {
  if (key) {
    // method decorator
    controllersMeta.merge(target.constructor, {
      handlers: {
        [key]: {
          middlewares,
        },
      },
    } as ControllerMeta);
  } else {
    // class decorator
    controllersMeta.merge(target, { middlewares } as ControllerMeta);
  }
}

export function baseHonoHandlerDecorator(
  method: StandartMethod | string,
  path: string = '',
) {
  return function (target: Object, key: string) {
    controllersMeta.merge(target.constructor, {
      handlers: {
        [key]: {
          method,
          path,
        },
      },
    } as ControllerMeta);
  };
}
