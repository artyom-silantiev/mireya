import type {
  ModuleMeta,
  ModuleWrap,
  LifecycleHandler,
  ModuleSetupCtx,
  ModuleSetup,
} from './types';

export const modules = [] as ModuleWrap<unknown>[];
export function pushModule<T>(moduleWrap: ModuleWrap<T>) {
  modules.push(moduleWrap);
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
    onModuleInit(handler: LifecycleHandler) {
      meta.initHandler = handler;
    },
    onModuleDestroy(handler: LifecycleHandler) {
      meta.destroyHandler = handler;
    },
  };
}

let modulesCount = 0;
export function __defineModule<T>(setup: ModuleSetup<T>, isAppModule: boolean) {
  const moduleId = modulesCount++;
  const meta = {
    items: [] as any[],
    initHandler: null as null | { (): Promise<void> },
    destroyHandler: null as null | { (): Promise<void> },
  } as ModuleMeta;

  let moduleCtx!: ModuleSetupCtx;
  if (isAppModule) {
    moduleCtx = moduleSetupCtx(meta, true);
  } else {
    moduleCtx = moduleSetupCtx(meta);
  }

  const moduleWrap = {
    id: moduleId,
    meta,
    module: setup(moduleCtx as any),
  } as ModuleWrap<T>;

  pushModule(moduleWrap);

  return moduleWrap.module;
}
