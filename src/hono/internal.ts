import type { MiddlewareHandler } from 'hono';
import type { StandartMethod } from './types';
import { injectableItems } from '../module/internal';
import { InjectableItemType, type InjectableItemMeta } from '../internal/types';

export function baseHonoMiddlewares(
  middlewares: MiddlewareHandler[],
  target: any,
  key?: string,
) {
  if (key) {
    // method decorator
    injectableItems.merge(target.constructor, {
      types: new Set([InjectableItemType.HonoController]),
      honoControllerMeta: {
        handlers: {
          [key]: {
            middlewares,
          },
        },
      },
    } as InjectableItemMeta);
  } else {
    // class decorator
    injectableItems.merge(target, {
      types: new Set([InjectableItemType.HonoController]),
      honoControllerMeta: {
        middlewares,
      },
    } as InjectableItemMeta);
  }
}

export function baseHonoHandlerDecorator(
  method: StandartMethod | string,
  path: string = '',
) {
  return function (target: any, key: string) {
    injectableItems.merge(target.constructor, {
      types: new Set([InjectableItemType.HonoController]),
      honoControllerMeta: {
        handlers: {
          [key]: {
            method,
            path,
          },
        },
      },
    } as InjectableItemMeta);
  };
}
