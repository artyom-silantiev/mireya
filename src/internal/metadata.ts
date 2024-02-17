import { mergeDeep } from './utils';

export class Metadata<K, V> extends Map<K, V> {
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
  }

  merge(key: K, value: V) {
    const orgVal = this.get(key);
    if (!orgVal) {
      return this.set(key, value);
    } else {
      value = mergeDeep(orgVal, value);
      return this.set(key, value);
    }
  }
}
