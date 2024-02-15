import { LifecycleHandlerType } from '../module';
import {
  internalDefineModule,
  appModules,
  modulesMeta,
} from '../module/internal';
import { listenExit } from './internal';
import type { AppModuleSetup } from './types';

export * from './types';

export function defineApp<T>(appSetup: AppModuleSetup<T>) {
  const appModule = internalDefineModule(appSetup, true);

  async function run() {
    listenExit();

    for (const module of appModules) {
      const moduleMeta = modulesMeta.get(module);

      console.log(moduleMeta);

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

  return {
    module: appModule,
    run,
  };
}
