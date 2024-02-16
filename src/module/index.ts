import { internalDefineModule } from './internal';
import type { ModuleSetup } from './types';

export type { LifecycleHandler, ModuleSetupCtx, ModuleSetup } from './types';

export function defineModule<T>(moduleSetup: ModuleSetup<T>) {
  return internalDefineModule(moduleSetup, false);
}
