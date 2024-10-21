import { PromiseCompletionSource } from "./promises";

/**
 * Creates a wrapper around the specified `fn`, debouncing calls within the `delay`, to prevent multiple calls.
 * @param fn Function to debounce.
 * @param delay Delay before invoking the function.
 * @returns Function that debounces calls.
 */
export function debounce<T extends unknown[]>(
	fn: (...args: T) => Promise<void> | void,
	delay: number,
): (...args: T) => Promise<void> {
	let handle: number | undefined;
	let resolver: PromiseCompletionSource<void> | undefined;

	return (...args: T): Promise<void> => {
		clearTimeout(handle);

		resolver ??= new PromiseCompletionSource();
		handle = setTimeout(
			async () => {
				const innerResolver = resolver;
				resolver = undefined;

				await fn(...args);
				innerResolver?.setResult();
			},
			delay,
			args,
		);

		return resolver.promise;
	};
}

/**
 * Prevents the modification of existing property attributes and values on the value, and all of its child properties, and prevents the addition of new properties.
 * @param value Value to freeze.
 */
export function freeze<T>(value: T): void {
	if (value !== undefined && value !== null && typeof value === "object" && !Object.isFrozen(value)) {
		Object.freeze(value);
		Object.values(value).forEach(freeze);
	}
}

/**
 * Gets the value at the specified {@link path}.
 * @param path Path to the property to get.
 * @param source Source object that is being read from.
 * @returns Value of the property.
 */
export function get(path: string, source: unknown): unknown {
	const props: string[] = path.split(".");
	return props.reduce((obj, prop) => obj && obj[prop as keyof object], source);
}

/**
 * Sets the specified `value` on the `target` object at the desired property `path`.
 * @param path The path to the property to set.
 * @param target The target object that is being written to.
 * @param value The value to write.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function set(path: string, target: any, value: unknown): void {
	const props = path.split(".");
	props.reduce((obj, prop, i) => {
		return i === props.length - 1 ? (obj[prop] = value) : obj[prop] || (obj[prop] = {});
	}, target);
}

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
