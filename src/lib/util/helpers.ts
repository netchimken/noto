export type ArrayType<T> = T extends (infer U)[] ? U : never;

// ref: https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function concatArr<T extends unknown>(...items: (T | undefined | null)[]): T[] {
  const out: T[] = [];
  for (const item of items)
    if (item) out.push(item);

  return out;
}