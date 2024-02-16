import { Metadata } from '../lib';
import {
  type ModuleMeta,
  type LifecycleHandler,
  LifecycleHandlerType,
} from './types';

export const injectableItems = new Metadata();
export const modulesMeta = new Metadata();
export const appModules = [] as Module[];
let modulesCount = 0;

export class Module {
  constructor() {
    const moduleMeta = {
      id: modulesCount++,
      module: this,
      usedModules: new Set<ModuleMeta>(),
      items: new Set<any>(),
      lifecycleHandlers: {},
    } as ModuleMeta;
    modulesMeta.set(this, moduleMeta);
    appModules.push(this);
  }

  meta() {
    return modulesMeta.get(this) as ModuleMeta;
  }

  // TODO
  useModule() {}
  useModules() {}

  // TODO
  createHonoController() {}
  createHonoRouter() {}

  // TODO
  createService() {}

  useItems<T extends Object>(publicItems: T, privateItems?: any[]) {
    const meta = this.meta();

    for (const item of Object.values(publicItems)) {
      meta.items.add(item);
    }
    if (privateItems) {
      for (const item of privateItems) {
        meta.items.add(item);
      }
    }
    return publicItems;
  }

  onModuleInit(handler: LifecycleHandler) {
    const meta = this.meta();

    if (!meta.lifecycleHandlers[LifecycleHandlerType.init]) {
      meta.lifecycleHandlers[LifecycleHandlerType.init] = [];
    }
    meta.lifecycleHandlers[LifecycleHandlerType.init].push(handler);
  }

  onModuleDestroy(handler: LifecycleHandler) {
    const meta = this.meta();

    if (!meta.lifecycleHandlers[LifecycleHandlerType.destroy]) {
      meta.lifecycleHandlers[LifecycleHandlerType.destroy] = [];
    }
    meta.lifecycleHandlers[LifecycleHandlerType.destroy].push(handler);
  }
}
