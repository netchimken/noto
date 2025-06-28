export type ArrayType<T> = T extends (infer U)[] ? U : never;

export function concatArr<T extends unknown>(...items: (T | undefined | null)[]): T[] {
  const out: T[] = [];
  for (const item of items)
    if (item) out.push(item);

  return out;
}