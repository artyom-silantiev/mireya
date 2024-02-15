import type { moduleSetupCtx } from './internal';

export type LifecycleHandler = () => Promise<void> | void;
export type ModuleMeta = {
  items: any[];
  initHandler: LifecycleHandler | null;
  destroyHandler: LifecycleHandler | null;
};
export type ModuleWrap<T> = {
  id: number;
  meta: ModuleMeta;
  module: T;
};

export type ModuleSetupCtx = ReturnType<typeof moduleSetupCtx>;
export type ModuleSetup<T> = (ctx: ModuleSetupCtx) => T;
