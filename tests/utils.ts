/**
 * Utility type for asserting {@template T} is `true`; used to test types.
 */
export type Expect<T extends true> = T;

/**
 * Utility type for prettifying a intersection / union type to a flat structure.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Prettify<T> = { [k in keyof T]: T[k] extends object ? Prettify<T[k]> : T[k] } & {};

/**
 * Utility type that returns `true` when {@template T} and {@template U} are equal.
 */
export type TypesAreEqual<T, U> = (<G>() => G extends Prettify<T> ? 1 : 2) extends <G>() => G extends Prettify<U> ? 1 : 2 ? true : false;
