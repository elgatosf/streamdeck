import { deferredDisposable, type IDisposable } from "./disposable";

/**
 * An event emitter that enables the listening for, and emitting of, events.
 */
export class EventEmitter<TMap extends EventMap<TMap>> {
	/**
	 * Underlying collection of events and their listeners.
	 */
	private readonly events = new Map<keyof EventsOf<TMap>, EventListener[]>();

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the {@link listener} added.
	 */
	public addListener<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		return this.on(eventName, listener);
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}, and returns a disposable capable of removing the event listener.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns A disposable that removes the listener when disposed.
	 */
	public disposableOn<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): IDisposable {
		this.addListener(eventName, listener);
		return deferredDisposable(() => this.removeListener(eventName, listener));
	}

	/**
	 * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
	 * @param eventName Name of the event.
	 * @param args Arguments supplied to each event listener.
	 * @returns `true` when there was a listener associated with the event; otherwise `false`.
	 */
	public emit<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, ...args: TArgs): boolean {
		const listeners = this.events.get(eventName);
		if (listeners === undefined) {
			return false;
		}

		for (let i = 0; i < listeners.length; ) {
			const { listener, once } = listeners[i];
			if (once) {
				listeners.splice(i, 1);
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
	public eventNames(): (keyof EventsOf<TMap>)[] {
		return Array.from(this.events.keys());
	}

	/**
	 * Gets the number of event listeners for the event named {@link eventName}. When a {@link listener} is defined, only matching event listeners are counted.
	 * @param eventName Name of the event.
	 * @param listener Optional event listener to count.
	 * @returns Number of event listeners.
	 */
	public listenerCount<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener?: (...args: TArgs) => void): number {
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
	public listeners<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName): ((...args: TArgs) => void)[] {
		return Array.from(this.events.get(eventName) || []).map(({ listener }) => listener);
	}

	/**
	 * Removes the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} removed.
	 */
	public off<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		const listeners = this.events.get(eventName) || [];
		for (let i = listeners.length - 1; i >= 0; i--) {
			if (listeners[i].listener === listener) {
				listeners.splice(i, 1);
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
	public on<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		return this.add(eventName, (listeners) => listeners.push({ listener }));
	}

	/**
	 * Adds the **one-time** event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} added.
	 */
	public once<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		return this.add(eventName, (listeners) => listeners.push({ listener, once: true }));
	}

	/**
	 * Adds the event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} prepended.
	 */
	public prependListener<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		return this.add(eventName, (listeners) => listeners.splice(0, 0, { listener }));
	}

	/**
	 * Adds the **one-time** event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} prepended.
	 */
	public prependOnceListener<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		return this.add(eventName, (listeners) => listeners.splice(0, 0, { listener, once: true }));
	}

	/**
	 * Removes all event listeners for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @returns This instance with the event listeners removed
	 */
	public removeAllListeners<TEventName extends keyof EventsOf<TMap>>(eventName: TEventName): this {
		this.events.delete(eventName);
		return this;
	}

	/**
	 * Removes the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param listener Event handler function.
	 * @returns This instance with the event {@link listener} removed.
	 */
	public removeListener<TEventName extends keyof EventsOf<TMap>, TArgs extends EventsOf<TMap>[TEventName]>(eventName: TEventName, listener: (...args: TArgs) => void): this {
		return this.off(eventName, listener);
	}

	/**
	 * Adds the event {@link listener} for the event named {@link eventName}.
	 * @param eventName Name of the event.
	 * @param fn Function responsible for adding the new event handler function.
	 * @returns This instance with event {@link listener} added.
	 */
	private add<TEventName extends keyof EventsOf<TMap>>(eventName: TEventName, fn: (listeners: EventListener[]) => void): this {
		let listeners = this.events.get(eventName);
		if (listeners === undefined) {
			listeners = [];
			this.events.set(eventName, listeners);
		}

		fn(listeners);
		return this;
	}
}

/**
 * A map of events and their arguments (represented as an array) that are supplied to the event's listener when the event is emitted.
 * @example
 * type UserService = {
 *     created: [id: number, userName: string];
 *     deleted: [id: number];
 * }
 */
type EventMap<T> = {
	[K in keyof T]: K extends string ? (T[K] extends unknown[] ? T[K] : never) : never;
};

/**
 * Parsed {@link EventMap} whereby each property is a `string` that denotes an event name, and the associated value type defines the listener arguments.
 */
export type EventsOf<T> = EventMap<
	Pick<
		T,
		Extract<
			{
				[K in keyof T]: K extends string ? K : never;
			}[keyof T],
			{
				[K in keyof T]: T[K] extends unknown[] ? K : never;
			}[keyof T]
		>
	>
>;

/**
 * An event listener associated with an event.
 */
type EventListener = {
	/**
	 *
	 * @param args Arguments supplied to the event listener when the event is emitted.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	listener: (...args: any) => void;

	/**
	 * Determines whether the event listener should be invoked once.
	 */
	once?: true;
};
