import type { HonoControllerMeta } from '../hono/types';

export enum InjectableItemType {
  Service = 'Service',
  HonoController = 'HonoController',
  // TODO GrpcService, CronService
}
export type InjectableItemMeta = {
  types: Set<InjectableItemType>;
  serviceMeta: {};
  honoControllerMeta?: HonoControllerMeta;
};
