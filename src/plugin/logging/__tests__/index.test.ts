import path from "node:path";
import { LogLevel, type LoggerOptions } from "../../../common/logging";
import { ConsoleTarget } from "../../../common/logging/console-target";
import { type FileTargetOptions } from "../file-target";

jest.mock("../file-target");
jest.mock("../../../common/logging");
jest.mock("../../common/utils");

describe("createLogger", () => {
	const mockedCwd = path.join("stream-deck", "tests");
	let utils: typeof import("../../common/utils");

	beforeEach(async () => {
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);

		utils = await require("../../common/utils");
		jest.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
	});

	afterEach(() => {
		jest.resetModules();
		jest.resetAllMocks();
	});

	describe("default log level", () => {
		/**
		 * Asserts the default logger has {@link LogLevel.DEBUG} when debug mode is `true`.
		 */
		it("is DEBUG when isDebugMode() is true", async () => {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(true);
			const spyOnFileTarget = jest.spyOn(await require("../file-target"), "FileTarget");
			const { Logger } = await require("../../../common/logging");

			// Act.
			await require("../index");

			// Assert.
			expect(spyOnFileTarget).toHaveBeenCalledTimes(1);
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: LogLevel.DEBUG,
				minimumLevel: LogLevel.TRACE,
				targets: [expect.any(ConsoleTarget), spyOnFileTarget.mock.instances[0]]
			});
		});

		/**
		 * Asserts the default logger has {@link LogLevel.INFO} when debug mode is `false`.
		 */
		it("is INFO when isDebugMode() is false", async () => {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(false);
			const spyOnFileTarget = jest.spyOn(await require("../file-target"), "FileTarget");
			const { Logger } = await require("../../../common/logging");

			// Act.
			await require("../index");

			// Assert.
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: LogLevel.INFO,
				minimumLevel: LogLevel.INFO,
				targets: [spyOnFileTarget.mock.instances[0]]
			});
		});
	});

	/**
	 * Asserts the file target is initialized based on the cwd, and the plugin's UUID.
	 */
	it("initializes the file target from the cwd", async () => {
		// Arrange.
		jest.spyOn(utils, "isDebugMode").mockReturnValue(false);
		const { FileTarget } = (await require("../file-target")) as typeof import("../file-target");
		const { stringFormatter } = (await require("../../../common/logging")) as typeof import("../../../common/logging");

		// Act.
		await require("../index");

		// Assert.
		expect(FileTarget).toHaveBeenLastCalledWith<[FileTargetOptions]>({
			dest: path.join(mockedCwd, "logs"),
			fileName: "com.elgato.test",
			format: stringFormatter(),
			maxFileCount: 10,
			maxSize: 50 * 1024 * 1024
		});
	});

	/**
	 * Asserts the default logger listens for uncaught exceptions.
	 */
	it("logs when an uncaught exception is thrown", async () => {
		// Arrange.
		const spyOnProcessOnce = jest.spyOn(process, "once");
		const { logger } = await require("../index");
		const spyOnLogger = jest.spyOn(logger, "error");

		// Act.
		const err = new Error("Hello world");
		spyOnProcessOnce.mock.calls[0][1](err);

		// Assert.
		expect(spyOnProcessOnce).toHaveBeenCalledTimes(1);
		expect(spyOnProcessOnce).toHaveBeenCalledWith("uncaughtException", expect.any(Function));
		expect(spyOnLogger).toHaveBeenCalledTimes(1);
		expect(spyOnLogger).toHaveBeenCalledWith<[string, Error]>("Process encountered uncaught exception", err);
	});

	/**
	 * Asserts the exports of "./index".
	 */
	describe("exports", () => {
		test("LogLevel", async () => {
			// Arrange, act, assert.
			const { LogLevel } = await require("../index");
			expect(LogLevel).toBe(LogLevel);
		});

		test("Logger", async () => {
			// Arrange, act, assert.
			const { Logger } = await require("../index");
			expect(Logger).toBe(Logger);
		});
	});
});
