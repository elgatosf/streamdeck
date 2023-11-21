// Polyfill, explicit resource management https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Symbol as any).dispose ??= Symbol("Symbol.dispose");

/**
 * Creates a {@link IDisposable} that defers the disposing to the {@link dispose} function; disposing is guarded so that it may only occur once.
 * @param dispose Function responsible for disposing.
 * @returns Disposable whereby the disposing is delegated to the {@link dispose}  function.
 */
export function deferredDisposable(dispose: (...args: unknown[]) => void): IDisposable {
	let isDisposed = false;
	const guardedDispose = (): void => {
		if (!isDisposed) {
			dispose();
			isDisposed = true;
		}
	};

	return {
		[Symbol.dispose]: guardedDispose,
		dispose: guardedDispose
	};
}

/**
 * An extension of the upcoming explicit resource management disposable that defines a `dispose()` member.
 */
export interface IDisposable {
	/**
	 * Disposes this instance.
	 */
	[Symbol.dispose](): void;

	/**
	 * Disposes this instance.
	 */
	dispose(): void;
}
