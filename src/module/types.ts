import type { moduleSetupCtx } from './internal';

export type ModuleMeta = {
  id: number;
  usedModules: Set<ModuleMeta>;
  items: Set<any>;
  lifecycleHandlers: {
    [type: string]: LifecycleHandler[];
  };
};

export enum LifecycleHandlerType {
  init = 'init',
  destroy = 'destroy',
}
export type LifecycleHandler = () => Promise<void> | void;

export type ModuleSetupCtx = ReturnType<typeof moduleSetupCtx>;
export type ModuleSetup<T> = (ctx: ModuleSetupCtx) => T;
