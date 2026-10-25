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
	private readonly events = new Map<EventsOf<TMap>, EventListener[]>();

	/**
	 * Tracks whether registered listeners have been removed, and a cleanup is required.
	 */
	#needsCleanup = new Set<EventsOf<TMap>>();

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
		this.#add(eventName, listener, options, (listeners, newListener) => listeners.push(newListener));
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
		const newListener = this.#add(eventName, listener, options, (listeners, newListener) =>
			listeners.push(newListener),
		);

		return deferredDisposable(() => newListener?.remove());
	}

	/**
	 * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
	 * @param eventName Name of the event.
	 * @param args Arguments supplied to each event listener.
	 * @returns `true` when there was a listener associated with the event; otherwise `false`.
	 */
	public emit<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
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
		const listeners = this.events.get(eventName) ?? [];
		return listeners.filter((ev) => !ev.disposed && (listener === undefined || ev.invoke === listener)).length;
	}

	/**
	 * Gets the event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns The event listeners.
	 */
	public listeners<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
	): ((...args: TArgs) => void)[] {
		return (this.events.get(eventName) ?? []).filter(({ disposed }) => !disposed).map(({ invoke }) => invoke);
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
		return this.addListener(eventName, listener, { ...options, once: true });
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
		this.#add(eventName, listener, options, (listeners, newListener) => listeners.unshift(newListener));
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
		return this.prependListener(eventName, listener, { ...options, once: true });
	}

	/**
	 * Removes all event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns This instance with the event listeners removed
	 */
	public removeAllListeners<TEventName extends EventsOf<TMap>>(eventName: TEventName): this {
		const listeners = this.events.get(eventName);
		if (!listeners || listeners.length === 0) {
			return this;
		}

		// Iterate over a snapshot, as "removeListener" handlers may mutate the listeners.
		for (const curr of [...listeners]) {
			curr.dispose();
		}

		this.#cleanup(eventName);
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
		const listeners = this.events.get(eventName);
		if (!listeners || listeners.length === 0) {
			return this;
		}

		// Iterate over a snapshot, as "removeListener" handlers may mutate the listeners.
		for (const curr of [...listeners]) {
			if (curr.invoke === listener) {
				curr.dispose();
			}
		}

		this.#cleanup(eventName);
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
	 * @param addTo Function that inserts the new listener into the event's listeners, for example appending or prepending.
	 * @returns The registered listener; otherwise `undefined` when {@link EventListenerOptions.signal} is, or becomes, aborted
	 * before registration.
	 */
	#add<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions,
		addTo: (listeners: EventListener[], newListener: EventListener) => void,
	): EventListener | undefined {
		// When the signal is already aborted, do nothing.
		if (options.signal?.aborted) {
			return;
		}

		// Notify meta-event handlers before registering, so a throwing handler leaves no partial state.
		if (eventName !== "newListener") {
			this.#emit("newListener", [eventName, listener]);
		}

		// The signal may have been aborted by a "newListener" handler.
		if (options.signal?.aborted) {
			return;
		}

		// Construct the new listener.
		const newListener: EventListener = {
			...options,
			disposed: false,
			invoke: listener,
			dispose: (): void => {
				if (newListener.disposed) {
					return;
				}

				// Flag before notifying, so re-entrant emits and disposals see the listener as removed.
				newListener.disposed = true;

				if (newListener.signal) {
					newListener.signal.removeEventListener("abort", newListener.remove);
				}

				if (eventName !== "removeListener" && newListener.signal?.aborted !== true) {
					this.#emit("removeListener", [eventName, newListener.invoke]);
				}

				this.#needsCleanup.add(eventName);
			},
			remove: (): void => {
				newListener.dispose();
				this.#cleanup(eventName);
			},
		};

		// Register the abort listener.
		if (options.signal) {
			options.signal.addEventListener("abort", newListener.remove, { once: true });
		}

		// Get the current listeners, or create an empty array and save them.
		let listeners = this.events.get(eventName);
		if (listeners === undefined) {
			listeners = [];
			this.events.set(eventName, listeners);
		}

		addTo(listeners, newListener);
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
		if (!this.#needsCleanup.has(eventName)) {
			return;
		}

		this.#needsCleanup.delete(eventName);
		const listeners = this.events.get(eventName);
		if (!listeners) {
			return;
		}

		// Compact in place, preserving order, to avoid the per-item cost of splicing.
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
	 * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
	 * @param eventName Name of the event, including built-in events.
	 * @param args Arguments supplied to each event listener.
	 * @returns `true` when there was a listener associated with the event; otherwise `false`.
	 */
	#emit(eventName: EventsOf<TMap>, args: readonly unknown[]): boolean {
		const listeners = this.events.get(eventName);
		if (listeners === undefined) {
			return false;
		}

		// Iterate over a snapshot so listeners added or removed during emission do not affect this emission.
		for (const listener of [...listeners]) {
			if (listener.disposed) {
				continue;
			}

			if (listener.once) {
				listener.dispose();
			}

			listener.invoke(...args);
		}

		this.#cleanup(eventName);
		return true;
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
 * An event listener associated with an event.
 */
interface EventListener extends EventListenerOptions {
	/**
	 * Indicates whether the event listener has been disposed.
	 */
	disposed: boolean;

	/**
	 * Disposes of the event listener, flagging it for removal.
	 */
	dispose: () => void;

	/**
	 * Disposes and removes the event listener.
	 */
	remove: () => void;

	/**
	 * Callback function called when the event is fired.
	 * @param args Arguments supplied to the event listener when the event is emitted.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	invoke: (...args: any) => void;
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
