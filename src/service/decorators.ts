import { InjectableItemType, type InjectableItemMeta } from '../internal/types';
import { injectableItems } from '../module/internal';

// Service decorator
export function Service() {
  return function (target: any) {
    injectableItems.merge(target, {
      types: new Set([InjectableItemType.Service]),
    } as InjectableItemMeta);
  };
}
