import path from "node:path";

import * as utils from "../../common/utils";
import { FileTarget, FileTargetOptions } from "../file-target";
import { createLoggerFactory, LogLevel } from "../index";
import { LoggerFactory, LoggingOptions } from "../logger-factory";

jest.mock("../../common/utils");
jest.mock("../file-target");
jest.mock("../logger-factory");
jest.mock("../logger");

describe("createLoggerFactory", () => {
	const mockedCwd = path.join("stream-deck", "tests");

	afterEach(() => jest.resetAllMocks());

	/**
	 * Asserts {@link createLoggerFactory} uses a {@link FileTarget} with the correct default options.
	 */
	it.each([
		{
			isDebugMode: true,
			expectedLogLevel: LogLevel.DEBUG
		},
		{
			isDebugMode: false,
			expectedLogLevel: LogLevel.INFO
		}
	])("Initializes default logger factory (isDebugMode=$isDebugMode)", async ({ isDebugMode, expectedLogLevel }) => {
		// Arrange.
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);
		jest.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
		jest.spyOn(utils, "isDebugMode").mockReturnValue(isDebugMode);

		// Act.
		const loggerFactory = createLoggerFactory();

		// Assert.
		expect(FileTarget).toHaveBeenCalledTimes(1);
		expect(FileTarget).toHaveBeenLastCalledWith<[FileTargetOptions]>({
			dest: path.join(mockedCwd, "logs"),
			fileName: "com.elgato.test",
			maxFileCount: 10,
			maxSize: 50 * 1024 * 1024
		});

		expect(loggerFactory).toBeInstanceOf(LoggerFactory);
		expect(LoggerFactory).toHaveBeenCalledWith<[LoggingOptions]>({
			logLevel: expectedLogLevel,
			target: (FileTarget as jest.MockedClass<typeof FileTarget>).mock.instances[0]
		});
	});
});
