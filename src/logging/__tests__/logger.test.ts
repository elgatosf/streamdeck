import { LogLevel } from "../log-level";
import type { LogTarget } from "../log-target";
import { Logger } from "../logger";

describe("Logger", () => {
	/**
	 * Asserts {@link Logger} correctly formats an empty name when writing messages.
	 */
	it("Formats message with empty name", () => {
		// Arrange.
		const target = { write: jest.fn() };
		const logger = new Logger(undefined, {
			logLevel: LogLevel.TRACE,
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
		expect(target.write).toHaveBeenNthCalledWith(
			1,
			LogLevel.ERROR,
			"Log error",
			expect.objectContaining({
				message: "error"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			2,
			LogLevel.WARN,
			"Log warn",
			expect.objectContaining({
				message: "warn"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			3,
			LogLevel.INFO,
			"Log info",
			expect.objectContaining({
				message: "info"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			4,
			LogLevel.DEBUG,
			"Log debug",
			expect.objectContaining({
				message: "debug"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			5,
			LogLevel.TRACE,
			"Log trace",
			expect.objectContaining({
				message: "trace"
			})
		);
	});

	/**
	 * Asserts {@link Logger} correctly formats the name when writing messages.
	 */
	it("Formats message with name", () => {
		// Arrange.
		const target = { write: jest.fn() };
		const logger = new Logger("Foo", {
			logLevel: LogLevel.TRACE,
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
		expect(target.write).toHaveBeenNthCalledWith(
			1,
			LogLevel.ERROR,
			"Foo: Log error",
			expect.objectContaining({
				message: "error"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			2,
			LogLevel.WARN,
			"Foo: Log warn",
			expect.objectContaining({
				message: "warn"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			3,
			LogLevel.INFO,
			"Foo: Log info",
			expect.objectContaining({
				message: "info"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			4,
			LogLevel.DEBUG,
			"Foo: Log debug",
			expect.objectContaining({
				message: "debug"
			})
		);

		expect(target.write).toHaveBeenNthCalledWith(
			5,
			LogLevel.TRACE,
			"Foo: Log trace",
			expect.objectContaining({
				message: "trace"
			})
		);
	});

	/**
	 * Asserts {@link Logger} only writes messages to the {@link LogTarget} when the log-level is allowed.
	 */
	describe("Log level checks", () => {
		let logLevel: LogLevel;

		describe("ERROR", () => {
			beforeAll(() => (logLevel = LogLevel.ERROR));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does not log WARN", () => verify((logger) => logger.warn("warn"), false));
			it("Does not log INFO", () => verify((logger) => logger.info("info"), false));
			it("Does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("WARN", () => {
			beforeAll(() => (logLevel = LogLevel.WARN));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does not log INFO", () => verify((logger) => logger.info("info"), false));
			it("Does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("INFO", () => {
			beforeAll(() => (logLevel = LogLevel.INFO));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does log INFO", () => verify((logger) => logger.info("info"), true));
			it("Does not log DEBUG", () => verify((logger) => logger.debug("debug"), false));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("DEBUG", () => {
			beforeAll(() => (logLevel = LogLevel.DEBUG));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does log INFO", () => verify((logger) => logger.info("info"), true));
			it("Does log DEBUG", () => verify((logger) => logger.debug("debug"), true));
			it("Does not log TRACE", () => verify((logger) => logger.trace("trace"), false));
		});

		describe("DEBUG", () => {
			beforeAll(() => (logLevel = LogLevel.TRACE));

			it("Does log ERROR", () => verify((logger) => logger.error("error"), true));
			it("Does log WARN", () => verify((logger) => logger.warn("warn"), true));
			it("Does log INFO", () => verify((logger) => logger.info("info"), true));
			it("Does log DEBUG", () => verify((logger) => logger.debug("debug"), true));
			it("Does log TRACE", () => verify((logger) => logger.trace("trace"), true));
		});

		function verify(act: (logger: Logger) => void, expectLog: boolean) {
			// Arrange.
			const target = { write: jest.fn() };
			const logger = new Logger("Foo", {
				logLevel,
				target
			});

			// Act.
			act(logger);

			// Assert.
			expect(target.write).toHaveBeenCalledTimes(expectLog ? 1 : 0);
		}
	});
});
