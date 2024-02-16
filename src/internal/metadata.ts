import { mergeDeep } from './utils';

export class Metadata {
  private METADATA = new Map<any, any>();

  private parseArgsWithValue(args: any[]) {
    if (args.length < 2) {
      throw new Error('args length below 2');
    }
    return {
      value: args.pop(),
      keysSet: args,
    };
  }

  get metadata() {
    return this.METADATA;
  }

  set(...args: any[]) {
    const { keysSet, value } = this.parseArgsWithValue(args);
    let map = this.METADATA;

    for (let i = 0; i < keysSet.length; i++) {
      const key = args[i];

      if (i === keysSet.length - 1) {
        map.set(key, value);
        return value;
      } else {
        if (!map.has(key)) {
          const newMap = new Map();
          map.set(key, newMap);
          map = newMap;
        } else {
          map = map.get(key);
        }
      }
    }
  }

  merge(...args: any[]) {
    let { keysSet, value } = this.parseArgsWithValue(args);
    let map = this.METADATA;

    for (let i = 0; i < keysSet.length; i++) {
      const key = keysSet[i];

      if (i === keysSet.length - 1) {
        const orgValue = map.get(key) || null;

        if (!orgValue) {
          map.set(key, value);
        } else {
          value = mergeDeep(orgValue, value);
          map.set(key, value);
        }

        map.set(key, value);

        return value;
      } else {
        if (!map.has(key)) {
          const newMap = new Map();
          map.set(key, newMap);
          map = newMap;
        } else {
          map = map.get(key);
        }
      }
    }
  }

  has(...keysSet: any[]): boolean {
    let map = this.METADATA;

    for (let i = 0; i < keysSet.length; i++) {
      const key = keysSet[i];

      if (i === keysSet.length - 1) {
        return map.has(key);
      } else {
        if (map.has(key)) {
          map = map.get(key);
        } else {
          return false;
        }
      }
    }

    return false;
  }

  get(...keysSet: any[]) {
    let metadata = this.METADATA;

    for (let i = 0; i < keysSet.length; i++) {
      const key = keysSet[i];

      if (i === keysSet.length - 1) {
        return metadata.get(key) || null;
      } else {
        if (metadata.has(key)) {
          metadata = metadata.get(key);
        } else {
          return null;
        }
      }
    }
  }
}
