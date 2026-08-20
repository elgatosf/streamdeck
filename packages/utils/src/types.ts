/**
 * Utility type that asserts a string contains only alphabetical characters and is not empty.
 * {@link https://stackoverflow.com/a/74211628/259656 Credit}
 */
export type Alphabetical<T extends string> = Az<T> extends `` ? never : T;

/**
 * Utility type that asserts a string contains only alphabetical characters.
 * {@link https://stackoverflow.com/a/74211628/259656 Credit}
 */
type Az<T extends string, A extends string = ""> = T extends `${infer F}${infer R}`
	? Az<R, `${A}${Uppercase<F> extends Lowercase<F> ? never : F}`>
	: A;

/**
 * Utility type that acts as an alternate for `type[key]`. This type provides better support for aliasing
 * types when parsing them using the abstract syntax tree, used when generating documentation.
 */
export type KeyOf<T, K extends keyof T> = Omit<T[K], "">;

/**
 * Defines a type that implements a constructor that accepts an array of `any` parameters; utilized for mixins.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T;
