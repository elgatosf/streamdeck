import { deferredDisposable } from "./explicit-resource-management/deferred.js";
import type { IDisposable } from "./explicit-resource-management/disposable.js";

const DEFAULT_OPTIONS: EventListenerOptions = Object.freeze({});

/**
 * An event emitter that enables the listening for, and emitting of, events.
 */
export class EventEmitter<TMap extends EventMap<TMap>> {
	/**
	 * Underlying collection of events and their listeners.
	 */
	private readonly events = new Map<EventsOf<TMap>, EventListenerCollection>();

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @returns This instance with the {@link listener} added.
	 */
	public addListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions = DEFAULT_OPTIONS,
	): this {
		this.#add(eventName, listener, options, false);
		return this;
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}, and returns a disposable capable of removing the event listener.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @returns A disposable that removes the listener when disposed.
	 */
	public disposableOn<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions = DEFAULT_OPTIONS,
	): IDisposable {
		const newListener = this.#add(eventName, listener, options, false);
		return deferredDisposable(() => {
			if (newListener) {
				this.#remove(eventName, newListener);
			}
		});
	}

	/**
	 * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
	 *
	 * Only events defined by the event map can be emitted; `newListener` and `removeListener` are emitted internally.
	 * @param eventName Name of the event.
	 * @param args Arguments supplied to each event listener.
	 * @returns `true` when there was a listener associated with the event; otherwise `false`.
	 */
	public emit<TEventName extends keyof TMap, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		...args: TArgs
	): boolean {
		return this.#emit(eventName, args);
	}

	/**
	 * Gets the event names with event listeners.
	 * @returns Event names.
	 */
	public eventNames(): EventsOf<TMap>[] {
		return Array.from(this.events.keys());
	}

	/**
	 * Gets the number of event listeners for the event named {@link eventName}. When a {@link listener} is defined, only matching event listeners are counted.
	 * @param eventName Name of the event.
	 * @param listener Optional event listener to count.
	 * @returns Number of event listeners.
	 */
	public listenerCount<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener?: (...args: TArgs) => void,
	): number {
		const listeners = this.events.get(eventName)?.listeners ?? [];
		return listeners.filter(({ disposed, invoke }) => !disposed && (listener === undefined || invoke === listener))
			.length;
	}

	/**
	 * Gets the event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns The event listeners.
	 */
	public listeners<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
	): ((...args: TArgs) => void)[] {
		return (this.events.get(eventName)?.listeners ?? [])
			.filter(({ disposed }) => !disposed)
			.map(({ invoke }) => invoke);
	}

	/**
	 * Removes all instances of the event {@link listener} registered with {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @returns This instance with the event {@link listener} removed.
	 */
	public off<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.removeListener(eventName, listener);
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @returns This instance with the event {@link listener} added.
	 */
	public on<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions = DEFAULT_OPTIONS,
	): this {
		return this.addListener(eventName, listener, options);
	}

	/**
	 * Adds the **one-time** event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @returns This instance with the event {@link listener} added.
	 */
	public once<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions = DEFAULT_OPTIONS,
	): this {
		this.#add(eventName, listener, { once: true, signal: options.signal }, false);
		return this;
	}

	/**
	 * Adds the event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @returns This instance with the event {@link listener} prepended.
	 */
	public prependListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions = DEFAULT_OPTIONS,
	): this {
		this.#add(eventName, listener, options, true);
		return this;
	}

	/**
	 * Adds the **one-time** event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @returns This instance with the event {@link listener} prepended.
	 */
	public prependOnceListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions = DEFAULT_OPTIONS,
	): this {
		this.#add(eventName, listener, { once: true, signal: options.signal }, true);
		return this;
	}

	/**
	 * Removes all event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns This instance with the event listeners removed
	 */
	public removeAllListeners<TEventName extends EventsOf<TMap>>(eventName: TEventName): this {
		const event = this.events.get(eventName);
		if (!event) {
			return this;
		}

		try {
			// Iterate over a snapshot, as "removeListener" handlers may mutate the listeners.
			for (const listener of [...event.listeners]) {
				this.#dispose(eventName, listener);
			}
		} finally {
			this.#cleanup(eventName);
		}

		return this;
	}

	/**
	 * Removes all matching event {@link listener} registered with {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @returns This instance with the event {@link listener} removed.
	 */
	public removeListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		const event = this.events.get(eventName);
		if (!event) {
			return this;
		}

		try {
			// Iterate over a snapshot, as "removeListener" handlers may mutate the listeners.
			for (const currListener of [...event.listeners]) {
				if (currListener.invoke === listener) {
					this.#dispose(eventName, currListener);
				}
			}
		} finally {
			this.#cleanup(eventName);
		}

		return this;
	}

	/**
	 * Registers the event {@link listener} for the event named {@link eventName}.
	 *
	 * Emits `newListener` before the listener is registered (unless {@link eventName} is `newListener`). When
	 * {@link EventListenerOptions.signal} is provided, the listener is removed when the signal is aborted.
	 * @param eventName Name of the event.
	 * @param listener Event listener function.
	 * @param options Event listener options.
	 * @param prepend Whether the listener is added to the beginning, rather than the end, of the event's listeners.
	 * @returns The registered listener; otherwise `undefined` when {@link EventListenerOptions.signal} is, or becomes, aborted
	 * before registration.
	 */
	#add(
		eventName: EventsOf<TMap>,
		listener: EventListener["invoke"],
		options: EventListenerOptions,
		prepend: boolean,
	): EventListener | undefined {
		// When the signal is already aborted, do nothing.
		const { signal } = options;
		if (signal?.aborted) {
			return;
		}

		// Notify meta-event handlers before registering, so a throwing handler leaves no partial state.
		if (eventName !== "newListener") {
			this.#emit("newListener", [eventName, listener]);
		}

		// The signal may have been aborted by a "newListener" handler.
		if (signal?.aborted) {
			return;
		}

		const newListener: EventListener = {
			disposed: false,
			invoke: listener,
			once: options.once,
			onAbort: undefined,
			signal,
		};

		// Only listeners with a signal require a closure, as the signal must be given a function to call.
		if (signal) {
			newListener.onAbort = (): void => this.#remove(eventName, newListener);
			signal.addEventListener("abort", newListener.onAbort, { once: true });
		}

		// Get the current entry, or create an empty one and save it.
		let event = this.events.get(eventName);
		if (event === undefined) {
			event = { listeners: [], needsCleanup: false };
			this.events.set(eventName, event);
		}

		if (prepend) {
			event.listeners.unshift(newListener);
		} else {
			event.listeners.push(newListener);
		}

		return newListener;
	}

	/**
	 * Removes disposed listeners from the event named {@link eventName}, and deletes the event when no listeners remain.
	 *
	 * Disposing of a listener only flags it; this performs the removal, and is called once an operation has finished
	 * disposing of listeners.
	 * @param eventName Name of the event.
	 */
	#cleanup(eventName: EventsOf<TMap>): void {
		const event = this.events.get(eventName);
		if (!event?.needsCleanup) {
			return;
		}

		event.needsCleanup = false;

		// Compact in place, preserving order, to avoid the per-item cost of splicing.
		const { listeners } = event;
		let write = 0;
		for (const listener of listeners) {
			if (!listener.disposed) {
				listeners[write++] = listener;
			}
		}

		listeners.length = write;
		if (write === 0) {
			this.events.delete(eventName);
		}
	}

	/**
	 * Disposes of the {@link listener}, flagging it, and the event named {@link eventName}, for cleanup.
	 *
	 * Unregisters the abort handler from the listener's signal, and emits `removeListener` unless the listener belongs to
	 * `removeListener`, or was removed by its signal being aborted.
	 * @param eventName Name of the event the listener is registered with.
	 * @param listener Listener to dispose of.
	 */
	#dispose(eventName: EventsOf<TMap>, listener: EventListener): void {
		if (listener.disposed) {
			return;
		}

		// Flag before notifying, so re-entrant emits and disposals see the listener as removed.
		listener.disposed = true;

		const event = this.events.get(eventName);
		if (event) {
			event.needsCleanup = true;
		}

		const { onAbort, signal } = listener;
		if (signal && onAbort) {
			signal.removeEventListener("abort", onAbort);
		}

		if (eventName !== "removeListener" && signal?.aborted !== true) {
			this.#emit("removeListener", [eventName, listener.invoke]);
		}
	}

	/**
	 * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
	 * @param eventName Name of the event, including built-in events.
	 * @param args Arguments supplied to each event listener.
	 * @returns `true` when there was a listener associated with the event; otherwise `false`.
	 */
	#emit(eventName: EventsOf<TMap>, args: readonly unknown[]): boolean {
		const event = this.events.get(eventName);
		if (event === undefined) {
			return false;
		}

		try {
			// Iterate over a snapshot so listeners added or removed during emission do not affect this emission.
			for (const listener of [...event.listeners]) {
				if (listener.disposed) {
					continue;
				}

				// An earlier "abort" handler may emit before this listener's own abort handler has run.
				if (listener.signal?.aborted) {
					this.#dispose(eventName, listener);
					continue;
				}

				if (listener.once) {
					this.#dispose(eventName, listener);
				}

				// Invoke unbound, so the callback cannot access the listener record via `this`.
				const { invoke } = listener;
				invoke(...args);
			}
		} finally {
			this.#cleanup(eventName);
		}

		return true;
	}

	/**
	 * Disposes of the {@link listener}, and immediately removes it from the event named {@link eventName}.
	 * @param eventName Name of the event the listener is registered with.
	 * @param listener Listener to remove.
	 */
	#remove(eventName: EventsOf<TMap>, listener: EventListener): void {
		try {
			this.#dispose(eventName, listener);
		} finally {
			this.#cleanup(eventName);
		}
	}
}

