import * as utils from "../../common/utils";
import { LogLevel } from "../log-level";
import { Logger } from "../logger";
import type { LoggingOptions } from "../logger-factory";
import { LoggerFactory } from "../logger-factory";

jest.mock("../../common/utils");
jest.mock("../logger");

describe("LoggerFactory", () => {
	afterEach(() => jest.resetAllMocks());

	/**
	 * Asserts {@link LoggerFactory} creates its own logger on construction.
	 */
	it("Creates the LoggerFactory logger on construction", () => {
		// Arrange.
		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		// Act.
		new LoggerFactory(options);

		// Assert
		expect(Logger).toHaveBeenCalledTimes(1);
		expect(Logger).toHaveBeenNthCalledWith(1, "LoggerFactory", options);
	});

	/**
	 * Asserts {@link LoggerFactory} clones options on constructor.
	 */
	it("Clones options on construction", () => {
		// Arrange.
		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		const loggerFactory = new LoggerFactory(options);

		// Act.
		loggerFactory.setLogLevel(LogLevel.ERROR);

		// Assert
		expect(options.logLevel).toBe(LogLevel.INFO);
		expect((Logger as jest.MockedClass<typeof Logger>).mock.calls[0][1].logLevel).toEqual(LogLevel.ERROR);
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
				jest.spyOn(utils, "isDebugMode").mockReturnValue(isDebugMode);

				const options: LoggingOptions = {
					logLevel,
					target: { write: jest.fn() }
				};

				// Act.
				new LoggerFactory(options);

				// Assert.
				expect((Logger as jest.MockedClass<typeof Logger>).mock.calls[0][1].logLevel).toEqual(expected);
				expect(Logger.prototype.warn).toHaveBeenCalledTimes(logLevel !== expected ? 1 : 0);
			});
		});

		/**
		 * Asserts {@link LoggerFactory.setLogLevel} validates teh {@link LogLevel}.
		 */
		describe("setLogLevel", () => {
			it.each(testCases)("$level when debug is $isDebugMode", ({ logLevel, expected, isDebugMode }) => {
				// Arrange.
				jest.spyOn(utils, "isDebugMode").mockReturnValue(isDebugMode);

				const options: LoggingOptions = {
					logLevel: LogLevel.ERROR,
					target: { write: jest.fn() }
				};

				const loggerFactory = new LoggerFactory(options);
				const expectedChange = logLevel === expected;

				// Act.
				const didChange = loggerFactory.setLogLevel(logLevel);

				// Assert
				expect(didChange).toBe(expectedChange);
				expect(Logger.prototype.warn).toHaveBeenCalledTimes(expectedChange ? 0 : 1);

				if (didChange) {
					expect((Logger as jest.MockedClass<typeof Logger>).mock.calls[0][1].logLevel).toEqual(logLevel);
				} else {
					expect((Logger as jest.MockedClass<typeof Logger>).mock.calls[0][1].logLevel).toEqual(LogLevel.ERROR);
				}
			});
		});
	});

	/**
	 * Asserts {@link LoggerFactory.createLogger} creates a scoped {@link Logger}.
	 */
	it("Creates a scoped logger", () => {
		// Arrange.
		const options: LoggingOptions = {
			logLevel: LogLevel.INFO,
			target: { write: jest.fn() }
		};

		const loggerFactory = new LoggerFactory(options);

		// Act.
		const logger = loggerFactory.createLogger("Foo");

		// Assert
		expect(logger).toBeInstanceOf(Logger);
		expect(Logger).toHaveBeenCalledTimes(2);
		expect(Logger).toHaveBeenNthCalledWith(2, "Foo", options);
	});

	/**
	 * Asserts {@link LoggerFactory.createLogger} creates a scoped {@link Logger}.
	 */
	it("Re-uses loggers", () => {
		// Arrange.
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
