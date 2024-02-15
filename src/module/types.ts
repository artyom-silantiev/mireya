import type { moduleSetupCtx } from './internal';

export enum LifecycleHandlerType {
  init = 'init',
  destroy = 'destroy',
}
export type LifecycleHandler = () => Promise<void> | void;
export type ModuleMeta = {
  items: any[];
  lifecycleHandlers: {
    [type: string]: LifecycleHandler[];
  };
};
export type ModuleWrap<T> = {
  id: number;
  meta: ModuleMeta;
  module: T;
};

export type ModuleSetupCtx = ReturnType<typeof moduleSetupCtx>;
export type ModuleSetup<T> = (ctx: ModuleSetupCtx) => T;
