type BigIntToString<T> = T extends BigInt
  ? string
  : T extends object
    ? PropertiesBigIntToString<T>
    : T;

type PropertiesBigIntToString<T> = {
  [K in keyof T]: BigIntToString<T[K]>;
};

export function serializePrismaDataForJson<
  T extends {
    [K in keyof T]: any;
  },
>(obj: T) {
  for (const key in obj) {
    if (typeof obj[key] === 'bigint') {
      obj[key] = obj[key].toString();
    } else if (typeof obj[key] === 'object') {
      (obj[key] as any) = serializePrismaDataForJson(obj[key]);
    }
  }
  return obj as PropertiesBigIntToString<T>;
}
