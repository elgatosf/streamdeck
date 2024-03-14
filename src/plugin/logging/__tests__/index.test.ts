import path from "node:path";
import * as utils from "../../common/utils";
import { type FileTargetOptions } from "../file-target";
import { LogLevel } from "../log-level";
import { type LoggerOptions } from "../logger";

jest.mock("../../common/utils", () => {
	return {
		get: jest.fn(),
		getPluginUUID: jest.fn().mockReturnValue("com.elgato.test"),
		isDebugMode: jest.fn()
	} satisfies typeof import("../../common/utils");
});

jest.mock("../file-target");
jest.mock("../logger");

describe("createLogger", () => {
	const mockedCwd = path.join("stream-deck", "tests");

	beforeEach(() => jest.spyOn(process, "cwd").mockReturnValue(mockedCwd));
	afterEach(() => jest.resetModules());

	describe("default log level", () => {
		/**
		 * Asserts the default logger has {@link LogLevel.DEBUG} when debug mode is `true`.
		 */
		it("is DEBUG when isDebugMode() is true", async () => {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(true);
			const spyOnFileTarget = jest.spyOn(await require("../file-target"), "FileTarget");
			const { Logger } = await require("../logger");

			// Act.
			await require("../index");

			// Assert.
			expect(spyOnFileTarget).toHaveBeenCalledTimes(1);
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: LogLevel.DEBUG,
				target: spyOnFileTarget.mock.instances[0]
			});
		});

		/**
		 * Asserts the default logger has {@link LogLevel.INFO} when debug mode is `false`.
		 */
		it("is INFO when isDebugMode() is false", async () => {
			// Arrange.
			jest.spyOn(utils, "isDebugMode").mockReturnValue(false);
			const spyOnFileTarget = jest.spyOn(await require("../file-target"), "FileTarget");
			const { Logger } = await require("../logger");

			// Act.
			await require("../index");

			// Assert.
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: LogLevel.INFO,
				target: spyOnFileTarget.mock.instances[0]
			});
		});
	});

	/**
	 * Asserts the file target is initialized based on the cwd, and the plugin's UUID.
	 */
	it("initializes the file target from the cwd", async () => {
		// Arrange.
		jest.spyOn(utils, "isDebugMode").mockReturnValue(false);
		const { FileTarget } = await require("../file-target");

		// Act.
		await require("../index");

		// Assert.
		expect(FileTarget).toHaveBeenLastCalledWith<[FileTargetOptions]>({
			dest: path.join(mockedCwd, "logs"),
			fileName: "com.elgato.test",
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
});
