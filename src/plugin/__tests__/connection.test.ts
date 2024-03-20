import { type WS as WebSocketServer } from "jest-websocket-mock";
import type { RegistrationInfo } from "..";
import type { DidReceiveGlobalSettings } from "../../api";
import type { Settings } from "../../api/__mocks__/events";
import { registrationInfo } from "../../api/registration/__mocks__";
import { type connection as Connection } from "../connection";
import { LogLevel } from "../logging/log-level";
import { Logger } from "../logging/logger";

jest.mock("ws");
jest.mock("../logging");

const port = ["-port", "12345"];
const pluginUUID = ["-pluginUUID", "abc123"];
const registerEvent = ["-registerEvent", "test_event"];
const info = ["-info", `{"plugin":{"uuid":"com.elgato.test","version":"0.1.0"}}`];

const originalArgv = process.argv;

describe("connection", () => {
	let connection!: typeof Connection;
	let logger!: Logger;

	// Re-import the connection to ensure a fresh state.
	beforeEach(async () => {
		({ connection } = await require("../connection"));
		({ logger } = await require("../logging"));

		process.argv = [...port, ...pluginUUID, ...registerEvent, ...info];
	});

	// Reset modules to purge the state.
	afterEach(() => {
		process.argv = originalArgv;
		jest.resetModules();
	});

	describe("WebSocket", () => {
		let server: WebSocketServer;

		// Setup the mock server.
		beforeEach(async () => {
			const { WS } = await require("jest-websocket-mock");
			server = new WS(`ws://127.0.0.1:${port[1]}`, { jsonProtocol: true });
		});

		// Clean-up the mock server.
		afterEach(() => server.close());

		/**
		 * Asserts {@link Connection.connect} sends the registration message to the underlying web socket.
		 */
		it("connect", async () => {
			// Arrange, act.
			await connection.connect();

			// Assert
			await expect(server).toReceiveMessage({
				event: registerEvent[1],
				uuid: pluginUUID[1]
			});
		});

		it("emits connected", async () => {
			// Arrange.
			const listener = jest.fn();

			// Act.
			connection.on("connected", listener);
			await connection.connect();

			// Assert
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toBeCalledWith<[RegistrationInfo]>(JSON.parse(info[1]));
		});

		/**
		 * Asserts {@link Connection.sends} forwards the message to the server.
		 */
		it("sends", async () => {
			// Arrange.
			await connection.connect();

			// Act.
			await connection.send({
				event: "setSettings",
				context: "abc123",
				payload: {
					message: "Hello world"
				}
			});

			// Assert.
			await expect(server).toReceiveMessage({
				event: registerEvent[1],
				uuid: pluginUUID[1]
			});

			await expect(server).toReceiveMessage({
				event: "setSettings",
				context: "abc123",
				payload: {
					message: "Hello world"
				}
			});
		});

		/**
		 * Asserts messages sent from the server are propagated by the {@link Connection}.
		 */
		it("propagates messages", async () => {
			// Arrange.
			const listener = jest.fn();
			connection.on("didReceiveGlobalSettings", listener);

			await connection.connect();

			// Act.
			server.send({
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Elgato"
					}
				}
			} satisfies DidReceiveGlobalSettings<Settings>);

			// Assert.
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettings<Settings>]>({
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Elgato"
					}
				}
			});
		});
	});

	describe("registration parameters", () => {
		/**
		 * Asserts the {@link Connection} is capable of parsing known arguments.
		 */
		it("parses valid arguments", () => {
			// Arrange.
			process.argv = [...port, ...pluginUUID, ...registerEvent, ...info];

			// Act.
			const parameters = connection.registrationParameters;

			// Assert.
			expect(parameters.port).toBe("12345");
			expect(parameters.pluginUUID).toBe("abc123");
			expect(parameters.registerEvent).toBe("test_event");
			expect(parameters.info).not.toBeUndefined();
			expect(parameters.info.plugin.uuid).toBe("com.elgato.test");
			expect(parameters.info.plugin.version).toBe("0.1.0");
		});

		/**
		 * Asserts the {@link Connection} ignores unknown arguments.
		 */
		it("ignores unknown arguments", () => {
			// Arrange
			process.argv = [...port, "-other", "Hello world", ...pluginUUID, ...registerEvent, ...info];

			// Act.
			const parameters = connection.registrationParameters;

			// Assert.
			expect(parameters.port).toBe("12345");
			expect(parameters.pluginUUID).toBe("abc123");
			expect(parameters.registerEvent).toBe("test_event");
			expect(parameters.info).not.toBeUndefined();
			expect(parameters.info.plugin.uuid).toBe("com.elgato.test");
			expect(parameters.info.plugin.version).toBe("0.1.0");
		});

		/**
		 * Asserts the {@link Connection} is able to handle an odd number of key-value arguments.
		 */
		it("handles uneven arguments", () => {
			// Arrange.
			process.argv = [...port, ...pluginUUID, "-bool", ...registerEvent, ...info];

			// Act.
			const parameters = connection.registrationParameters;

			// Assert.
			expect(parameters.port).toBe("12345");
			expect(parameters.pluginUUID).toBe("abc123");
			expect(parameters.registerEvent).toBe("test_event");
			expect(parameters.info).not.toBeUndefined();
			expect(parameters.info.plugin.uuid).toBe("com.elgato.test");
			expect(parameters.info.plugin.version).toBe("0.1.0");
		});

		/**
		 * Asserts the {@link Connection} logs all arguments to the {@link Logger}.
		 */
		it("logs arguments", () => {
			// Arrange
			const scopedLogger = new Logger({
				level: LogLevel.TRACE,
				target: { write: jest.fn() }
			});

			jest.spyOn(logger, "createScope").mockReturnValueOnce(scopedLogger);
			const spyOnLoggerDebug = jest.spyOn(scopedLogger, "debug");

			// Act.
			connection.registrationParameters;

			// Assert.
			expect(spyOnLoggerDebug).toHaveBeenCalledTimes(4);
			expect(spyOnLoggerDebug).toBeCalledWith(`port=${[port[1]]}`);
			expect(spyOnLoggerDebug).toBeCalledWith(`pluginUUID=${[pluginUUID[1]]}`);
			expect(spyOnLoggerDebug).toBeCalledWith(`registerEvent=${[registerEvent[1]]}`);
			expect(spyOnLoggerDebug).toBeCalledWith(`info=${info[1]}`);
		});

		/**
		 * Asserts the {@link Connection} creates a scoped {@link Logger}, when parsing registration parameters.
		 */
		it("creates a scoped logger", () => {
			// Arrange, act.
			const spyOnCreateScope = jest.spyOn(logger, "createScope");
			connection.registrationParameters;

			// Assert.
			expect(spyOnCreateScope).toBeCalledWith("RegistrationParameters");
		});

		/**
		 * Asserts the {@link Connection} throws when there is a missing argument, and all missing arguments are included in the message, when parsing registration parameters.
		 */
		it("includes all missing arguments", () => {
			// Arrange.
			process.argv = [];

			// Act, assert.
			expect(() => connection.registrationParameters).toThrow(
				"Unable to establish a connection with Stream Deck, missing command line arguments: -port, -pluginUUID, -registerEvent, -info"
			);
		});

		/**
		 * Asserts the {@link Connection} throws when "-port" is missing, when parsing registration parameters.
		 */
		it("requires port", () => {
			// Arrange.
			process.argv = [...pluginUUID, ...registerEvent, ...info];

			// Act, assert.
			expect(() => connection.registrationParameters).toThrow("Unable to establish a connection with Stream Deck, missing command line arguments: -port");
		});

		/**
		 * Asserts the {@link Connection} throws when "-pluginUUID" is missing, when parsing registration parameters.
		 */
		it("requires pluginUUID", () => {
			// Arrange.
			process.argv = [...port, ...registerEvent, ...info];

			// Act, assert.
			expect(() => connection.registrationParameters).toThrow("Unable to establish a connection with Stream Deck, missing command line arguments: -pluginUUID");
		});

		/**
		 * Asserts the {@link Connection} throws when "-registerEvent" is missing, when parsing registration parameters.
		 */
		it("requires registerEvent", () => {
			// Arrange.
			process.argv = [...port, ...pluginUUID, ...info];

			// Act, assert.
			expect(() => connection.registrationParameters).toThrow("Unable to establish a connection with Stream Deck, missing command line arguments: -registerEvent");
		});

		/**
		 * Asserts the {@link Connection} throws when "-info" is missing, when parsing registration parameters.
		 */
		it("requires info", () => {
			// Arrange.
			process.argv = [...port, ...pluginUUID, ...registerEvent];

			// Act, assert.
			expect(() => connection.registrationParameters).toThrow("Unable to establish a connection with Stream Deck, missing command line arguments: -info");
		});
	});

	/**
	 * Asserts {@link Connection.version} is parsed from the registration information.
	 */
	it("parses version from registration info", () => {
		// Arrange.
		process.argv = [...port, ...pluginUUID, ...registerEvent, "-info", JSON.stringify(registrationInfo)];

		// Act, assert.
		expect(connection.version).not.toBeUndefined();
		expect(connection.version.major).toBe(99);
		expect(connection.version.minor).toBe(8);
		expect(connection.version.patch).toBe(6);
		expect(connection.version.build).toBe(54321);
	});
});
