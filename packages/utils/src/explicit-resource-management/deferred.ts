import type { IDisposable } from "./disposable.js";

/**
 * Creates a {@link IDisposable} that defers the disposing to the {@link dispose} function; disposing is guarded so that it may only occur once.
 * @param dispose Function responsible for disposing.
 * @returns Disposable whereby the disposing is delegated to the {@link dispose}  function.
 */
export function deferredDisposable(dispose: () => void): IDisposable {
	let isDisposed = false;
	const guardedDispose = (): void => {
		if (!isDisposed) {
			dispose();
			isDisposed = true;
		}
	};

	return {
		[Symbol.dispose]: guardedDispose,
		dispose: guardedDispose,
	};
}
