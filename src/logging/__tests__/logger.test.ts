import * as utils from "../../common/utils";
import { LogLevel } from "../log-level";
import { LogEntry, LogTarget } from "../log-target";
import { Logger, LoggerOptions } from "../logger";

jest.mock("../../common/utils");

describe("Logger", () => {
	afterEach(() => jest.resetAllMocks());

	/**
	 * Asserts the {@link Logger} clones options on construction.
	 */
	it("Clones options on construction", () => {
		// Arrange.
		const options: LoggerOptions = {
			level: LogLevel.ERROR,
			target: { write: jest.fn() }
		};

		const logger = new Logger(options);

		// Act.
		logger.setLevel(LogLevel.INFO);
		logger.info("Hello world");

		// Assert
		expect(logger.level).toBe(LogLevel.INFO);
		expect(options.level).toBe(LogLevel.ERROR);
		expect(options.target.write).toHaveBeenCalledTimes(1);
		expect(options.target.write).toHaveBeenCalledWith<[LogEntry]>({
			level: LogLevel.INFO,
			message: "Hello world"
		});
	});

	/**
	 * Asserts {@link Logger} correctly formats an empty name when writing messages.
	 */
	describe("Formats with unscoped log entires", () => {
		it.each([[undefined], [""], ["    "]])("When scope is '%s'", (scope) => {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(true);

			const target = { write: jest.fn() };
			const logger = new Logger({
				level: LogLevel.TRACE,
				scope,
				target
			});

			// Act.
			logger.error("Log error", new Error("error"));
			logger.warn("Log warn", new Error("warn"));
			logger.info("Log info", new Error("info"));
			logger.debug("Log debug", new Error("debug"));
			logger.trace("Log trace", new Error("trace"));

			// Assert.
			expect(target.write).toHaveBeenCalledTimes(5);
			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(1, {
				level: LogLevel.ERROR,
				message: "Log error",
				error: expect.objectContaining({
					message: "error"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(2, {
				level: LogLevel.WARN,
				message: "Log warn",
				error: expect.objectContaining({
					message: "warn"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(3, {
				level: LogLevel.INFO,
				message: "Log info",
				error: expect.objectContaining({
					message: "info"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(4, {
				level: LogLevel.DEBUG,
				message: "Log debug",
				error: expect.objectContaining({
					message: "debug"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(5, {
				level: LogLevel.TRACE,
				message: "Log trace",
				error: expect.objectContaining({
					message: "trace"
				})
			});
		});
	});

	/**
	 * Asserts {@link Logger} correctly formats scoped entries.
	 */
	describe("Formats scoped log entries", () => {
		it.each([
			{
				scopes: ["Foo "],
				expectedPrefix: "Foo: "
			},
			{
				scopes: ["Foo", "  "],
				expectedPrefix: "Foo: "
			},
			{
				scopes: [" Hello", "World"],
				expectedPrefix: "Hello->World: "
			},
			{
				scopes: ["One", " Two ", "Three"],
				expectedPrefix: "One->Two->Three: "
			}
		])("When scopes are $scopes", ({ scopes, expectedPrefix }) => {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(true);

			const target = { write: jest.fn() };
			const parent = new Logger({
				level: LogLevel.TRACE,
				target
			});

			const logger = scopes.reduce((prev, current) => prev.createScope(current), parent);

			// Act.
			logger.error("Log error", new Error("error"));
			logger.warn("Log warn", new Error("warn"));
			logger.info("Log info", new Error("info"));
			logger.debug("Log debug", new Error("debug"));
			logger.trace("Log trace", new Error("trace"));

			// Assert.
			expect(target.write).toHaveBeenCalledTimes(5);
			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(1, {
				level: LogLevel.ERROR,
				message: `${expectedPrefix}Log error`,
				error: expect.objectContaining({
					message: "error"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(2, {
				level: LogLevel.WARN,
				message: `${expectedPrefix}Log warn`,
				error: expect.objectContaining({
					message: "warn"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(3, {
				level: LogLevel.INFO,
				message: `${expectedPrefix}Log info`,
				error: expect.objectContaining({
					message: "info"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(4, {
				level: LogLevel.DEBUG,
				message: `${expectedPrefix}Log debug`,
				error: expect.objectContaining({
					message: "debug"
				})
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(5, {
				level: LogLevel.TRACE,
				message: `${expectedPrefix}Log trace`,
				error: expect.objectContaining({
					message: "trace"
				})
			});
		});
	});

	/**
	 * Asserts {@link Logger} only writes messages to the {@link LogTarget} when the log-level is allowed.
	 */
	describe("Checks the log level before forwarding to target", () => {
		let level: LogLevel;

		describe("ERROR", () => {
			beforeAll(() => (level = LogLevel.ERROR));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does not log WARN", () => verify((logger) => logger.warn("warn"), false));
			it("Does not log INFO", () => verify((logger) => logger.info("info"), false));
			it("Does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("WARN", () => {
			beforeAll(() => (level = LogLevel.WARN));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does not log INFO", () => verify((logger) => logger.info("info"), false));
			it("Does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("INFO", () => {
			beforeAll(() => (level = LogLevel.INFO));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does log INFO", () => verify((logger) => logger.info("info"), true));
			it("Does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("DEBUG", () => {
			beforeAll(() => (level = LogLevel.DEBUG));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does log INFO", () => verify((logger) => logger.info("info"), true));
			it("Does log DEBUG", () => verify((logger) => logger.debug("debug"), true));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("TRACE", () => {
			beforeAll(() => (level = LogLevel.TRACE));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does log INFO", () => verify((logger) => logger.info("info"), true));
			it("Does log DEBUG", () => verify((logger) => logger.debug("debug"), true));
			it("Does log TRACE", () => verify((logger) => logger.trace("trace"), true));
		});

		/**
		 * Asserts {@link Logger} correctly does, or does not, log a message of a specific level, based on the {@link LogLevel} associated with the logger.
		 * @param act Function responsible for logging to the {@link Logger}, e.g. {@link Logger.error}, {@link Logger.warn}, etc.
		 * @param expectLog Whether a log was expected to be written.
		 */
		function verify(act: (logger: Logger) => void, expectLog: boolean) {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(true);

			const target = { write: jest.fn() };
			const logger = new Logger({
				level,
				target
			});

			// Act.
			act(logger);

			// Assert.
			expect(target.write).toHaveBeenCalledTimes(expectLog ? 1 : 0);
		}
	});

	/**
	 * Asserts validating the {@link LogLevel} can be set based on the environment.
	 */
	describe("Log-level validation", () => {
		const testCases = [
			{
				isDebugMode: false,
				name: "Can be ERROR",
				level: LogLevel.ERROR,
				expected: LogLevel.ERROR
			},
			{
				isDebugMode: true,
				name: "Can be ERROR",
				level: LogLevel.ERROR,
				expected: LogLevel.ERROR
			},
			{
				isDebugMode: false,
				name: "Can be WARN",
				level: LogLevel.WARN,
				expected: LogLevel.WARN
			},
			{
				isDebugMode: true,
				name: "Can be WARN",
				level: LogLevel.WARN,
				expected: LogLevel.WARN
			},
			{
				isDebugMode: false,
				name: "Can be INFO",
				level: LogLevel.INFO,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: true,
				name: "Can be INFO",
				level: LogLevel.INFO,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: false,
				name: "Cannot be DEBUG",
				level: LogLevel.DEBUG,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: true,
				name: "Can be DEBUG",
				level: LogLevel.DEBUG,
				expected: LogLevel.DEBUG
			},
			{
				isDebugMode: false,
				name: "Cannot be TRACE",
				level: LogLevel.TRACE,
				expected: LogLevel.INFO
			},
			{
				isDebugMode: true,
				name: "Can be TRACE",
				level: LogLevel.TRACE,
				expected: LogLevel.TRACE
			}
		];

		/**
		 * Asserts the {@link Logger} validates the {@link LogLevel} on construction.
		 */
		describe("Construction", () => {
			it.each(testCases)("$name when isDebugMode is $isDebugMode", ({ level, expected, isDebugMode }) => {
				// Arrange.
				jest.spyOn(utils, "isDebugMode").mockReturnValue(isDebugMode);

				const options: LoggerOptions = {
					level,
					target: { write: jest.fn() }
				};

				// Act.
				const logger = new Logger(options);

				// Assert.
				expect(logger.level).toBe(expected);

				if (level === expected) {
					expect(options.target.write).toHaveBeenCalledTimes(0);
				} else {
					expect(options.target.write).toHaveBeenCalledTimes(1);
					expect(options.target.write).toHaveBeenCalledWith<[LogEntry]>({
						level: LogLevel.WARN,
						message: `Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`
					});
				}
			});
		});

		/**
		 * Asserts {@link Logger.setLogLevel} validates teh {@link LogLevel}.
		 */
		describe("setLevel", () => {
			it.each(testCases)("$name when isDebugMode is $isDebugMode", ({ level, expected, isDebugMode }) => {
				// Arrange.
				jest.spyOn(utils, "isDebugMode").mockReturnValue(isDebugMode);

				const options: LoggerOptions = {
					level: LogLevel.ERROR,
					target: { write: jest.fn() }
				};

				const logger = new Logger(options);

				// Act.
				logger.setLevel(level);

				// Assert.
				expect(logger.level).toBe(expected);

				if (level === expected) {
					expect(options.target.write).toHaveBeenCalledTimes(0);
				} else {
					expect(options.target.write).toHaveBeenCalledTimes(1);
					expect(options.target.write).toHaveBeenCalledWith<[LogEntry]>({
						level: LogLevel.WARN,
						message: `Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`
					});
				}
			});
		});
	});
});
