import { ActionContainer } from "../../src/actions/action-container";
import type { StreamDeckConnection } from "../../src/connectivity/connection";
import type { Logger } from "../../src/logging";
import { getManifest, Manifest } from "../../src/manifest";
import { getMockedConnection } from "./connection";

jest.mock("../../src/manifest");

/**
 * Gets a mocked {@link ActionContainer} and its supporting objects.
 * @returns The mocked {@link ActionContainer} and objects used to construct it.
 */
export function getMockedActionContainer() {
	const { logger, scopedLogger, connection } = getMockedConnection();
	const manifest = getManifest();
	const container = new ActionContainer(connection, manifest, logger);

	jest.spyOn(logger, "createScope").mockClear();

	return {
		/**
		 * Mocked {@link StreamDeckConnection} connected to the mocked {@link ActionContainer}.
		 */
		connection,

		/**
		 * Mocked {@link ActionContainer}.
		 */
		container,

		/**
		 * Mocked {@link Logger}.
		 */
		logger,

		/**
		 * Mock {@link Manifest} used to construct the {@link ActionContainer}.
		 */
		manifest,

		/**
		 * The mocked scoped {@link Logger} returned when calling {@link Logger.createScope}.
		 */
		scopedLogger
	};
}
