import EventEmitter from "node:events";
import WebSocket from "ws";
import { StreamDeckConnection, createConnection } from "../../src/connectivity/connection";
import { Event } from "../../src/connectivity/events";
import { RegistrationParameters } from "../../src/connectivity/registration";
import { getMockedLogger } from "./logging";

jest.mock("../../src/connectivity/registration");
jest.mock("ws", () => {
	const MockWebSocket = jest.fn(function () {
		const eventEmitter = new EventEmitter();
		const { on, once, emit } = new EventEmitter();

		this.emit = emit.bind(eventEmitter);
		this.on = on.bind(eventEmitter);
		this.once = once.bind(eventEmitter);
		this.send = jest.fn();
	});

	(<any>MockWebSocket).WebSocket = MockWebSocket;
	return MockWebSocket;
});

/**
 * Get a {@link StreamDeckConnection} connected to a mocked {@link WebSocket} connection.
 * @returns The {@link StreamDeckConnection}, and a function capable of emitting an event from the {@link WebSocket} it is connected to.
 */
export function getConnection() {
	// Initialize the connection.
	const { logger } = getMockedLogger();
	const connection = createConnection(new RegistrationParameters([], logger), logger);

	// Update the state to connected.
	const webSocketSpy = jest.spyOn(WebSocket, "WebSocket");
	connection.connect();
	const [webSocket] = webSocketSpy.mock.instances;
	webSocket.emit("open");

	// Enable spying on `send` to assert expectations.
	jest.spyOn(connection, "send");

	return {
		/**
		 * The {@link StreamDeckConnection}.
		 */
		connection,

		/**
		 * Emits the specified {@link ev} as a message on the underlying connection.
		 * @param ev Event to emit; this is serialized to JSON and then emitted.
		 * @returns The original {@link ev}.
		 */
		emitMessage: <T extends Event>(ev: T): T => {
			webSocket.emit("message", JSON.stringify(ev));
			return ev;
		}
	};
}
