/**
 * An object that contains a promise, and its resolve and reject functions.
 */
export type PromiseResolvers<T> = {
	/**
	 * The promise.
	 */
	promise: Promise<T>;

	/**
	 * Resolves the promise.
	 * @param value Resolved value.
	 */
	resolve(value: PromiseLike<T> | T): void;

	/**
	 * Rejects the promise.
	 * @param reason Rejection reason.
	 */
	reject(reason?: unknown): void;
};

/**
 * Returns an object that contains a promise and two functions to resolve or reject it.
 * @returns The promise, and the resolve and reject functions.
 */
export function withResolvers<T = void>(): PromiseResolvers<T> {
	let resolve!: (value: PromiseLike<T> | T) => void;
	let reject!: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}
