import { Metadata } from '../lib';
import {
  type ModuleMeta,
  type LifecycleHandler,
  type ModuleSetupCtx,
  type ModuleSetup,
  LifecycleHandlerType,
} from './types';

export const injectableItems = new Metadata();
export const modulesMeta = new Metadata();
export const appModules = [] as unknown[];
export function pushAppModule<T>(moduleBody: T) {
  appModules.push(moduleBody);
}

export function moduleSetupCtxBase(meta: ModuleMeta) {
  return {
    // TODO
    useModule() {},
    useModules() {},

    useItems<T extends Object>(publicItems: T, privateItems?: any[]) {
      for (const item of Object.values(publicItems)) {
        meta.items.add(item);
      }
      if (privateItems) {
        for (const item of privateItems) {
          meta.items.add(item);
        }
      }
      return publicItems;
    },

    onModuleInit(handler: LifecycleHandler) {
      if (!meta.lifecycleHandlers[LifecycleHandlerType.init]) {
        meta.lifecycleHandlers[LifecycleHandlerType.init] = [];
      }
      meta.lifecycleHandlers[LifecycleHandlerType.init].push(handler);
    },
    onModuleDestroy(handler: LifecycleHandler) {
      if (!meta.lifecycleHandlers[LifecycleHandlerType.destroy]) {
        meta.lifecycleHandlers[LifecycleHandlerType.destroy] = [];
      }
      meta.lifecycleHandlers[LifecycleHandlerType.destroy].push(handler);
    },
  };
}

export function moduleSetupCtxHono(meta: ModuleMeta) {
  return {
    // TODO
    createHonoController() {},
    createHonoRouter() {},
  };
}

export function moduleSetupCtxService(meta: ModuleMeta) {
  return {
    // TODO
    createService() {},
  };
}

export function moduleSetupCtx(meta: ModuleMeta, isAppModule = false) {
  return {
    ...moduleSetupCtxBase(meta),
    ...moduleSetupCtxHono(meta),
    ...moduleSetupCtxService(meta),
  };
}

let modulesCount = 0;
export function internalDefineModule<T>(
  setup: ModuleSetup<T>,
  isAppModule: boolean,
) {
  const moduleId = modulesCount++;
  const meta = {
    id: moduleId,
    usedModules: new Set(),
    items: new Set(),
    lifecycleHandlers: {},
  } as ModuleMeta;

  let moduleCtx!: ModuleSetupCtx;
  if (isAppModule) {
    moduleCtx = moduleSetupCtx(meta, true);
  } else {
    moduleCtx = moduleSetupCtx(meta);
  }
  const moduleBody = setup(moduleCtx as any);

  pushAppModule(moduleBody);
  modulesMeta.set(moduleBody, meta);

  return moduleBody;
}
