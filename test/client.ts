import { StreamDeckClient } from "../src/client";
import { Logger } from "../src/common/logging";
import { MockStreamDeckConnection } from "../src/connectivity/__mocks__/connection";
import { registrationParameters } from "../src/connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../src/connectivity/connection";
import { Device } from "../src/devices";

jest.mock("../src/common/logging");
jest.mock("../src/connectivity/connection");

/**
 * Gets the {@link StreamDeckClient} connected to a mock {@link StreamDeckConnection}
 * @param devices Optional devices supplied to the {@link StreamDeckClient}.
 * @returns The client and its connection.
 */
export function getMockClient(devices: Map<string, Device> = new Map<string, Device>()) {
	const logger = new Logger();
	const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

	return {
		connection,
		logger,
		client: new StreamDeckClient(connection, devices)
	};
}
