import { LogLevel } from "../log-level";
import type { LoggingOptions } from "../logger-factory";

describe("LoggerFactory", () => {
	let utils: typeof import("../../common/utils");
	let loggerModule: typeof import("../logger");
	let LoggerFactory: typeof import("../logger-factory").LoggerFactory;

	beforeEach(async () => {
		jest.doMock("../../common/utils", () => jest.createMockFromModule("../../common/utils"));
		utils = await require("../../common/utils");

		jest.doMock("../logger", () => jest.createMockFromModule("../logger"));
		loggerModule = await require("../logger");
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	/**
	 * Asserts {@link LoggerFactory} creates its own logger on construction.
	 */
	it("Creates the LoggerFactory logger on construction", () => {
		// Arrange.
		const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

		const loggerSpy = jest.spyOn(loggerModule, "Logger");
		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		// Act.
		const loggerFactory = new LoggerFactory(options);

		// Assert
		expect(loggerSpy).toHaveBeenCalledTimes(1);
		expect(loggerSpy).toHaveBeenNthCalledWith(1, "LoggerFactory", options);
	});

	/**
	 * Asserts {@link LoggerFactory} clones options on constructor.
	 */
	it("Clones options on construction", () => {
		// Arrange.
		const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");
		const loggerSpy = jest.spyOn(loggerModule, "Logger");

		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		const loggerFactory = new LoggerFactory(options);

		// Act.
		loggerFactory.setLogLevel(LogLevel.ERROR);

		// Assert
		expect(options.logLevel).toBe(LogLevel.INFO);
		console.log(loggerSpy.mock.calls);
		expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(LogLevel.ERROR);
	});

	/**
	 * Asserts {@link LoggerFactory} validates the {@link LogLevel} as part of the construction.
	 */
	describe("Validates log-level on construction", () => {
		describe("When debug mode is false", () => {
			beforeEach(() => ((utils as any).isDebugMode = false));

			it("Can be ERROR", () => verify(LogLevel.ERROR, LogLevel.ERROR));
			it("Can be WARN", () => verify(LogLevel.WARN, LogLevel.WARN));
			it("Can be INFO", () => verify(LogLevel.INFO, LogLevel.INFO));
			it("Cannot be DEBUG", () => verify(LogLevel.DEBUG, LogLevel.INFO));
			it("Cannot be TRACE", () => verify(LogLevel.TRACE, LogLevel.INFO));
		});

		describe("When debug mode is true", () => {
			beforeEach(() => ((utils as any).isDebugMode = true));

			it("Can be ERROR", () => verify(LogLevel.ERROR, LogLevel.ERROR));
			it("Can be WARN", () => verify(LogLevel.WARN, LogLevel.WARN));
			it("Can be INFO", () => verify(LogLevel.INFO, LogLevel.INFO));
			it("Can be DEBUG", () => verify(LogLevel.DEBUG, LogLevel.DEBUG));
			it("Can be TRACE", () => verify(LogLevel.TRACE, LogLevel.TRACE));
		});

		function verify(logLevel: LogLevel, expectedLogLevel: LogLevel) {
			// Arrange.
			const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

			const loggerSpy = jest.spyOn(loggerModule, "Logger");
			const options: LoggingOptions = {
				logLevel,
				target: { write: jest.fn() }
			};

			// Act.
			new LoggerFactory(options);

			// Assert
			expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(expectedLogLevel);
			expect(loggerSpy.mock.instances[0].warn).toHaveBeenCalledTimes(logLevel !== expectedLogLevel ? 1 : 0);
		}
	});

	/**
	 * Asserts {@link LoggerFactory} validates the {@link LogLevel} as part of {@link LoggerFactory.setLogLevel}.
	 */
	describe("Validates setLogLevel", () => {
		describe("When debug mode is false", () => {
			beforeEach(() => ((utils as any).isDebugMode = false));

			it("Can be set to ERROR", () => verify(LogLevel.WARN, LogLevel.ERROR, true));
			it("Can be set to WARN", () => verify(LogLevel.ERROR, LogLevel.WARN, true));
			it("Can be set to INFO", () => verify(LogLevel.ERROR, LogLevel.INFO, true));
			it("Cannot be set to DEBUG", () => verify(LogLevel.ERROR, LogLevel.DEBUG, false));
			it("Cannot be set to TRACE", () => verify(LogLevel.ERROR, LogLevel.TRACE, false));
		});

		describe("When debug mode is true", () => {
			beforeEach(() => ((utils as any).isDebugMode = true));

			it("Can be set to ERROR", () => verify(LogLevel.WARN, LogLevel.ERROR, true));
			it("Can be set to WARN", () => verify(LogLevel.ERROR, LogLevel.WARN, true));
			it("Can be set to INFO", () => verify(LogLevel.ERROR, LogLevel.INFO, true));
			it("Can be set to DEBUG", () => verify(LogLevel.ERROR, LogLevel.DEBUG, true));
			it("Can be set to TRACE", () => verify(LogLevel.ERROR, LogLevel.TRACE, true));
		});

		function verify(originalValue: LogLevel, newValue: LogLevel, expectedChange: boolean) {
			// Arrange.
			const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

			const loggerSpy = jest.spyOn(loggerModule, "Logger");
			const options: LoggingOptions = {
				logLevel: originalValue,
				target: { write: jest.fn() }
			};

			const loggerFactory = new LoggerFactory(options);

			// Act.
			const didChange = loggerFactory.setLogLevel(newValue);

			// Assert
			expect(didChange).toBe(expectedChange);
			expect(loggerSpy.mock.instances[0].warn).toHaveBeenCalledTimes(expectedChange ? 0 : 1);

			if (didChange) {
				expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(newValue);
			} else {
				expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(originalValue);
			}
		}
	});

	/**
	 * Asserts {@link LoggerFactory.createLogger} creates a scoped {@link Logger}.
	 */
	it("Creates a scoped logger", () => {
		// Arrange.
		const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

		const loggerSpy = jest.spyOn(loggerModule, "Logger");
		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		const loggerFactory = new LoggerFactory(options);

		// Act.
		const logger = loggerFactory.createLogger("Foo");

		// Assert
		expect(logger).toBeInstanceOf(loggerSpy);
		expect(loggerSpy).toHaveBeenCalledTimes(2);
		expect(loggerSpy).toHaveBeenNthCalledWith(2, "Foo", options);
	});

	/**
	 * Asserts {@link LoggerFactory.createLogger} creates a scoped {@link Logger}.
	 */
	it("Re-uses loggers", () => {
		// Arrange.
		const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

		const loggerSpy = jest.spyOn(loggerModule, "Logger");
		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		const loggerFactory = new LoggerFactory(options);

		// Act.
		const loggerOne = loggerFactory.createLogger("Foo");
		const loggerTwo = loggerFactory.createLogger("Foo");
		const loggerThree = loggerFactory.createLogger("Bar");

		// Assert
		expect(loggerOne).toStrictEqual(loggerTwo);
		expect(loggerOne).not.toStrictEqual(loggerThree);
	});
});
