import WebSocket from "ws";

import { emitFromAll } from "../../test/events";
import { logger } from "../common/logging";
import { StreamDeckConnection } from "./connection";
import { RegistrationParameters } from "./registration";

jest.mock("../common/logging");
jest.mock("ws");

const mockArgv = ["-port", "12345", "-pluginUUID", "abc123", "-registerEvent", "test_event", "-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];
const regParams = new RegistrationParameters(mockArgv);

const originalArgv = process.argv;

describe("StreamDeckConnection", () => {
	const mockedWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>;
	beforeEach(() => jest.resetAllMocks());
	afterEach(() => (process.argv = originalArgv));

	/**
	 * Asserts the {@link StreamDeckConnection} constructor does not automatically attempt to connect to Stream Deck.
	 */
	it("Does not auto-connect on construction", () => {
		process.argv = mockArgv;
		new StreamDeckConnection();
		expect(mockedWebSocket.mock.instances).toHaveLength(0);

		process.argv = originalArgv;
		new StreamDeckConnection(regParams);
		expect(mockedWebSocket.mock.instances).toHaveLength(0);
	});

	/**
	 * Assert {@link StreamDeckConnection.connect} establishes a connection with the Stream Deck, and registers the information provided as part of the {@link RegistrationParameters}.
	 */
	it("Registers on connection", () => {
		// Arrange.
		const connection = new StreamDeckConnection(regParams);
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
		const connection = new StreamDeckConnection(regParams);
		connection.connect();

		(connection as any).ws = undefined;

		// Act.
		emitFromAll(mockedWebSocket, "open");

		// Assert.
		expect(logger.logError).toHaveBeenCalledTimes(1);
		expect(logger.logError).toHaveBeenCalledWith("Failed to connect to Stream Deck: Web Socket connection is undefined.");
	});

	/**
	 * Asserts {@link StreamDeckConnection.connect} only connects to the Stream Deck once.
	 */
	it("Does not connect twice", () => {
		// Arrange.
		const connection = getConnection();
		expect(logger.logDebug).toHaveBeenNthCalledWith(1, "Connecting to Stream Deck.");
		expect(logger.logDebug).toHaveBeenNthCalledWith(2, "Successfully connected to Stream Deck.");

		// Act.
		connection.connect();

		// Assert.
		expect(logger.logDebug).toHaveBeenCalledTimes(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.on} is fired each time a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits on", () => {
		// Arrange.
		const connection = getConnection();
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
		const connection = getConnection();
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
		const connection = getConnection();
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
		const connection = getConnection();

		// Act.
		await connection.send("openUrl", {
			payload: {
				url: "https://www.elgato.com"
			}
		});

		// Assert.
		expect(mockedWebSocket.mock.instances[0].send).toHaveBeenCalledWith(
			JSON.stringify({
				event: "openUrl",
				payload: {
					url: "https://www.elgato.com"
				}
			})
		);
	});

	/**
	 * Asserts a warning is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unknown messages", () => {
		// Arrange.
		getConnection();
		const msg = JSON.stringify({ name: "Hello world " });

		// Act.
		emitFromAll(mockedWebSocket, "message", msg);

		// Assert.
		expect(logger.logWarn).toBeCalledTimes(1);
		expect(logger.logWarn).toBeCalledWith(`Received unknown message: ${msg}`);
	});

	/**
	 * Asserts an error is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unreadable messages", () => {
		// Arrange.
		getConnection();

		// Act.
		emitFromAll(mockedWebSocket, "message", "{INVALID_JSON}");

		// Assert.
		expect(logger.logError).toBeCalledTimes(1);
		expect(logger.logError).toBeCalledWith("Failed to parse message: {INVALID_JSON}", expect.any(Error));
	});

	/**
	 * Creates {@link StreamDeckConnection} and connects it to a mock {@link WebSocket}.
	 * @returns A {@link StreamDeckConnection} that is in a connected state.
	 */
	function getConnection() {
		const connection = new StreamDeckConnection(regParams);
		connection.connect();

		emitFromAll(mockedWebSocket, "open");
		return connection;
	}
});
