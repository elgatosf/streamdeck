import path from "node:path";

import * as utils from "../../common/utils";
import { FileTarget, FileTargetOptions } from "../file-target";
import { createLogger, LogLevel } from "../index";
import { Logger, LoggerOptions } from "../logger";

jest.mock("../../common/utils");
jest.mock("../file-target");
jest.mock("../logger");

describe("createLogger", () => {
	const mockedCwd = path.join("stream-deck", "tests");

	afterEach(() => jest.resetAllMocks());

	/**
	 * Asserts {@link createLogger} uses a {@link FileTarget} with the correct default options.
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
	])("Initializes default logger (isDebugMode=$isDebugMode)", async ({ isDebugMode, expectedLogLevel }) => {
		// Arrange.
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);
		const processOnceSpy = jest.spyOn(process, "once");
		jest.spyOn(utils, "getPluginUUID").mockReturnValue("com.elgato.test");
		jest.spyOn(utils, "isDebugMode").mockReturnValue(isDebugMode);

		// Act.
		const logger = createLogger();

		// Assert.
		expect(FileTarget).toHaveBeenCalledTimes(1);
		expect(FileTarget).toHaveBeenLastCalledWith<[FileTargetOptions]>({
			dest: path.join(mockedCwd, "logs"),
			fileName: "com.elgato.test",
			maxFileCount: 10,
			maxSize: 50 * 1024 * 1024
		});

		expect(processOnceSpy).toHaveBeenCalledTimes(1);
		expect(processOnceSpy).toHaveBeenCalledWith("uncaughtException", expect.any(Function));

		expect(logger).toBeInstanceOf(Logger);
		expect(Logger).toHaveBeenCalledWith<[LoggerOptions]>({
			level: expectedLogLevel,
			scope: undefined,
			target: (FileTarget as jest.MockedClass<typeof FileTarget>).mock.instances[0]
		});
	});
});
