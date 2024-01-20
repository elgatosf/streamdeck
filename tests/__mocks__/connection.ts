import EventEmitter from "node:events";
import WebSocket from "ws";
import { EventMessage } from "../../src/api/events";
import { registrationParameters } from "../../src/connectivity/__mocks__/registration";
import { StreamDeckConnection, createConnection } from "../../src/connectivity/connection";
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
 * @param version Optional version of the Stream Deck application.
 * @returns The {@link StreamDeckConnection}, and a function capable of emitting an event from the {@link WebSocket} it is connected to.
 */
export function getConnection(version: number = 99.9) {
	// Initialize the connection.
	const { logger } = getMockedLogger();
	const regParams = structuredClone(registrationParameters);
	(<any>regParams.info.application).version = version.toString();

	const connection = createConnection(regParams, logger);

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
		emitMessage: <T extends EventMessage>(ev: T): T => {
			webSocket.emit("message", JSON.stringify(ev));
			return ev;
		}
	};
}