/**
 * Default events that all {@link EventEmitter} fire.
 */
type DefaultEvent = "newListener" | "removeListener";

/**
 * Map of events and their arguments, represented as a record of arrays.
 * @example
 * type UserServiceMap = {
 *     created: [id: number, userName: string];
 *     deleted: [id: number];
 * }
 */
type EventMap<T> = {
	[K in keyof T]: K extends string ? (T[K] extends unknown[] ? T[K] : never) : never;
};

/**
 * Events emitted by an {@link EventEmitter}.
 */
export type EventsOf<TEventMap extends EventMap<TEventMap>> = DefaultEvent | keyof TEventMap;

/**
 * Extracts the event arguments for an event from an event map.
 */
export type EventArgs<TMap extends EventMap<TMap>, TEventName extends EventsOf<TMap>> = TEventName extends keyof TMap
	? TMap[TEventName] extends unknown[]
		? TMap[TEventName]
		: never
	: TEventName extends "newListener"
		? NewListenerArgs<TMap>
		: TEventName extends "removeListener"
			? RemoveListenerArgs<TMap>
			: never;

/**
 * Arguments supplied to `newListener` listeners; emitted when any listener is added, other than to `newListener`.
 */
export type NewListenerArgs<TMap extends EventMap<TMap>> =
	| EventArgUnion<TMap>
	| ["removeListener", (...args: RemoveListenerArgs<TMap>) => void];

