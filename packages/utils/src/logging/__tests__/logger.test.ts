import { beforeAll, describe, expect, it, vi } from "vitest";

import { type LogEntry, Logger, type LoggerOptions, type LogLevel, type LogTarget } from "../index.js";

describe("Logger", () => {
	/**
	 * Asserts the {@link Logger} clones options on construction.
	 */
	it("clones options on construction", () => {
		// Arrange.
		const options: LoggerOptions = {
			level: "error",
			targets: [{ write: vi.fn() }],
		};

		const logger = new Logger(options);

		// Act.
		logger.setLevel("info");
		logger.info("Hello world");

		// Assert
		expect(logger.level).toBe("info");
		expect(options.level).toBe("error");
		expect(options.targets[0].write).toHaveBeenCalledTimes(1);
		expect(options.targets[0].write).toHaveBeenCalledWith<[LogEntry]>({
			data: ["Hello world"],
			level: "info",
			scope: "",
		});
	});

	/**
	 * Asserts {@link Logger.write} logs to all targets
	 */
	it("writes to all targets", () => {
		// Arrange.
		const options: LoggerOptions = {
			level: "info",
			targets: [{ write: vi.fn() }, { write: vi.fn() }, { write: vi.fn() }],
		};

		const logger = new Logger(options);

		// Act.
		logger.info("Hello world");

		// Assert
		const entry: LogEntry = {
			data: ["Hello world"],
			level: "info",
			scope: "",
		};

		expect(options.targets[0].write).toBeCalledTimes(1);
		expect(options.targets[0].write).toHaveBeenCalledWith(entry);
		expect(options.targets[1].write).toBeCalledTimes(1);
		expect(options.targets[1].write).toHaveBeenCalledWith(entry);
		expect(options.targets[2].write).toBeCalledTimes(1);
		expect(options.targets[2].write).toHaveBeenCalledWith(entry);
	});

	/**
	 * Asserts {@link Logger} correctly supplies all log entry data.
	 */
	describe("supplies all log entry data", () => {
		it.each([
			{
				scopes: [],
				scope: "",
			},
			{
				scopes: ["Foo "],
				scope: "Foo",
			},
			{
				scopes: ["Foo", "  "],
				scope: "Foo",
			},
			{
				scopes: [" Hello", "World"],
				scope: "Hello->World",
			},
			{
				scopes: ["One", " Two ", "Three"],
				scope: "One->Two->Three",
			},
		])("When scopes are $scopes", ({ scopes, scope }) => {
			// Arrange.
			const target = { write: vi.fn() };
			const parent = new Logger({
				level: "trace",
				minimumLevel: "trace",
				targets: [target],
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
				level: "error",
				data: [
					"Log error",
					expect.objectContaining({
						message: "error",
					}),
				],
				scope,
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(2, {
				level: "warn",
				data: [
					"Log warn",
					expect.objectContaining({
						message: "warn",
					}),
				],
				scope,
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(3, {
				level: "info",
				data: [
					"Log info",
					expect.objectContaining({
						message: "info",
					}),
				],
				scope,
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(4, {
				level: "debug",
				data: [
					"Log debug",
					expect.objectContaining({
						message: "debug",
					}),
				],
				scope,
			});

			expect(target.write).toHaveBeenNthCalledWith<[LogEntry]>(5, {
				level: "trace",
				data: [
					"Log trace",
					expect.objectContaining({
						message: "trace",
					}),
				],
				scope,
			});
		});
	});

	/**
	 * Asserts {@link Logger} only writes messages to the {@link LogTarget} when the log-level is allowed.
	 */
	describe("checks the log level before forwarding to target", () => {
		let level: LogLevel;

		describe("ERROR", () => {
			beforeAll(() => (level = "error"));

			it("does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("does not log WARN", () => verify((logger) => logger.warn("warn"), false));
			it("does not log INFO", () => verify((logger) => logger.info("info"), false));
			it("does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("WARN", () => {
			beforeAll(() => (level = "warn"));

			it("does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("does not log INFO", () => verify((logger) => logger.info("info"), false));
			it("does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("INFO", () => {
			beforeAll(() => (level = "info"));

			it("does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("does log INFO", () => verify((logger) => logger.info("info"), true));
			it("does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("DEBUG", () => {
			beforeAll(() => (level = "debug"));

			it("does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("does log INFO", () => verify((logger) => logger.info("info"), true));
			it("does log DEBUG", () => verify((logger) => logger.debug("debug"), true));
			it("does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("TRACE", () => {
			beforeAll(() => (level = "trace"));

			it("does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("does log INFO", () => verify((logger) => logger.info("info"), true));
			it("does log DEBUG", () => verify((logger) => logger.debug("debug"), true));
			it("does log TRACE", () => verify((logger) => logger.trace("trace"), true));
		});

		/**
		 * Asserts {@link Logger} correctly does, or does not, log a message of a specific level, based on the {@link LogLevel} associated with the logger.
		 * @param act Function responsible for logging to the {@link Logger}, e.g. {@link Logger.error}, {@link Logger.warn}, etc.
		 * @param expectLog Whether a log was expected to be written.
		 */
		function verify(act: (logger: Logger) => void, expectLog: boolean) {
			// Arrange.
			const target = { write: vi.fn() };
			const logger = new Logger({
				level,
				minimumLevel: "trace",
				targets: [target],
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
		it("inherited by scoped loggers", () => {
			// Arrange.
			const parent = new Logger({
				level: "error",
				targets: [{ write: vi.fn() }],
			});

			// Act.
			const childBefore = parent.createScope("Child (Before)");
			const grandchildBefore = childBefore.createScope("Grandchild (Before)");

			parent.setLevel("info");
			const childAfter = parent.createScope("Child (After)");

			// Assert.
			expect(parent.level).toBe("info");
			expect(childBefore.level).toBe("info");
			expect(grandchildBefore.level).toBe("info");
			expect(childAfter.level).toBe("info");
		});

		/**
		 * Asserts scoped {@link Logger} inherit the {@link LogLevel} of their earliest parent that has an explicit {@link LogLevel} defined.
		 */
		it("inherited from parents with defined log-level", () => {
			// Arrange.
			const parent = new Logger({
				level: "error",
				targets: [{ write: vi.fn() }],
			});

			// Act.
			const child = parent.createScope("Child");
			const grandchild = child.createScope("Grandchild");

			child.setLevel("warn");
			parent.setLevel("info");

			// Assert.
			expect(parent.level).toBe("info");
			expect(child.level).toBe("warn");
			expect(grandchild.level).toBe("warn");
		});

		/**
		 * Asserts scoped {@link Logger} inherit the {@link LogLevel}, from their parent, when resetting the {@link LogLevel}.
		 */
		it("defaults when set to undefined", () => {
			// Arrange.
			const parent = new Logger({
				level: "error",
				targets: [{ write: vi.fn() }],
			});

			// Act (1).
			const child = parent.createScope("Child");
			const grandchild = child.createScope("Grandchild");

			child.setLevel("warn");
			parent.setLevel("info");
			child.setLevel();

			// Assert (1).
			expect(parent.level).toBe("info");
			expect(child.level).toBe("info");
			expect(grandchild.level).toBe("info");
		});
	});

	/**
	 * Asserts validating the {@link LogLevel} can be set based on the environment.
	 */
	describe("log-level validation", () => {
		const testCases = [
			{
				minimumLevel: "info",
				name: "Can be ERROR",
				level: "error" as const,
				expected: "error",
			},
			{
				minimumLevel: "trace",
				name: "Can be ERROR",
				level: "error" as const,
				expected: "error",
			},
			{
				minimumLevel: "info",
				name: "Can be WARN",
				level: "warn" as const,
				expected: "warn",
			},
			{
				minimumLevel: "trace",
				name: "Can be WARN",
				level: "warn" as const,
				expected: "warn",
			},
			{
				minimumLevel: "info",
				name: "Can be INFO",
				level: "info" as const,
				expected: "info",
			},
			{
				minimumLevel: "trace",
				name: "Can be INFO",
				level: "info" as const,
				expected: "info",
			},
			{
				minimumLevel: "info",
				name: "Cannot be DEBUG",
				level: "debug" as const,
				expected: "info",
			},
			{
				minimumLevel: "trace",
				name: "Can be DEBUG",
				level: "debug" as const,
				expected: "debug",
			},
			{
				minimumLevel: "info",
				name: "Cannot be TRACE",
				level: "trace" as const,
				expected: "info",
			},
			{
				minimumLevel: "trace",
				name: "Can be TRACE",
				level: "trace" as const,
				expected: "trace",
			},
		];

		/**
		 * Asserts the {@link Logger} validates the {@link LogLevel} on construction.
		 */
		describe("construction", () => {
			it.each(testCases)("$name when minimumLevel is $minimumLevel", ({ level, expected, minimumLevel }) => {
				// Arrange.
				const options: LoggerOptions = {
					level,
					minimumLevel: minimumLevel as "info" | "trace",
					targets: [{ write: vi.fn() }],
				};

				// Act.
				const logger = new Logger(options);

				// Assert.
				expect(logger.level).toBe(expected);
			});
		});

		/**
		 * Asserts {@link Logger.setLogLevel} validates teh {@link LogLevel}.
		 */
		describe("setLevel", () => {
			it.each(testCases)("$name when minimumLevel is $minimumLevel", ({ level, expected, minimumLevel }) => {
				// Arrange.
				const options: LoggerOptions = {
					level: "error",
					minimumLevel: minimumLevel as "info" | "trace",
					targets: [{ write: vi.fn() }],
				};

				const logger = new Logger(options);

				// Act.
				logger.setLevel(level);

				// Assert.
				expect(logger.level).toBe(expected);
			});
		});
	});
});
