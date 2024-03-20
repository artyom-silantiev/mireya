import { type Handler, type MiddlewareHandler, type Context, Hono } from 'hono';
import { Metadata } from '../utils/metadata';

export type HonoContext = Context;
export type HonoHandler = Handler;
type HonoMiddlewareHandler = MiddlewareHandler;

enum StandartMethod {
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

type HonoHandlerMeta = {
  methods?: (StandartMethod | string)[];
  paths?: string[];
  middlewares?: HonoMiddlewareHandler[];
};

type HonoControllerMeta = {
  middlewares?: HonoMiddlewareHandler[];
  handlers?: { [key: string]: HonoHandlerMeta };
};

const honoControllersMeta = new Metadata<any, HonoControllerMeta>();

function baseHonoMiddlewares(
  middlewares: MiddlewareHandler[],
  target: any,
  key?: string,
) {
  if (key) {
    // method decorator

    console.log('AAA', target.constructor);

    honoControllersMeta.merge(target.constructor, {
      handlers: {
        [key]: {
          middlewares,
        },
      },
    } as HonoControllerMeta);
  } else {
    // class decorator
    honoControllersMeta.merge(target, {
      middlewares,
    } as HonoControllerMeta);
  }
}

function baseHonoHandlerDecorator(
  methods: (StandartMethod | string)[],
  paths: string[],
) {
  return function (target: Object, key: string) {
    honoControllersMeta.merge(target.constructor, {
      handlers: {
        [key]: {
          methods,
          paths,
        },
      },
    } as HonoControllerMeta);
  };
}

export const HonoPack = {
  Controller() {
    return function (target: any) {
      honoControllersMeta.merge(target, {} as HonoControllerMeta);
    };
  },

  Middlewares(middlewares: MiddlewareHandler[]) {
    return function (target: any, key?: string) {
      return baseHonoMiddlewares(middlewares, target, key);
    };
  },
  Middleware(middleware: MiddlewareHandler) {
    return function (target: any, key?: string) {
      return baseHonoMiddlewares([middleware], target, key);
    };
  },

  All(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.ALL], [path]);
  },
  Head(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.HEAD], [path]);
  },
  Get(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.GET], [path]);
  },
  Options(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.OPTIONS], [path]);
  },
  Patch(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.PATCH], [path]);
  },
  Post(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.POST], [path]);
  },
  Put(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.PUT], [path]);
  },
  Delete(path: string = '') {
    return baseHonoHandlerDecorator([StandartMethod.DELETE], [path]);
  },
  On(methods: string[], paths: string[] = ['']) {
    if (methods.length === 0) {
      throw new Error('No methods found');
    }
    return baseHonoHandlerDecorator(methods, paths);
  },

  generateHonoFromController(target: any) {
    const meta = honoControllersMeta.get(target.constructor);

    if (!meta) {
      throw new Error('controller meta not found');
    }

    const hono = new Hono();

    // controller decorators
    if (meta.middlewares) {
      for (const middleware of meta.middlewares) {
        hono.all(middleware);
      }
    }

    // controller handlers
    if (meta.handlers) {
      for (const key of Object.keys(meta.handlers)) {
        const handler = meta.handlers[key];
        if (!handler.methods || !handler.paths) {
          continue;
        }

        console.log('handler', handler, key);

        hono.on(
          handler.methods,
          handler.paths,
          ...(handler.middlewares ? handler.middlewares : []),
          target[key].bind(target),
        );
      }
    }

    return hono;
  },
};
