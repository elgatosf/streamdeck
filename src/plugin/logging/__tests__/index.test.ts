import { ConsoleTarget, type LoggerOptions } from "@elgato/utils/logging";
import { type FileTargetOptions } from "@elgato/utils/logging/file-target";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../common/utils.js");
vi.mock("@elgato/utils/logging");
vi.mock("@elgato/utils/logging/file-target");

describe("createLogger", () => {
	const mockedCwd = path.join("stream-deck", "tests");
	let utils: typeof import("../../common/utils.js");

	beforeEach(async () => {
		vi.spyOn(process, "cwd").mockReturnValue(mockedCwd);

		utils = await import("../../common/utils.js");
		vi.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
	});

	afterEach(() => {
		vi.resetModules();
	});

	describe("default log level", () => {
		/**
		 * Asserts the default log level in development.
		 */
		it("is DEBUG when isDebugMode() is true", async () => {
			// Arrange.
			vi.spyOn(utils, "isDebugMode").mockReturnValue(true);
			const spyOnFileTarget = vi.spyOn(await import("@elgato/utils/logging/file-target"), "FileTarget");
			const { Logger } = await import("@elgato/utils/logging");

			// Act.
			await import("../index.js");

			// Assert.
			expect(spyOnFileTarget).toHaveBeenCalledTimes(1);
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: "debug",
				minimumLevel: "trace",
				targets: [expect.any(ConsoleTarget), spyOnFileTarget.mock.instances[0]],
			});
		});

		/**
		 * Asserts the default log level in production.
		 */
		it("is INFO when isDebugMode() is false", async () => {
			// Arrange.
			vi.spyOn(utils, "isDebugMode").mockReturnValue(false);
			const spyOnFileTarget = vi.spyOn(await import("@elgato/utils/logging/file-target"), "FileTarget");
			const { Logger } = await import("@elgato/utils/logging");

			// Act.
			await import("../index.js");

			// Assert.
			expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
				level: "info",
				minimumLevel: "debug",
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
		const { FileTarget } = await import("@elgato/utils/logging/file-target");
		const { stringFormatter } = await import("@elgato/utils/logging");

		// Act.
		await import("../index.js");

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
		const { logger } = await import("../index.js");
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
