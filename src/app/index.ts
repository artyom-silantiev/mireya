import { __defineModule } from '../module/internal';
import type { AppModuleSetup } from './types';

export * from './types';

export function defineApp<T>(appSetup: AppModuleSetup<T>) {
  return __defineModule(appSetup, true);
}