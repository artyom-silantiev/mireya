import { internalDefineModule, appModules } from '../module/internal';
import { listenExit } from './internal';
import type { AppModuleSetup } from './types';

export * from './types';

export function defineApp<T>(appSetup: AppModuleSetup<T>) {
  const appModule = internalDefineModule(appSetup, true);

  async function run() {
    listenExit();

    for (const moduleWrap of appModules) {
      for (const moduleItem of moduleWrap.meta.items) {
        if (
          typeof moduleItem === 'object' &&
          typeof moduleItem.onModuleInit === 'function'
        ) {
          await moduleItem.onModuleInit();
        }

        // TODO Work with metadata
      }
    }

    for (const moduleWrap of appModules) {
      if (moduleWrap.meta.initHandler) {
        await moduleWrap.meta.initHandler();
      }
    }
  }

  return {
    module: appModule,
    run,
  };
}
