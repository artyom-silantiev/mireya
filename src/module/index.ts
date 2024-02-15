import { internalDefineModule } from './internal';
import type { ModuleSetup } from './types';

export * from './types';

export function defineModule<T>(moduleSetup: ModuleSetup<T>) {
  return internalDefineModule(moduleSetup, false);
}
