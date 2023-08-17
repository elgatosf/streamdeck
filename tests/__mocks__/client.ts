import { StreamDeckClient } from "../../src/client";
import { MockStreamDeckConnection } from "../../src/connectivity/__mocks__/connection";
import { registrationParameters } from "../../src/connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../../src/connectivity/connection";
import { Device } from "../../src/devices";
import type { Logger } from "../../src/logging";
import { getMockedLogger } from "./logging";

jest.mock("../../src/connectivity/connection");

/**
 * Gets the {@link StreamDeckClient} connected to a mock {@link StreamDeckConnection}
 * @param devices Optional devices supplied to the {@link StreamDeckClient}.
 * @returns The client and its connection.
 */
export function getMockedClient(devices: Map<string, Device> = new Map<string, Device>()) {
	const { logger, scopedLogger } = getMockedLogger();
	const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

	return {
		/**
		 * Mocked {@link StreamDeckClient} associated with the mocked {@link StreamDeckConnection}.
		 */
		client: new StreamDeckClient(connection, devices),

		/**
		 * Mocked {@link StreamDeckConnection} connected to the mocked {@link StreamDeckClient}.
		 */
		connection,

		/**
		 * Mocked {@link Logger}.
		 */
		logger,

		/**
		 * The mocked scoped {@link Logger} returned when calling {@link Logger.createScope}.
		 */
		scopedLogger
	};
}
