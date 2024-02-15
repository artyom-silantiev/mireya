import type { MiddlewareHandler } from 'hono';
import { metadata } from '../internal/metadata';
import { sController } from '../internal/symbols';
import { StandartMethod, type ControllerMeta } from './types';
import { baseHonoHandlerDecorator, baseHonoMiddlewares } from './internal';

// Controller decorator

export function Controller() {
  return function (target: any) {
    metadata.merge([target, sController], {} as ControllerMeta);
  };
}

// Middlewares decorators

export function Middlewares(middlewares: MiddlewareHandler[]) {
  return function (target: any, key?: string) {
    return baseHonoMiddlewares(middlewares, target, key);
  };
}

export function Middleware(middleware: MiddlewareHandler) {
  return function (target: any, key?: string) {
    return baseHonoMiddlewares([middleware], target, key);
  };
}

// Handlers decorators

export function All(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.ALL, path);
}

export function Head(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.HEAD, path);
}

export function Get(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.GET, path);
}

export function Options(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.OPTIONS, path);
}

export function Patch(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.PATCH, path);
}

export function Post(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.POST, path);
}

export function Put(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.PUT, path);
}

export function Delete(path?: string) {
  return baseHonoHandlerDecorator(StandartMethod.DELETE, path);
}
