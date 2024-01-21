import { Logger, LogLevel } from "../../src/plugin/logging";
import { LoggerOptions } from "../../src/plugin/logging/logger";

jest.mock("../../src/plugin/logging");

/**
 * Creates a new mock {@link Logger}.
 * @returns The mocked {@link Logger}.
 */
export function getMockedLogger() {
	const options: LoggerOptions = {
		level: LogLevel.TRACE,
		target: { write: jest.fn() }
	};

	const logger = new Logger(options);
	const scopedLogger = new Logger({
		...options,
		scope: "Scope"
	});

	jest.spyOn(logger, "createScope").mockReturnValue(scopedLogger);

	return {
		/**
		 * Mocked {@link Logger}.
		 */
		logger,

		/**
		 * Options used to construct the mock {@link Logger}.
		 */
		options,

		/**
		 * The mocked scoped {@link Logger} returned when calling {@link Logger.createScope}.
		 */
		scopedLogger
	};
}
