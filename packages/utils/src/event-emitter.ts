import { deferredDisposable } from "./explicit-resource-management/deferred.js";
import type { IDisposable } from "./explicit-resource-management/disposable.js";

/**
 * An event emitter that enables the listening for, and emitting of, events.
 */
export class EventEmitter<TMap extends EventMap<TMap>> {
	/**
	 * Underlying collection of events and their listeners.
	 */
	private readonly events = new Map<EventsOf<TMap>, EventListener[]>();

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
		options: EventListenerOptions = {},
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
		options: EventListenerOptions = {},
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
		const listeners = this.events.get(eventName);
		if (listeners === undefined || listener == undefined) {
			return listeners?.length || 0;
		}

		let count = 0;
		listeners.forEach((ev) => {
			if (ev.invoke === listener) {
				count++;
			}
		});

		return count;
	}

	/**
	 * Gets the event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns The event listeners.
	 */
	public listeners<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
	): ((...args: TArgs) => void)[] {
		return Array.from(this.events.get(eventName) || []).map(({ invoke }) => invoke);
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
		options: EventListenerOptions = {},
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
		options: EventListenerOptions = {},
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
		options: EventListenerOptions = {},
	): this {
		this.#add(eventName, listener, options, (listeners, newListener) => listeners.splice(0, 0, newListener));
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
		options: EventListenerOptions = {},
	): this {
		return this.prependListener(eventName, listener, { ...options, once: true });
	}

	/**
	 * Removes all event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns This instance with the event listeners removed
	 */
	public removeAllListeners<TEventName extends EventsOf<TMap>>(eventName: TEventName): this {
		const listeners = this.events.get(eventName) ?? [];
		while (listeners.length > 0) {
			this.#remove(eventName, listeners, 0);
		}

		this.#deleteWhenEmpty(eventName);
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
		const listeners = this.events.get(eventName) ?? [];
		for (let i = listeners.length - 1; i >= 0; i--) {
			if (listeners[i]?.invoke === listener) {
				this.#remove(eventName, listeners, i);
			}
		}

		this.#deleteWhenEmpty(eventName);
		return this;
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event listener.
	 * @param options Event listener options.
	 * @param addTo Function responsible for adding the new Event listener function.
	 * @returns This instance with event {@link listener} added.
	 */
	#add<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		options: EventListenerOptions,
		addTo: (listeners: EventListener[], newListener: EventListener) => void,
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

		// Construct the new listener.
		const newListener: EventListener = {
			invoke: listener,
			...options,
			remove: (): void => {
				const listeners = this.events.get(eventName);
				if (!listeners) {
					return;
				}

				const index = listeners.indexOf(newListener);
				if (index > -1) {
					this.#remove(eventName, listeners, index);
				}

				this.#deleteWhenEmpty(eventName);
			},
		};

		// Register the abort listener.
		if (signal) {
			signal.addEventListener("abort", newListener.remove, { once: true });
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
	 * Deletes the set of event listeners when no listeners are associated with it.
	 * @param eventName Name of the event.
	 */
	#deleteWhenEmpty(eventName: EventsOf<TMap>): void {
		if (this.events.get(eventName)?.length === 0) {
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

		for (let i = 0; i < listeners.length;) {
			const { invoke, once } = listeners[i] ?? {};
			if (!invoke) {
				i++;
				continue;
			}

			if (once) {
				this.#remove(eventName, listeners, i);
			} else {
				i++;
			}

			invoke(...args);
		}

		this.#deleteWhenEmpty(eventName);
		return true;
	}

	/**
	 * Removes the listener at the given index.
	 * @param eventName Name of the event.
	 * @param listeners Listeners registered with the event.
	 * @param index Index of the listener to remove.
	 */
	#remove<TEventName extends EventsOf<TMap>>(eventName: TEventName, listeners: EventListener[], index: number): void {
		const [{ signal, remove, invoke } = {}] = listeners.splice(index, 1);
		if (invoke === undefined) {
			return;
		}

		if (signal && remove) {
			signal.removeEventListener("abort", remove);
		}

		if (eventName !== "removeListener" && signal?.aborted !== true) {
			this.#emit("removeListener", [eventName, invoke]);
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
 * An event listener associated with an event.
 */
interface EventListener extends EventListenerOptions {
	/**
	 * Callback function called when the event is fired.
	 * @param args Arguments supplied to the event listener when the event is emitted.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	invoke: (...args: any) => void;

	/**
	 * Removes the event listener.
	 *
	 * Retained so it can be unregistered from the signal when the listener is removed by other means (`off`, `once`,
	 * disposal); otherwise long-lived signals would accumulate callbacks that retain the emitter and listener.
	 */
	remove: () => void;
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
