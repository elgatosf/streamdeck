import EventEmitter from "node:events";

/**
 * Helper function that emits event listeners for the {@link mockedClass} that match the {@link eventName}. The {@link mockedClass} must implement a structure similar to {@link EventEmitter}
 * where events are registered using {@link EventEmitter.on}.
 * @param mockedClass Mocked class that contains instances whose events will be emitted.
 * @param eventName Event name to match.
 * @param args Arguments supplied to each matched listener.
 */
export function emitFromAll<T extends jest.Constructable>(mockedClass: jest.MockedClass<T>, eventName: string, ...args: unknown[]) {
	for (const instance of mockedClass.mock.instances) {
		const listeners = (instance.on as unknown as jest.MockedFunction<EventEmitter["on"]>).mock.calls;
		for (const [name, listener] of listeners) {
			if (name === eventName) {
				listener(...args);
			}
		}
	}
}

/**
 * Helper function that emits event listeners for the {@link mock} that match the {@link eventName}. The {@link mock} must implement a structure similar to {@link EventEmitter}
 * where events are registered using {@link EventEmitter.on}.
 * @param mock Mocked instance.
 * @param eventName Event name to match.
 * @param args Arguments supplied to each matched listener.
 */
export function emitFrom<TEventName extends string, TArgs = unknown>(mock: On<TEventName, TArgs>, eventName: string, args: TArgs) {
	const listeners = (mock.on as unknown as jest.MockedFunction<EventEmitter["on"]>).mock.calls;
	for (const [name, listener] of listeners) {
		if (name === eventName) {
			listener(args);
		}
	}
}

/**
 * Typed alias type of {@link EventEmitter.on}.
 */
type On<TEventName, TArgs> = {
	/**
	 * {@link EventEmitter.on}
	 */
	on: (eventName: TEventName, listener: (ev: TArgs) => void) => void;
};
