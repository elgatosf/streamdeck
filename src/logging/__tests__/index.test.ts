import path from "node:path";

import type { FileTarget, FileTargetOptions } from "../file-target";
import { LogLevel } from "../log-level";
import type { LoggerFactory, LoggingOptions } from "../logger-factory";

jest.mock("../logger");

describe("Logging", () => {
	let utils: typeof import("../../common/utils");
	let fileTarget: typeof import("../file-target");
	let loggerFactory: typeof import("../logger-factory");

	const mockedCwd = path.join("stream-deck", "tests");

	beforeEach(async () => {
		jest.doMock("../../common/utils", () => jest.createMockFromModule("../../common/utils"));
		jest.doMock("../file-target", () => jest.createMockFromModule("../file-target"));
		jest.doMock("../logger-factory", () => jest.createMockFromModule("../logger-factory"));

		utils = await require("../../common/utils");
		fileTarget = (await require("../file-target")) as typeof import("../file-target");
		loggerFactory = (await require("../logger-factory")) as typeof import("../logger-factory");
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	/**
	 * Asserts a single {@link FileTarget} is initialized, and has the correct default options.
	 */
	it("Initializes single file target", async () => {
		// Arrange.
		(utils as any).isDebugMode = true;
		jest.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);

		// Act.
		await require("../index");

		// Assert.
		expect(fileTarget.FileTarget).toHaveBeenCalledTimes(1);
		expect(fileTarget.FileTarget).toHaveBeenLastCalledWith<[FileTargetOptions]>({
			dest: path.join(mockedCwd, "logs"),
			fileName: "com.elgato.test",
			maxFileCount: 10,
			maxSize: 50 * 1024 * 1024
		});
	});

	/**
	 * Asserts a single {@link LoggerFactory} is initialized, and has the correct log-level and target.
	 */
	it.each([
		{
			isDebugMode: true,
			logLevel: LogLevel.DEBUG
		},
		{
			isDebugMode: false,
			logLevel: LogLevel.INFO
		}
	])("Initializes single LoggerFactory, isDebugMode $isDebugMode", async ({ isDebugMode, logLevel }) => {
		// Arrange.
		(utils as any).isDebugMode = isDebugMode;
		jest.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);

		// Act.
		const { loggerFactory: defaultLoggerFactory } = (await require("../index")) as typeof import("../index");

		// Assert.
		expect(defaultLoggerFactory).not.toBeUndefined();
		expect(defaultLoggerFactory).toEqual((loggerFactory.LoggerFactory as jest.MockedClass<typeof LoggerFactory>).mock.instances[0]);

		expect(loggerFactory.LoggerFactory).toHaveBeenCalledTimes(1);
		expect(loggerFactory.LoggerFactory).toHaveBeenLastCalledWith<[LoggingOptions]>({
			logLevel,
			target: (fileTarget.FileTarget as jest.MockedClass<typeof FileTarget>).mock.instances[0]
		});
	});
});
