export type ArrayType<T> = T extends (infer U)[] ? U : never;

// ref: https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function concatArr<T extends unknown>(...items: (T | undefined | null)[]): T[] {
  const out: T[] = [];
  for (const item of items)
    if (item) out.push(item);

  return out;
}

// A LOT of help from:
// - https://stackoverflow.com/a/57837897
// - https://stackoverflow.com/a/65503371
type PathToStringArray<T extends string> = T extends `${infer Head}.${infer Tail}` ? [...PathToStringArray<Head>, ...PathToStringArray<Tail>] : [T]

export type Shift<T extends any[]> = ((...t: T) => any) extends ((
  first: any,
  ...rest: infer Rest
) => any)
  ? Rest
  : never;

type ShiftUnion<T> = T extends any[] ? Shift<T> : never;

type DeepOptional<T, P extends string[]> = T extends object
  ? (Omit<T, Extract<keyof T, P[0]>> &
    Partial<
      {
        [K in Extract<keyof T, P[0]>]: NonNullable<
          DeepRequired<T[K], ShiftUnion<P>>
        >
      }
    >)
  : T;

type DeepRequired<T, P extends string[]> = T extends object
  ? (Omit<T, Extract<keyof T, P[0]>> &
    Required<
      {
        [K in Extract<keyof T, P[0]>]: NonNullable<
          DeepRequired<T[K], ShiftUnion<P>>
        >
      }
    >)
  : T;

// ref: https://stackoverflow.com/a/77978572
type FixArr<T> = T extends readonly any[] ? Omit<T, Exclude<keyof any[], number>> : T;

type _DeepKeys<T> = T extends object ? (
  { [K in (string | number) & keyof T]:
    `${(
      `.${K}` | (`${K}` extends `${number}` ? `[${K}]` : never)
    )}${"" | _DeepKeys<FixArr<T[K]>>}` }[
  (string | number) & keyof T]
) : never

type DropInitDot<T> = T extends `.${infer U}` ? U : T;

type DeepKeys<T> = DropInitDot<_DeepKeys<FixArr<T>>>

export type Needy<T, P extends DeepKeys<T>> = DeepRequired<T, PathToStringArray<P>>
export type Lazy<T, P extends DeepKeys<T>> = DeepOptional<T, PathToStringArray<P>>

// export type Needy<T, K extends keyof T> = T & Required<Pick<T, K>>;