import { type ServiceMeta } from './types';
import { servicesMeta } from './internal';

// Service decorator
export function Service() {
  return function (target: any) {
    servicesMeta.merge(target, {} as ServiceMeta);
  };
}
