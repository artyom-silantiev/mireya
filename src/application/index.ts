import { Module } from '../module';
import { appModules, modulesMeta } from '../module/internal';
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

    for (const module of appModules) {
      const moduleMeta = modulesMeta.get(module);

      for (const moduleItem of moduleMeta.items) {
        if (
          typeof moduleItem === 'object' &&
          typeof moduleItem.onModuleInit === 'function'
        ) {
          await moduleItem.onModuleInit();
        }

        // TODO Work with metadata
      }
    }

    for (const module of appModules) {
      const moduleMeta = modulesMeta.get(module);

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
