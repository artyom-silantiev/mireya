type BigIntToString<T> = T extends BigInt
  ? string
  : T extends object
    ? PropertiesBigIntToString<T>
    : T;

type PropertiesBigIntToString<T> = {
  [K in keyof T]: BigIntToString<T[K]>;
};

type ObjK<T> = {
  [K in keyof T]: any;
};

export function serializeBigIntInObject<T extends ObjK<T>>(obj: T) {
  for (const key in obj) {
    if (typeof obj[key] === 'bigint') {
      obj[key] = obj[key].toString();
    } else if (typeof obj[key] === 'object') {
      const tmp = serializeBigIntInObject(obj[key]);
      (obj[key] as any) = tmp;
    }
  }

  const tmpObj = obj as PropertiesBigIntToString<T>;
  return tmpObj;
}
