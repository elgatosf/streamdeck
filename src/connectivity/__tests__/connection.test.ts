import WebSocket from "ws";

import { emitFromAll } from "../../../test/events";
import { getLogging } from "../../../test/mocks";
import { LoggerFactory } from "../../logging";
import { OpenUrl } from "../commands";
import { StreamDeckConnection } from "../connection";
import { RegistrationParameters } from "../registration";

jest.mock("ws");

const mockArgv = ["-port", "12345", "-pluginUUID", "abc123", "-registerEvent", "test_event", "-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];
const regParams = new RegistrationParameters(mockArgv, getLogging().loggerFactory);

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
		new StreamDeckConnection(regParams, getLogging().loggerFactory);
		expect(mockedWebSocket.mock.instances).toHaveLength(0);
	});

	/**
	 * Assert {@link StreamDeckConnection.connect} establishes a connection with the Stream Deck, and registers the information provided as part of the {@link RegistrationParameters}.
	 */
	it("Registers on connection", () => {
		// Arrange.
		const connection = new StreamDeckConnection(regParams, getLogging().loggerFactory);
		connection.connect();

		// Act.
		emitFromAll(mockedWebSocket, "open");

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
		const { loggerFactory, logger } = getLogging();
		const connection = new StreamDeckConnection(regParams, loggerFactory);
		connection.connect();

		(connection as any).ws = undefined;

		// Act.
		emitFromAll(mockedWebSocket, "open");

		// Assert.
		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith("Failed to connect to Stream Deck: Web Socket connection is undefined.");
	});

	/**
	 * Asserts {@link StreamDeckConnection.connect} only connects to the Stream Deck once.
	 */
	it("Does not connect twice", () => {
		// Arrange.
		const { loggerFactory, logger } = getLogging();
		const connection = openConnection(loggerFactory);

		expect(logger.debug).toHaveBeenNthCalledWith(1, "Connecting to Stream Deck.");
		expect(logger.debug).toHaveBeenNthCalledWith(2, "Successfully connected to Stream Deck.");

		// Act.
		connection.connect();

		// Assert.
		expect(logger.debug).toHaveBeenCalledTimes(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.on} is fired each time a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits on", () => {
		// Arrange.
		const { loggerFactory } = getLogging();
		const connection = openConnection(loggerFactory);

		let emitCount = 0;
		connection.on("systemDidWakeUp", () => emitCount++);

		// Act.
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "someOtherEvent" }));
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "systemDidWakeUp" }));
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.once} is only fired a single time when a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits once", () => {
		// Arrange.
		const { loggerFactory } = getLogging();
		const connection = openConnection(loggerFactory);

		let emitCount = 0;
		connection.once("systemDidWakeUp", () => emitCount++);

		// Act.
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "someOtherEvent" }));
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "systemDidWakeUp" }));
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(1);
	});

	/**
	 * Asserts {@link StreamDeckConnection.removeListener} correctly removes a listener from the underlying event emitter.
	 */
	it("Removes listeners", () => {
		// Arrange.
		const { loggerFactory } = getLogging();
		const connection = openConnection(loggerFactory);

		let emitCount = 0;
		const listener = () => emitCount++;

		// Act.
		connection.once("systemDidWakeUp", listener);
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "systemDidWakeUp" }));

		connection.removeListener("systemDidWakeUp", listener);
		emitFromAll(mockedWebSocket, "message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(1);
	});

	/**
	 * Asserts messages sent to {@link StreamDeckConnection.send} are sent via {@link WebSocket.send}.
	 */
	it("Sends to the WebSocket", async () => {
		// Arrange.
		const { loggerFactory } = getLogging();
		const connection = openConnection(loggerFactory);

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
		const { loggerFactory, logger } = getLogging();
		openConnection(loggerFactory);

		const msg = JSON.stringify({ name: "Hello world " });

		// Act.
		emitFromAll(mockedWebSocket, "message", msg);

		// Assert.
		expect(logger.warn).toBeCalledTimes(1);
		expect(logger.warn).toBeCalledWith(`Received unknown message: ${msg}`);
	});

	/**
	 * Asserts an error is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unreadable messages", () => {
		// Arrange.
		const { loggerFactory, logger } = getLogging();
		openConnection(loggerFactory);

		// Act.
		emitFromAll(mockedWebSocket, "message", "{INVALID_JSON}");

		// Assert.
		expect(logger.error).toBeCalledTimes(1);
		expect(logger.error).toBeCalledWith("Failed to parse message: {INVALID_JSON}", expect.any(Error));
	});

	/**
	 * Creates {@link StreamDeckConnection} and connects it to a mock {@link WebSocket}.
	 * @returns A {@link StreamDeckConnection} that is in a connected state.
	 */
	function openConnection(loggerFactory: LoggerFactory) {
		const connection = new StreamDeckConnection(regParams, loggerFactory);
		connection.connect();

		emitFromAll(mockedWebSocket, "open");
		return connection;
	}
});
