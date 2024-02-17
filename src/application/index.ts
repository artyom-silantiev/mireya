import { Module } from '../module';
import { appModules, injectedServices, modulesMeta } from '../module/internal';
import { LifecycleHandlerType } from '../module/types';
import { listenExit } from './internal';

export type * from './types';

export class Application extends Module {
  constructor() {
    super();
  }

  private isRunning = false;
  async run() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    listenExit();

    for (const injectableInstanse of injectedServices.values() as IterableIterator<any>) {
      if (
        typeof injectableInstanse === 'object' &&
        typeof injectableInstanse.onModuleInit === 'function'
      ) {
        await injectableInstanse.onModuleInit();
      }
    }

    for (const module of appModules) {
      const moduleMeta = modulesMeta.get(module);

      if (!moduleMeta) {
        continue;
      }

      if (moduleMeta.lifecycleHandlers) {
        for (const lifecycleHandler of moduleMeta.lifecycleHandlers[
          LifecycleHandlerType.init
        ]) {
          await lifecycleHandler();
        }
      }
    }
  }
}
