import type { MiddlewareHandler } from "hono";
import { metadata } from "../internal/metadata";
import { sController } from "../internal/symbols";
import type { StandartMethod } from "./types";

export function baseHonoMiddlewares(
  middlewares: MiddlewareHandler[],
  target: any,
  key?: string | symbol,
) {
  if (key) {
    // method decorator
    metadata.merge([target.constructor, sController], {
      handlers: {
        [key]: {
          middlewares,
        },
      },
    });
  } else {
    // class decorator
    metadata.merge([target, sController], { middlewares });
  }
}

export function baseHonoHandlerDecorator(
  method: StandartMethod | string,
  path: string = "",
) {
  return function (target: Object, key: string) {
    metadata.merge([target.constructor, sController], {
      handlers: {
        [key]: {
          method,
          path,
        },
      },
    });
  };
}
