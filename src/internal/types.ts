import type { HonoControllerMeta } from '../hono/types';

export type Constructable<T> = new (...args: any[]) => T;
export type AbstractConstructable<T> = NewableFunction & { prototype: T };
export type InjectableIdentifier<T = unknown> =
  | Constructable<T>
  | AbstractConstructable<T>;
// | CallableFunction
// | string;

export enum InjectableItemType {
  HonoController = 'HonoController',
  // TODO GrpcService, CronService
}
export type InjectableItemMeta = {
  types: Set<InjectableItemType>;
  honoControllerMeta?: HonoControllerMeta;
};