/**
 * Arguments supplied to `removeListener` listeners; emitted when any listener is removed, other than from `removeListener`.
 */
export type RemoveListenerArgs<TMap extends EventMap<TMap>> =
	| EventArgUnion<TMap>
	| ["newListener", (...args: NewListenerArgs<TMap>) => void];

/**
 * Converts an event map to a union of events and their listeners, represented as `[string, listener]`.
 */
export type EventArgUnion<TMap extends EventMap<TMap>> = {
	[TEventName in keyof TMap]: TMap[TEventName] extends unknown[]
		? [TEventName, (...args: TMap[TEventName]) => void]
		: never;
}[keyof TMap];

/**
 * Listeners registered with an event.
 */
interface EventListenerCollection {
	/**
	 * Listeners in the order they are invoked; may contain disposed listeners until the entry is cleaned up.
	 */
	listeners: EventListener[];

	/**
	 * Indicates whether listeners have been disposed, and must be removed by a cleanup.
	 */
	needsCleanup: boolean;
}

/**
 * An event listener associated with an event; a plain record with a fixed shape, without per-listener methods.
 */
interface EventListener extends EventListenerOptions {
	/**
	 * Indicates whether the event listener has been disposed.
	 */
	disposed: boolean;

	/**
	 * Callback function called when the event is fired.
	 * @param args Arguments supplied to the event listener when the event is emitted.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	invoke: (...args: any) => void;

	/**
	 * Abort handler registered with the `signal`; retained so it can be unregistered when the listener is disposed
	 * by other means, otherwise long-lived signals would accumulate callbacks that retain the emitter and listener.
	 */
	onAbort: (() => void) | undefined;
}

/**
 * Options associated with an event listener.
 */
export interface EventListenerOptions {
	/**
	 * Determines whether the event listener should be invoked only once.
	 */
	once?: boolean;

	/**
	 * Signal that, when aborted, removes the listener.
	 *
	 * If aborted, the `removeListener` event is suppressed.
	 */
	signal?: AbortSignal;
}
