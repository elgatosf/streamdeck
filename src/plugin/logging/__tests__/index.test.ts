import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type LoggerOptions, LogLevel } from "../../../common/logging";
import { ConsoleTarget } from "../../../common/logging/console-target";
import { type FileTargetOptions } from "../file-target";

vi.mock("../file-target");
vi.mock("../../../common/logging");
vi.mock("../../common/utils");

describe("createLogger", () => {
	const mockedCwd = path.join("stream-deck", "tests");
	let utils: typeof import("../../common/utils");

	beforeEach(async () => {
		vi.spyOn(process, "cwd").mockReturnValue(mockedCwd);

		utils = await import("../../common/utils");
		vi.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
	});

	afterEach(() => {
		vi.resetModules();
	});

	describe("default log level", () => {
		/**
		 * Asserts the default logger has {@link LogLevel.DEBUG} when debug mode is `true`.
		 */
		it("is DEBUG when isDebugMode() is true", async () => {
			// Arrange.
			vi.spyOn(utils, "isDebugMode").mockReturnValue(true);
			const spyOnFileTarget = vi.spyOn(await import("../file-target"), "FileTarget");
			const { Logger } = await import("../../../common/logging");

			// Act.
			await import("../index");

			// Assert.
			expect(spyOnFileTarget).toHaveBeenCalledTimes(1);
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: LogLevel.DEBUG,
				minimumLevel: LogLevel.TRACE,
				targets: [expect.any(ConsoleTarget), spyOnFileTarget.mock.instances[0]],
			});
		});

		/**
		 * Asserts the default logger has {@link LogLevel.INFO} when debug mode is `false`.
		 */
		it("is INFO when isDebugMode() is false", async () => {
			// Arrange.
			vi.spyOn(utils, "isDebugMode").mockReturnValue(false);
			const spyOnFileTarget = vi.spyOn(await import("../file-target"), "FileTarget");
			const { Logger } = await import("../../../common/logging");

			// Act.
			await import("../index");

			// Assert.
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: LogLevel.INFO,
				minimumLevel: LogLevel.DEBUG,
				targets: [spyOnFileTarget.mock.instances[0]],
			});
		});
	});

	/**
	 * Asserts the file target is initialized based on the cwd, and the plugin's UUID.
	 */
	it("initializes the file target from the cwd", async () => {
		// Arrange.
		vi.spyOn(utils, "isDebugMode").mockReturnValue(false);
		const { FileTarget } = await import("../file-target");
		const { stringFormatter } = await import("../../../common/logging");

		// Act.
		await import("../index");

		// Assert.
		expect(FileTarget).toHaveBeenLastCalledWith<[FileTargetOptions]>({
			dest: path.join(mockedCwd, "logs"),
			fileName: "com.elgato.test",
			format: stringFormatter(),
			maxFileCount: 10,
			maxSize: 50 * 1024 * 1024,
		});
	});

	/**
	 * Asserts the default logger listens for uncaught exceptions.
	 */
	it("logs when an uncaught exception is thrown", async () => {
		// Arrange.
		const spyOnProcessOnce = vi.spyOn(process, "once");
		const { logger } = await import("../index");
		const spyOnLogger = vi.spyOn(logger, "error");

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
