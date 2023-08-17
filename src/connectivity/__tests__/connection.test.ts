import WebSocket, { EventEmitter } from "ws";

import { getMockedLogger } from "../../../tests/__mocks__/logging";
import { Logger } from "../../logging";
import { OpenUrl } from "../commands";
import { StreamDeckConnection } from "../connection";
import { RegistrationParameters } from "../registration";

jest.mock("ws");

const mockArgv = ["-port", "12345", "-pluginUUID", "abc123", "-registerEvent", "test_event", "-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];
const regParams = new RegistrationParameters(mockArgv, getMockedLogger().logger);

const originalArgv = process.argv;

describe("StreamDeckConnection", () => {
	const mockedWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>;

	afterEach(() => {
		jest.resetAllMocks();
		process.argv = originalArgv;
	});

	/**
	 * Asserts the {@link StreamDeckConnection} constructor does not automatically attempt to connect to Stream Deck.
	 */
	it("Does not auto-connect on construction", () => {
		process.argv = originalArgv;
		new StreamDeckConnection(regParams, getMockedLogger().logger);
		expect(mockedWebSocket.mock.instances).toHaveLength(0);
	});

	/**
	 * Assert {@link StreamDeckConnection.connect} establishes a connection with the Stream Deck, and registers the information provided as part of the {@link RegistrationParameters}.
	 */
	it("Registers on connection", () => {
		// Arrange.
		const connection = new StreamDeckConnection(regParams, getMockedLogger().logger);
		connection.connect();

		// Act.
		emitFromWebSocket("open");

		// Assert.
		const [webSocket] = mockedWebSocket.mock.instances;
		expect(webSocket.send).toBeCalledTimes(1);
		expect(webSocket.send).toBeCalledWith(
			JSON.stringify({
				event: regParams.registerEvent,
				uuid: regParams.pluginUUID
			})
		);
	});

	/**
	 * Assert an error is logged when {@link StreamDeckConnection.connect} is unable to connect due to the WebSocket being `undefined`.
	 */
	it("Log when WebSocket is undefined", () => {
		// Arrange.
		const { logger, scopedLogger } = getMockedLogger();
		const connection = new StreamDeckConnection(regParams, logger);
		connection.connect();

		(connection as any).ws = undefined;

		// Act.
		emitFromWebSocket("open");

		// Assert.
		expect(scopedLogger.error).toHaveBeenCalledTimes(1);
		expect(scopedLogger.error).toHaveBeenCalledWith("Failed to connect to Stream Deck: Web Socket connection is undefined.");
	});

	/**
	 * Asserts {@link StreamDeckConnection.connect} only connects to the Stream Deck once.
	 */
	it("Does not connect twice", () => {
		// Arrange.
		const { logger, scopedLogger } = getMockedLogger();
		const connection = openConnection(logger);

		expect(scopedLogger.debug).toHaveBeenNthCalledWith(1, "Connecting to Stream Deck.");
		expect(scopedLogger.debug).toHaveBeenNthCalledWith(2, "Successfully connected to Stream Deck.");

		// Act.
		connection.connect();

		// Assert.
		expect(scopedLogger.debug).toHaveBeenCalledTimes(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.on} is fired each time a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits on", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = openConnection(logger);

		let emitCount = 0;
		connection.on("systemDidWakeUp", () => emitCount++);

		// Act.
		emitFromWebSocket("message", JSON.stringify({ event: "someOtherEvent" }));
		emitFromWebSocket("message", JSON.stringify({ event: "systemDidWakeUp" }));
		emitFromWebSocket("message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.once} is only fired a single time when a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits once", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = openConnection(logger);

		let emitCount = 0;
		connection.once("systemDidWakeUp", () => emitCount++);

		// Act.
		emitFromWebSocket("message", JSON.stringify({ event: "someOtherEvent" }));
		emitFromWebSocket("message", JSON.stringify({ event: "systemDidWakeUp" }));
		emitFromWebSocket("message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(1);
	});

	/**
	 * Asserts {@link StreamDeckConnection.removeListener} correctly removes a listener from the underlying event emitter.
	 */
	it("Removes listeners", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = openConnection(logger);

		let emitCount = 0;
		const listener = () => emitCount++;

		// Act.
		connection.once("systemDidWakeUp", listener);
		emitFromWebSocket("message", JSON.stringify({ event: "systemDidWakeUp" }));

		connection.removeListener("systemDidWakeUp", listener);
		emitFromWebSocket("message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(1);
	});

	/**
	 * Asserts messages sent to {@link StreamDeckConnection.send} are sent via {@link WebSocket.send}.
	 */
	it("Sends to the WebSocket", async () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = openConnection(logger);

		const command: OpenUrl = {
			event: "openUrl",
			payload: {
				url: "https://www.elgato.com"
			}
		};

		// Act.
		await connection.send(command);

		// Assert.
		expect(mockedWebSocket.mock.instances[0].send).toHaveBeenCalledWith(JSON.stringify(command));
	});

	/**
	 * Asserts a warning is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unknown messages", () => {
		// Arrange.
		const { logger, scopedLogger } = getMockedLogger();
		openConnection(logger);

		const msg = JSON.stringify({ name: "Hello world " });

		// Act.
		emitFromWebSocket("message", msg);

		// Assert.
		expect(scopedLogger.warn).toBeCalledTimes(1);
		expect(scopedLogger.warn).toBeCalledWith(`Received unknown message: ${msg}`);
	});

	/**
	 * Asserts an error is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unreadable messages", () => {
		// Arrange.
		const { logger, scopedLogger } = getMockedLogger();
		openConnection(logger);

		// Act.
		emitFromWebSocket("message", "{INVALID_JSON}");

		// Assert.
		expect(scopedLogger.error).toBeCalledTimes(1);
		expect(scopedLogger.error).toBeCalledWith("Failed to parse message: {INVALID_JSON}", expect.any(Error));
	});

	/**
	 * Asserts {@link StreamDeckConnection} creates a scoped logger.
	 */
	it("Creates a scoped logger", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const createScopeSpy = jest.spyOn(logger, "createScope");

		// Act.
		new StreamDeckConnection(regParams, logger);

		// Assert.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("StreamDeckConnection");
	});

	/**
	 * Creates {@link StreamDeckConnection} and connects it to a mock {@link WebSocket}.
	 * @param logger The logger factory to be consumed by the {@link StreamDeckConnection}.
	 * @returns A {@link StreamDeckConnection} that is in a connected state.
	 */
	function openConnection(logger: Logger) {
		const connection = new StreamDeckConnection(regParams, logger);
		connection.connect();

		emitFromWebSocket("open");
		return connection;
	}

	/**
	 * Emits the specified {@link eventName} from the mocked {@link WebSocket}.
	 * @param eventName Event name to emit.
	 * @param args Arguments supplied when emitting the event.
	 */
	function emitFromWebSocket(eventName: string, ...args: unknown[]) {
		for (const instance of mockedWebSocket.mock.instances) {
			const listeners = (instance.on as unknown as jest.MockedFunction<EventEmitter["on"]>).mock.calls;
			for (const [name, listener] of listeners) {
				if (name === eventName) {
					listener(...args);
				}
			}
		}
	}
});
