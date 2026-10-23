/**
 * Polyfill for a DisposableStack, allow for deferred cleanup using a disposable.
 */
export class DisposableStack implements Disposable {
	/**
	 * Determines whether this instance has been disposed.
	 */
	public get disposed(): boolean {
		return this.#disposed;
	}

	/**
	 * Private backing field for the disposed state.
	 */
	#disposed = false;

	/**
	 * Deferred functions to run on disposal.
	 */
	#disposeDelegates: (() => void)[] = [];

	/**
	 * Disposes of this instance.
	 */
	public [Symbol.dispose](): void {
		this.dispose();
	}

	/**
	 * Defers the specified function to run on disposal of this instance.
	 * @param fn Function to run on disposal.
	 * @returns This instance.
	 */
	public defer(fn: () => void): this {
		this.#disposeDelegates.push(fn);
		return this;
	}

	/**
	 * Disposes of this instance.
	 */
	public dispose(): void {
		if (this.#disposed) {
			return;
		}

		this.#disposeDelegates.forEach((fn) => fn());
		this.#disposed = true;
	}
}
