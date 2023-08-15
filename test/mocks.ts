import { Logger, LogLevel } from "../src/logging";
import { LoggerFactory, LoggingOptions } from "../src/logging/logger-factory";

jest.mock("../src/logging");

/**
 * Gets a mocked {@link LoggerFactory} that always resolves a mocked {@link Logger}.
 * @returns The mocked {@link LoggerFactory} and {@link Logger}.
 */
export function getLogging() {
	const options: LoggingOptions = {
		logLevel: LogLevel.TRACE,
		target: { write: jest.fn() }
	};

	const logger = new Logger("Mock", options);
	const loggerFactory = new LoggerFactory(options);

	jest.spyOn(loggerFactory, "createLogger").mockReturnValue(logger);

	return {
		logger,
		loggerFactory
	};
}
