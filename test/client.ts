import { StreamDeckClient } from "../src/client";
import { MockStreamDeckConnection } from "../src/connectivity/__mocks__/connection";
import { registrationParameters } from "../src/connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../src/connectivity/connection";
import { Device } from "../src/devices";
import { Logger, LoggerFactory, LogLevel } from "../src/logging";

jest.mock("../src/logging");
jest.mock("../src/connectivity/connection");

/**
 * Gets the {@link StreamDeckClient} connected to a mock {@link StreamDeckConnection}
 * @param devices Optional devices supplied to the {@link StreamDeckClient}.
 * @returns The client and its connection.
 */
export function getMockClient(devices: Map<string, Device> = new Map<string, Device>()) {
	const loggingOptions = {
		logLevel: LogLevel.INFO,
		target: { write: jest.fn() }
	};

	const loggerFactory = new LoggerFactory(loggingOptions);
	const logger = new Logger(undefined, loggingOptions);

	jest.spyOn(loggerFactory, "createLogger").mockReturnValue(logger);

	const connection = new StreamDeckConnection(registrationParameters, loggerFactory) as MockStreamDeckConnection;

	return {
		/**
		 * Mocked {@link StreamDeckConnection} connected to the mocked {@link StreamDeckClient}.
		 */
		connection,

		/**
		 * Mocked {@link LoggerFactory} that resolves the mocked {@link Logger} when creating new loggers.
		 */
		loggerFactory,

		/**
		 * Mocked {@link Logger} resolved by the mocked {@link LoggerFactory}.
		 */
		logger,

		/**
		 * Mocked {@link StreamDeckClient} associated with the mocked {@link StreamDeckConnection}.
		 */
		client: new StreamDeckClient(connection, devices)
	};
}
