type PrismaDataToJson<T> = T extends BigInt
  ? string
  : T extends Date
    ? string
    : T extends object
      ? PropertiesPrismaDataToJson<T>
      : T;

type PropertiesPrismaDataToJson<T> = {
  [K in keyof T]: PrismaDataToJson<T[K]>;
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
  return obj as PropertiesPrismaDataToJson<T>;
}
