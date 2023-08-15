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
	 * Asserts validating the {@link LogLevel} can be set based on the environment.
	 */
	describe("Validate log-level", () => {
		const testCases = [
			{
				isDebugMode: false,
				level: "ERROR",
				logLevel: LogLevel.ERROR,
				expected: LogLevel.ERROR
			},
			{
				isDebugMode: true,
				level: "ERROR",
				logLevel: LogLevel.ERROR,
				expected: LogLevel.ERROR
			},
			{
				isDebugMode: false,
				level: "WARN",
				logLevel: LogLevel.WARN,
				expected: LogLevel.WARN
			},
			{
				isDebugMode: true,
				level: "WARN",
				logLevel: LogLevel.WARN,
				expected: LogLevel.WARN
			},
			{
				isDebugMode: false,
				level: "INFO",
				logLevel: LogLevel.INFO,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: true,
				level: "INFO",
				logLevel: LogLevel.INFO,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: false,
				level: "DEBUG",
				logLevel: LogLevel.DEBUG,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: true,
				level: "DEBUG",
				logLevel: LogLevel.DEBUG,
				expected: LogLevel.DEBUG
			},
			{
				isDebugMode: false,
				level: "TRACE",
				logLevel: LogLevel.TRACE,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: true,
				level: "TRACE",
				logLevel: LogLevel.TRACE,
				expected: LogLevel.TRACE
			}
		];

		/**
		 * Asserts {@link LoggerFactory} validates the {@link LogLevel} on construction.
		 */
		describe("Construction", () => {
			it.each(testCases)("$level when debug is $isDebugMode", ({ logLevel, expected, isDebugMode }) => {
				// Arrange.
				(utils as any).isDebugMode = isDebugMode;
				const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

				const loggerSpy = jest.spyOn(loggerModule, "Logger");
				const options: LoggingOptions = {
					logLevel,
					target: { write: jest.fn() }
				};

				// Act.
				new LoggerFactory(options);

				// Assert.
				expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(expected);
				expect(loggerSpy.mock.instances[0].warn).toHaveBeenCalledTimes(logLevel !== expected ? 1 : 0);
			});
		});

		/**
		 * Asserts {@link LoggerFactory.setLogLevel} validates teh {@link LogLevel}.
		 */
		describe("setLogLevel", () => {
			it.each(testCases)("$level when debug is $isDebugMode", ({ logLevel, expected, isDebugMode }) => {
				// Arrange.
				(utils as any).isDebugMode = isDebugMode;
				const { LoggerFactory } = require("../logger-factory") as typeof import("../logger-factory");

				const loggerSpy = jest.spyOn(loggerModule, "Logger");
				const options: LoggingOptions = {
					logLevel: LogLevel.ERROR,
					target: { write: jest.fn() }
				};

				const loggerFactory = new LoggerFactory(options);
				let expectedChange = logLevel === expected;

				// Act.
				const didChange = loggerFactory.setLogLevel(logLevel);

				// Assert
				expect(didChange).toBe(expectedChange);
				expect(loggerSpy.mock.instances[0].warn).toHaveBeenCalledTimes(expectedChange ? 0 : 1);

				if (didChange) {
					expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(logLevel);
				} else {
					expect(loggerSpy.mock.calls[0][1].logLevel).toEqual(LogLevel.ERROR);
				}
			});
		});
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
