import { LogLevel } from "../level";
import { Logger, LoggerOptions } from "../logger";
import { LogEntry, LogTarget } from "../target";

describe("Logger", () => {
	/**
	 * Asserts the {@link Logger} clones options on construction.
	 */
	it("Clones options on construction", () => {
		// Arrange.
		const options: LoggerOptions = {
			isDebugMode: false,
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
			data: ["Hello world"],
			level: LogLevel.INFO,
			scope: ""
		});
	});

	/**
	 * Asserts {@link Logger} correctly supplies all log entry data.
	 */
	describe("Supplies all log entry data", () => {
		it.each([
			{
				scopes: [],
				scope: ""
			},
			{
				scopes: ["Foo "],
				scope: "Foo"
			},
			{
				scopes: ["Foo", "  "],
				scope: "Foo"
			},
			{
				scopes: [" Hello", "World"],
				scope: "Hello->World"
			},
			{
				scopes: ["One", " Two ", "Three"],
				scope: "One->Two->Three"
			}
		])("When scopes are $scopes", ({ scopes, scope }) => {
			// Arrange.
			const target = { write: jest.fn() };
			const parent = new Logger({
				isDebugMode: true,
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
				data: [
					"Log error",
					expect.objectContaining({
						message: "error"
					})
				],
				scope
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(2, {
				level: LogLevel.WARN,
				data: [
					"Log warn",
					expect.objectContaining({
						message: "warn"
					})
				],
				scope
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(3, {
				level: LogLevel.INFO,
				data: [
					"Log info",
					expect.objectContaining({
						message: "info"
					})
				],
				scope
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(4, {
				level: LogLevel.DEBUG,
				data: [
					"Log debug",
					expect.objectContaining({
						message: "debug"
					})
				],
				scope
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(5, {
				level: LogLevel.TRACE,
				data: [
					"Log trace",
					expect.objectContaining({
						message: "trace"
					})
				],
				scope
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
			const target = { write: jest.fn() };
			const logger = new Logger({
				isDebugMode: true,
				level,
				target
			});

			// Act.
			act(logger);

			// Assert.
			expect(target.write).toHaveBeenCalledTimes(expectLog ? 1 : 0);
		}
	});

	describe("setLogLevel", () => {
		/**
		 * Asserts scoped {@link Logger} inherit the {@link LogLevel} of their parent.
		 */
		it("Inherited by scoped loggers", () => {
			// Arrange.
			const parent = new Logger({
				isDebugMode: false,
				level: LogLevel.ERROR,
				target: { write: jest.fn() }
			});

			// Act.
			const childBefore = parent.createScope("Child (Before)");
			const grandchildBefore = childBefore.createScope("Grandchild (Before)");

			parent.setLevel(LogLevel.INFO);
			const childAfter = parent.createScope("Child (After)");

			// Assert.
			expect(parent.level).toBe(LogLevel.INFO);
			expect(childBefore.level).toBe(LogLevel.INFO);
			expect(grandchildBefore.level).toBe(LogLevel.INFO);
			expect(childAfter.level).toBe(LogLevel.INFO);
		});

		/**
		 * Asserts scoped {@link Logger} inherit the {@link LogLevel} of their earliest parent that has an explicit {@link LogLevel} defined.
		 */
		it("Inherited from parents with defined log-level", () => {
			// Arrange.
			const parent = new Logger({
				isDebugMode: false,
				level: LogLevel.ERROR,
				target: { write: jest.fn() }
			});

			// Act.
			const child = parent.createScope("Child");
			const grandchild = child.createScope("Grandchild");

			child.setLevel(LogLevel.WARN);
			parent.setLevel(LogLevel.INFO);

			// Assert.
			expect(parent.level).toBe(LogLevel.INFO);
			expect(child.level).toBe(LogLevel.WARN);
			expect(grandchild.level).toBe(LogLevel.WARN);
		});

		/**
		 * Asserts scoped {@link Logger} inherit the {@link LogLevel}, from their parent, when resetting the {@link LogLevel}.
		 */
		it("Defaults when set to undefined", () => {
			// Arrange.
			const parent = new Logger({
				isDebugMode: false,
				level: LogLevel.ERROR,
				target: { write: jest.fn() }
			});

			// Act (1).
			const child = parent.createScope("Child");
			const grandchild = child.createScope("Grandchild");

			child.setLevel(LogLevel.WARN);
			parent.setLevel(LogLevel.INFO);
			child.setLevel();

			// Assert (1).
			expect(parent.level).toBe(LogLevel.INFO);
			expect(child.level).toBe(LogLevel.INFO);
			expect(grandchild.level).toBe(LogLevel.INFO);
		});
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
				const options: LoggerOptions = {
					isDebugMode,
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
						data: [`Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`],
						scope: ""
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
				const options: LoggerOptions = {
					isDebugMode,
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
						data: [`Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`],
						scope: ""
					});
				}
			});
		});
	});
});
