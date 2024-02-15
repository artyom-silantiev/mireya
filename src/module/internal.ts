import { Metadata } from '../lib';
import {
  type ModuleMeta,
  type LifecycleHandler,
  type ModuleSetupCtx,
  type ModuleSetup,
  LifecycleHandlerType,
} from './types';

export const modulesMeta = new Metadata();
export const appModules = [] as unknown[];
export function pushAppModule<T>(moduleBody: T) {
  appModules.push(moduleBody);
}

export function moduleSetupCtx(meta: ModuleMeta, isAppModule = false) {
  return {
    useItems<T extends Object>(publicItems: T, privateItems?: any[]) {
      for (const item of Object.values(publicItems)) {
        meta.items.push(item);
      }
      if (privateItems) {
        for (const item of privateItems) {
          meta.items.push(item);
        }
      }
      return publicItems;
    },

    // TODO
    useModule() {},
    useModules() {},

    // TODO
    createService() {},

    // TODO
    createHonoController() {},
    createHonoRouter() {},

    // TODO
    createGRPCService() {},

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

let modulesCount = 0;
export function internalDefineModule<T>(
  setup: ModuleSetup<T>,
  isAppModule: boolean,
) {
  const moduleId = modulesCount++;
  const meta = {
    id: moduleId,
    usedModules: [],
    items: [] as any[],
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
