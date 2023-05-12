/**
 * Wraps an underlying Promise{T}, exposing the resolve and reject delegates as methods, allowing for it to be awaited, resolved, or rejected externally.
 */
export class PromiseCompletionSource<T> {
	/**
	 * The underlying promise that this instance is managing.
	 */
	private readonly _promise: Promise<T>;

	/**
	 * Delegate used to resolve the promise.
	 */
	private _resolve?: (value: T | PromiseLike<T>) => void;

	/**
	 * Delegate used to reject the promise.
	 */
	private _reject?: (reason?: unknown) => void;

	/**
	 * Wraps an underlying Promise{T}, exposing the resolve and reject delegates as methods, allowing for it to be awaited, resolved, or rejected externally.
	 */
	constructor() {
		this._promise = new Promise<T>((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	}

	/**
	 * Gets the underlying promise being managed by this instance.
	 * @returns The promise.
	 */
	public get promise(): Promise<T> {
		return this._promise;
	}

	/**
	 * Sets the result of the underlying promise, allowing any awaited calls to continue invocation.
	 * @param value The value to resolve the promise with.
	 */
	public setResult(value: T | PromiseLike<T>): void {
		if (this._resolve) {
			this._resolve(value);
		}
	}

	/**
	 * Rejects the promise, causing any awaited calls to throw.
	 * @param reason The reason for rejecting the promise.
	 */
	public setException(reason?: unknown): void {
		if (this._reject) {
			this._reject(reason);
		}
	}
}
