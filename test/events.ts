import EventEmitter from "node:events";

/**
 * Helper function that emits event listeners for the {@link mockedClass} that match the {@link eventName}. The {@link mockedClass} must implement a structure similar to {@link EventEmitter}
 * where events are registered using {@link EventEmitter.on}.
 * @param mockedClass Mocked class that contains instances whose events will be emitted.
 * @param eventName Event name to match.
 * @param args Arguments supplied to each matched listener.
 */
export function emitFrom<T extends jest.Constructable>(mockedClass: jest.MockedClass<T>, eventName: string, ...args: unknown[]) {
	for (const instance of mockedClass.mock.instances) {
		const listeners = (instance.on as unknown as jest.MockedFunction<EventEmitter["on"]>).mock.calls;
		for (const [name, listener] of listeners) {
			if (name === eventName) {
				listener(...args);
			}
		}
	}
}
