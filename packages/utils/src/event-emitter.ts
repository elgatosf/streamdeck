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
	 * @param listener Event handler function.
	 * @returns This instance with the {@link listener} added.
	 */
	public addListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.#add(eventName, listener, (listeners) => listeners.push({ listener }));
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}, and returns a disposable capable of removing the event listener.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns A disposable that removes the listener when disposed.
	 */
	public disposableOn<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): IDisposable {
		this.#add(eventName, listener, (listeners) => listeners.push({ listener }));
		return deferredDisposable(() => this.removeListener(eventName, listener));
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
		const listeners = this.events.get(eventName);
		if (listeners === undefined) {
			return false;
		}

		for (let i = 0; i < listeners.length;) {
			const { listener, once } = listeners[i] ?? {};
			if (!listener) {
				i++;
				continue;
			}

			if (once) {
				this.#remove(eventName, listeners, i);
			} else {
				i++;
			}

			listener(...args);
		}

		return true;
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
			if (ev.listener === listener) {
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
		return Array.from(this.events.get(eventName) || []).map(({ listener }) => listener);
	}

	/**
	 * Removes the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} removed.
	 */
	public off<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		const listeners = this.events.get(eventName) ?? [];
		for (let i = listeners.length - 1; i >= 0; i--) {
			if (listeners[i]?.listener === listener) {
				this.#remove(eventName, listeners, i);
			}
		}

		return this;
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} added.
	 */
	public on<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.#add(eventName, listener, (listeners) => listeners.push({ listener }));
	}

	/**
	 * Adds the **one-time** event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} added.
	 */
	public once<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.#add(eventName, listener, (listeners) => listeners.push({ listener, once: true }));
	}

	/**
	 * Adds the event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} prepended.
	 */
	public prependListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.#add(eventName, listener, (listeners) => listeners.splice(0, 0, { listener }));
	}

	/**
	 * Adds the **one-time** event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} prepended.
	 */
	public prependOnceListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.#add(eventName, listener, (listeners) => listeners.splice(0, 0, { listener, once: true }));
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

		this.events.delete(eventName);
		return this;
	}

	/**
	 * Removes the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} removed.
	 */
	public removeListener<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
	): this {
		return this.off(eventName, listener);
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @param fn Function responsible for adding the new event handler function.
	 * @returns This instance with event {@link listener} added.
	 */
	#add<TEventName extends EventsOf<TMap>, TArgs extends EventArgs<TMap, TEventName>>(
		eventName: TEventName,
		listener: (...args: TArgs) => void,
		fn: (listeners: EventListener[]) => void,
	): this {
		let listeners = this.events.get(eventName);
		if (listeners === undefined) {
			listeners = [];
			this.events.set(eventName, listeners);
		}

		fn(listeners);
		if (eventName !== "newListener") {
			const args = [eventName, listener] as EventArgs<TMap, "newListener">;
			this.emit("newListener", ...args);
		}

		return this;
	}

	/**
	 * Removes the listener at the given index.
	 * @param eventName Name of the event.
	 * @param listeners Listeners registered with the event.
	 * @param index Index of the listener to remove.
	 */
	#remove<TEventName extends EventsOf<TMap>>(eventName: TEventName, listeners: EventListener[], index: number): void {
		const [{ listener } = {}] = listeners.splice(index, 1);
		if (listener === undefined) {
			return;
		}

		if (eventName !== "removeListener") {
			const args = [eventName, listener] as EventArgs<TMap, "removeListener">;
			this.emit("removeListener", ...args);
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
	: TEventName extends DefaultEvent
		? EventArgUnion<TMap>
		: never;

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
interface EventListener {
	/**
	 * Callback function called when the event is fired.
	 * @param args Arguments supplied to the event listener when the event is emitted.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	listener: (...args: any) => void;

	/**
	 * Determines whether the event listener should be invoked once.
	 */
	once?: true;
}
