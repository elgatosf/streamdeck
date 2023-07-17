import { EventEmitter } from "node:events";

import type { StreamDeckConnection as __StreamDeckConnection } from "../connection";

/**
 * Mocked {@link __StreamDeckConnection}.
 */
export const StreamDeckConnection = jest.fn().mockImplementation(() => {
	const emitter = new EventEmitter();
	return {
		connect: jest.fn(),
		emit(eventName: string, ...args: unknown[]) {
			emitter.emit(eventName, ...args);
		},
		on(eventName: string, listener: (...args: unknown[]) => void) {
			emitter.on(eventName, listener);
			return this;
		},
		once(eventName: string, listener: (...args: unknown[]) => void) {
			emitter.once(eventName, listener);
			return this;
		},
		removeListener(eventName: string, listener: (...args: unknown[]) => void) {
			emitter.removeListener(eventName, listener);
			return this;
		},
		send: jest.fn()
	};
});
