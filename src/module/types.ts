import type { Module } from '.';

export type ModuleMeta = {
  id: number;
  module: Module;
  lifecycleHandlers: {
    [type: string]: LifecycleHandler[];
  };
};

export enum LifecycleHandlerType {
  init = 'init',
  destroy = 'destroy',
}
export type LifecycleHandler = () => Promise<void> | void;
