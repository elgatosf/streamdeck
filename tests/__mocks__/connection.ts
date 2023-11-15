import type { MockStreamDeckConnection } from "../../src/connectivity/__mocks__/connection";
import { StreamDeckConnection, createConnection } from "../../src/connectivity/connection";
import { RegistrationParameters } from "../../src/connectivity/registration";
import type { Logger } from "../../src/logging";
import { getMockedLogger } from "./logging";

jest.mock("../../src/connectivity/connection");
jest.mock("../../src/connectivity/registration");

/**
 * Gets a mocked {@link StreamDeckConnection}, and the accompanying {@link Logger}.
 * @returns The mocked {@link StreamDeckConnection}.
 */
export function getMockedConnection() {
	const { logger, scopedLogger } = getMockedLogger();
	const connection = createConnection(new RegistrationParameters([], logger), logger) as MockStreamDeckConnection;

	return {
		/**
		 * Mocked {@link StreamDeckConnection}.
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
