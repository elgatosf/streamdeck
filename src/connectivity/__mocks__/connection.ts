import { EventEmitter } from "node:events";

import type { StreamDeckConnection as __StreamDeckConnection } from "../connection";
import { registrationParameters } from "./registration";

/**
 * Mock {@link __StreamDeckConnection}.
 */
export type MockStreamDeckConnection = __StreamDeckConnection & {
	__emit(eventName: string, ...args: unknown[]): void;
};

/**
 * Mocked {@link __StreamDeckConnection}.
 */
export const StreamDeckConnection = jest.fn().mockImplementation(() => {
	const emitter = new EventEmitter();
	return {
		connect: jest.fn(),
		__emit(eventName: string, ...args: unknown[]) {
			emitter.emit(eventName, ...args);
		},
		registrationParameters,
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
