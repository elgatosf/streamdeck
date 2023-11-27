import { EventEmitter } from "node:events";
import WebSocket from "ws";

import { getMockedLogger } from "../../../tests/__mocks__/logging";
import { registrationParameters } from "../__mocks__/registration";
import { OpenUrl } from "../commands";
import { StreamDeckConnection, createConnection } from "../connection";
import * as api from "../events";
import { ApplicationDidLaunch } from "../events";

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

const originalArgv = process.argv;

describe("StreamDeckConnection", () => {
	afterEach(() => (process.argv = originalArgv));

	/**
	 * Asserts the {@link StreamDeckConnection} constructor does not automatically attempt to connect to Stream Deck.
	 */
	it("Does not auto-connect on construction", () => {
		// Arrange.
		const webSocketSpy = jest.spyOn(WebSocket, "WebSocket");
		process.argv = originalArgv;

		// Act.
		createConnection(registrationParameters, getMockedLogger().logger);

		// Assert.
		expect(webSocketSpy).toHaveLength(0);
	});

	/**
	 * Assert {@link StreamDeckConnection.connect} establishes a connection with the Stream Deck, and registers the information provided as part of the {@link RegistrationParameters}.
	 */
	it("Registers on connection", () => {
		// Arrange.
		const webSocketSpy = jest.spyOn(WebSocket, "WebSocket");
		const connection = createConnection(registrationParameters, getMockedLogger().logger);

		// Act.
		connection.connect();

		const [webSocket] = webSocketSpy.mock.instances;
		webSocket.emit("open");

		// Assert.
		expect(webSocketSpy.mock.calls[0]).toEqual(["ws://127.0.0.1:12345"]);
		expect(webSocket.send).toBeCalledTimes(1);
		expect(webSocket.send).toBeCalledWith(
			JSON.stringify({
				event: registrationParameters.registerEvent,
				uuid: registrationParameters.pluginUUID
			})
		);
	});

	/**
	 * Asserts {@link StreamDeckConnection.connect} only connects to the Stream Deck once.
	 */
	it("Does not connect twice", async () => {
		// Arrange.
		const { connection, scopedLogger } = await getOpenConnection();

		expect(scopedLogger.debug).toHaveBeenCalledTimes(2);
		expect(scopedLogger.debug).toHaveBeenNthCalledWith(1, "Connecting to Stream Deck.");
		expect(scopedLogger.debug).toHaveBeenNthCalledWith(2, "Successfully connected to Stream Deck.");

		// Act.
		connection.connect();

		// Assert.
		expect(scopedLogger.debug).toHaveBeenCalledTimes(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.connect} only connects to the Stream Deck once.
	 */
	describe("Can reconnect", () => {
		it.each(["close", "error"])("On %s", async (eventName) => {
			// Arrange.
			const webSocketSpy = jest.spyOn(WebSocket, "WebSocket");
			const { connection, scopedLogger, webSocket } = await getOpenConnection();

			// Act.
			webSocket.emit(eventName);
			const connect = connection.connect();

			// Assert (1).
			expect(webSocketSpy).toHaveBeenCalledTimes(2);

			// Act.
			webSocketSpy.mock.instances[1].emit("open");
			await connect;

			// Assert.
			expect(scopedLogger.debug).toHaveBeenCalledTimes(4);
			expect(scopedLogger.debug).toHaveBeenNthCalledWith(3, "Connecting to Stream Deck.");
			expect(scopedLogger.debug).toHaveBeenNthCalledWith(4, "Successfully connected to Stream Deck.");
		});
	});

	/**
	 * Asserts {@link StreamDeckConnection.on} is fired each time a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits on", async () => {
		// Arrange.
		const { connection, webSocket } = await getOpenConnection();
		let emitCount = 0;
		const expectedApplications = ["First.exe", "Second.exe"];

		// Act.
		connection.on("applicationDidLaunch", ({ event, payload: { application } }) => {
			expect(event).toBe("applicationDidLaunch");
			expect(application).toBe(expectedApplications[emitCount]);
			emitCount++;
		});

		webSocket.emit("message", JSON.stringify({ event: "someOtherEvent" }));
		webSocket.emit("message", JSON.stringify({ event: "applicationDidLaunch", payload: { application: "First.exe" } } satisfies ApplicationDidLaunch));
		webSocket.emit("message", JSON.stringify({ event: "applicationDidLaunch", payload: { application: "Second.exe" } } satisfies ApplicationDidLaunch));

		// Assert.
		expect(emitCount).toBe(2);
	});

	/**
	 * Asserts {@link StreamDeckConnection.once} is only fired a single time when a matching event is emitted from the underlying {@link WebSocket}.
	 */
	it("Emits once", async () => {
		// Arrange.
		const { connection, webSocket } = await getOpenConnection();
		let emitCount = 0;

		// Act.
		connection.once("applicationDidLaunch", ({ event, payload: { application } }) => {
			expect(event).toBe("applicationDidLaunch");
			expect(application).toBe("First.exe");
			emitCount++;
		});

		webSocket.emit("message", JSON.stringify({ event: "someOtherEvent" }));
		webSocket.emit("message", JSON.stringify({ event: "applicationDidLaunch", payload: { application: "First.exe" } } satisfies ApplicationDidLaunch));
		webSocket.emit("message", JSON.stringify({ event: "applicationDidLaunch", payload: { application: "Second.exe" } } satisfies ApplicationDidLaunch));

		// Assert.
		expect(emitCount).toBe(1);
	});

	/**
	 * Asserts {@link StreamDeckConnection.removeListener} correctly removes a listener from the underlying event emitter.
	 */
	it("Removes listeners", async () => {
		// Arrange.
		const { connection, webSocket } = await getOpenConnection();

		let emitCount = 0;
		const listener = () => emitCount++;

		// Act.
		connection.on("systemDidWakeUp", listener);
		webSocket.emit("message", JSON.stringify({ event: "systemDidWakeUp" }));

		connection.removeListener("systemDidWakeUp", listener);
		webSocket.emit("message", JSON.stringify({ event: "systemDidWakeUp" }));

		// Assert.
		expect(emitCount).toBe(1);
	});

	/**
	 * Asserts messages sent to {@link StreamDeckConnection.send} are sent via {@link WebSocket.send}.
	 */
	it("Sends to the WebSocket", async () => {
		// Arrange.
		const { connection, webSocket } = await getOpenConnection();

		const command: OpenUrl = {
			event: "openUrl",
			payload: {
				url: "https://www.elgato.com"
			}
		};

		// Act.
		await connection.send(command);

		// Assert.
		expect(webSocket.send).toHaveBeenCalledWith(JSON.stringify(command));
	});

	/**
	 * Asserts a warning is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unknown messages", async () => {
		// Arrange.
		const { scopedLogger, webSocket } = await getOpenConnection();
		const msg = JSON.stringify({ name: "Hello world " });

		// Act.
		webSocket.emit("message", msg);

		// Assert.
		expect(scopedLogger.warn).toBeCalledTimes(1);
		expect(scopedLogger.warn).toBeCalledWith(`Received unknown message: ${msg}`);
	});

	/**
	 * Asserts an error is logged when a message is received from the underlying {@link WebSocket} that isn't in a recognized format.
	 */
	it("Logs unreadable messages", async () => {
		// Arrange.
		const { scopedLogger, webSocket } = await getOpenConnection();

		// Act.
		webSocket.emit("message", "{INVALID_JSON}");

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
		createConnection(registrationParameters, logger);

		// Assert.
		expect(createScopeSpy).toHaveBeenCalledTimes(1);
		expect(createScopeSpy).toHaveBeenCalledWith("StreamDeckConnection");
	});

	describe("addDisposableListener", () => {
		/**
		 * Asserts the {@link StreamDeckConnection.addDisposableListener} adds the event listener.
		 */
		it("adds the listener", async () => {
			// Arrange.
			const { connection, webSocket } = await getOpenConnection();
			const listener = jest.fn();

			// Act.
			connection.addDisposableListener("applicationDidLaunch", listener);
			webSocket.emit(
				"message",
				JSON.stringify({
					event: "applicationDidLaunch",
					payload: { application: "one" }
				} satisfies api.ApplicationDidLaunch)
			);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunch]>({
				event: "applicationDidLaunch",
				payload: { application: "one" }
			});
		});

		/**
		 * Asserts listeners added via {@link StreamDeckConnection.addDisposableListener} can be removed by disposing.
		 */
		it("can remove after emitting", async () => {
			// Arrange.
			const { connection, webSocket } = await getOpenConnection();
			const listener = jest.fn();

			// Act.
			const handler = connection.addDisposableListener("applicationDidLaunch", listener);
			webSocket.emit(
				"message",
				JSON.stringify({
					event: "applicationDidLaunch",
					payload: { application: "one" }
				} satisfies api.ApplicationDidLaunch)
			);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunch]>({
				event: "applicationDidLaunch",
				payload: { application: "one" }
			});

			// Re-act
			handler.dispose();
			webSocket.emit(
				"message",
				JSON.stringify({
					event: "applicationDidLaunch",
					payload: { application: "__other__" }
				} satisfies api.ApplicationDidLaunch)
			);

			// Re-assert
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenLastCalledWith<[ApplicationDidLaunch]>({
				event: "applicationDidLaunch",
				payload: { application: "one" }
			});
		});

		describe("removing the listener", () => {
			/**
			 * Asserts `dispose()` on the result {@link StreamDeckConnection.addDisposableListener} removes the listener.
			 */
			it("dispose", async () => {
				// Arrange.
				const { connection, webSocket } = await getOpenConnection();
				const listener = jest.fn();
				const handler = connection.addDisposableListener("applicationDidLaunch", listener);

				// Act.
				handler.dispose();
				webSocket.emit(
					"message",
					JSON.stringify({
						event: "applicationDidLaunch",
						payload: { application: "one" }
					} satisfies api.ApplicationDidLaunch)
				);

				// Assert.
				expect(listener).toHaveBeenCalledTimes(0);
			});

			/**
			 * Asserts `[Symbol.dispose]()` on the result {@link StreamDeckConnection.addDisposableListener} removes the listener.
			 */
			it("[Symbol.dispose]", async () => {
				// Arrange.
				const { connection, webSocket } = await getOpenConnection();
				const listener = jest.fn();

				// Act.
				{
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					using handler = connection.addDisposableListener("applicationDidLaunch", listener);
				}

				webSocket.emit(
					"message",
					JSON.stringify({
						event: "applicationDidLaunch",
						payload: { application: "one" }
					} satisfies api.ApplicationDidLaunch)
				);

				// Assert.
				expect(listener).toHaveBeenCalledTimes(0);
			});
		});
	});

	/**
	 * Creates {@link StreamDeckConnection} and connects it to a mock {@link WebSocket}.
	 * @returns The {@link StreamDeckConnection} in a connected state, and the mocks used to construct it.
	 */
	async function getOpenConnection() {
		const webSocketSpy = jest.spyOn(WebSocket, "WebSocket");
		const { logger, scopedLogger } = getMockedLogger();
		const connection = createConnection(registrationParameters, logger);

		const connect = connection.connect();
		webSocketSpy.mock.instances[0].emit("open");
		await connect;

		return {
			webSocket: webSocketSpy.mock.instances[0],
			connection,
			logger,
			scopedLogger
		};
	}
});
