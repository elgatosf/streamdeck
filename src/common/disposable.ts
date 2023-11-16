import { TypedEventEmitter } from "./typed-event-emitter";

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
 * Creates a typed-function capable of adding an event listener to an emitter, and removing the same listener as part of a disposable object.
 * @returns The disposable-listener function, strongly-typed.
 */
export function disposableListenerFactory<TEventEmitter extends TypedEventEmitter<TMap>, TMap>() {
	return function <TEventName extends keyof TMap, TData extends TMap[TEventName]>(
		eventEmitter: TEventEmitter,
		eventName: TEventName,
		listener: (data: TData) => void
	): IDisposable {
		eventEmitter.addListener(eventName, listener);
		return deferredDisposable(() => eventEmitter.removeListener(eventName, listener));
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
