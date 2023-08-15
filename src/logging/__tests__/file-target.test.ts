import { Dirent } from "node:fs";
import { EOL } from "node:os";

import { LogLevel } from "../log-level";

import path = require("node:path");

describe("FileTarget", () => {
	let fs: typeof import("node:fs");
	const mockedDate = new Date(2000, 11, 25, 10, 30, 0, 123);
	const mockedDest = path.join("test", "logs");
	const mockedFileDescriptor = 13;

	beforeEach(() => {
		jest.doMock("node:fs", () => jest.createMockFromModule("node:fs"));
		fs = require("node:fs");

		jest.useFakeTimers().setSystemTime(mockedDate);
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	describe("Writing to file", () => {
		const testCases = [
			{
				name: "ERROR",
				logLevel: LogLevel.ERROR,
				expectedMessage: `2000-12-25T10:30:00.123Z ERROR Hello world${EOL}`
			},
			{
				name: "WARN",
				logLevel: LogLevel.WARN,
				expectedMessage: `2000-12-25T10:30:00.123Z WARN  Hello world${EOL}`
			},
			{
				name: "INFO",
				logLevel: LogLevel.INFO,
				expectedMessage: `2000-12-25T10:30:00.123Z INFO  Hello world${EOL}`
			},
			{
				name: "DEBUG",
				logLevel: LogLevel.DEBUG,
				expectedMessage: `2000-12-25T10:30:00.123Z DEBUG Hello world${EOL}`
			},
			{
				name: "TRACE",
				logLevel: LogLevel.TRACE,
				expectedMessage: `2000-12-25T10:30:00.123Z TRACE Hello world${EOL}`
			}
		];

		/**
		 * Asserts {@link FileTarget.write} writes the formatted log message to the file.
		 */
		it.each(testCases)("$name message", async ({ logLevel, expectedMessage }) => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(false);
			jest.spyOn(fs, "openSync").mockReturnValue(mockedFileDescriptor);

			const { FileTarget } = (await require("../file-target")) as typeof import("../file-target");
			const fileTarget = new FileTarget({
				dest: mockedDest,
				fileName: "com.elgato.test",
				maxFileCount: 1,
				maxSize: 1024 * 10 * 10
			});

			// Act.
			fileTarget.write(logLevel, "Hello world");

			// Assert.
			expect(fs.openSync).toHaveBeenCalledTimes(1);
			expect(fs.openSync).toHaveBeenNthCalledWith(1, mockPath("com.elgato.test.0.log"), "a");
			expect(fs.writeSync).toHaveBeenCalledTimes(1);
			expect(fs.writeSync).toHaveBeenCalledWith(mockedFileDescriptor, expectedMessage);
			expect(fs.closeSync).toHaveBeenCalledTimes(1);
			expect(fs.closeSync).toHaveBeenCalledWith(mockedFileDescriptor);
		});

		/**
		 * Asserts {@link FileTarget.write} writes the formatted log message, including the error, to the file.
		 */
		it.each(testCases)("$name message, with error", async ({ logLevel, expectedMessage }) => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(false);
			jest.spyOn(fs, "openSync").mockReturnValue(mockedFileDescriptor);

			const { FileTarget } = (await require("../file-target")) as typeof import("../file-target");
			const fileTarget = new FileTarget({
				dest: mockedDest,
				fileName: "com.elgato.test",
				maxFileCount: 1,
				maxSize: 1024 * 10 * 10
			});

			const err = new Error("Hello world, this is a test");

			// Act.
			fileTarget.write(logLevel, "Hello world", err);

			// Assert.
			expect(fs.openSync).toHaveBeenCalledTimes(1);
			expect(fs.openSync).toHaveBeenNthCalledWith(1, mockPath("com.elgato.test.0.log"), "a");
			expect(fs.writeSync).toHaveBeenCalledTimes(3);
			expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileDescriptor, expectedMessage);
			expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileDescriptor, `Hello world, this is a test${EOL}`);
			expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileDescriptor, `${(<Error>err).stack}${EOL}`);
			expect(fs.closeSync).toHaveBeenCalledTimes(1);
			expect(fs.closeSync).toHaveBeenCalledWith(mockedFileDescriptor);
		});
	});

	describe("Re-indexing", () => {
		/**
		 * Asserts {@link FileTarget} re-indexes old log files upon construction.
		 */
		it("Occurs on construction", async () => {
			// Arrange.
			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			jest.spyOn(fs, "readdirSync").mockReturnValue([
				mockPath("__com.elgato.test.0.log"), // Ignored, other file name.
				mockPath("com.elgato.test.0.log"),
				mockPath("com.elgato.test.log"), // Ignored, invalid index format.
				mockPath("com.elgato.test.4.log"),
				mockPath("com.elgato.test.5.log"),
				mockPath("com.elgato.other.0.log"), // Ignored, other file name.
				mockPath("com.elgato.test.1.log")
			] as unknown[] as Dirent[]);

			const { FileTarget } = (await require("../file-target")) as typeof import("../file-target");

			// Act.
			const fileTarget = new FileTarget({
				dest: mockedDest,
				fileName: "com.elgato.test",
				maxFileCount: 3,
				maxSize: 100
			});

			// Assert.
			expect(fs.rmSync).toHaveBeenCalledTimes(2);
			expect(fs.rmSync).toHaveBeenNthCalledWith(1, mockPath("com.elgato.test.5.log"));
			expect(fs.rmSync).toHaveBeenNthCalledWith(2, mockPath("com.elgato.test.4.log"));

			expect(fs.renameSync).toHaveBeenCalledTimes(2);
			expect(fs.renameSync).toHaveBeenNthCalledWith(1, mockPath("com.elgato.test.1.log"), mockPath("com.elgato.test.2.log"));
			expect(fs.renameSync).toHaveBeenNthCalledWith(2, mockPath("com.elgato.test.0.log"), mockPath("com.elgato.test.1.log"));
		});

		/**
		 * Asserts {@link FileTarget} re-indexes when the log file size is exceeded.
		 */
		it("Occurs when size exceeded", async () => {
			// Arrange.
			const dirs = [mockPath("com.elgato.test.0.log"), mockPath("com.elgato.test.1.log")] as unknown[] as Dirent[];

			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			jest.spyOn(fs, "readdirSync").mockReturnValueOnce(dirs);
			jest.spyOn(fs, "readdirSync").mockReturnValueOnce([...dirs, mockPath("com.elgato.test.2.log")] as unknown[] as Dirent[]);

			const { FileTarget } = (await require("../file-target")) as typeof import("../file-target");
			const fileTarget = new FileTarget({
				dest: mockedDest,
				fileName: "com.elgato.test",
				maxFileCount: 3,
				maxSize: 50
			});

			// Act.
			fileTarget.write(LogLevel.ERROR, "Hello world (1)");
			fileTarget.write(LogLevel.ERROR, "Hello world (2)");
			fileTarget.write(LogLevel.ERROR, "Hello world (3)");

			expect(fs.rmSync).toHaveBeenCalledTimes(1);
			expect(fs.rmSync).toHaveBeenLastCalledWith(mockPath("com.elgato.test.2.log"));
			expect(fs.renameSync).toHaveBeenCalledTimes(4); // Re-indexing occurs twice, once on construction, and then on exceeding size.
			expect(fs.renameSync).nthCalledWith(3, mockPath("com.elgato.test.1.log"), mockPath("com.elgato.test.2.log"));
			expect(fs.renameSync).nthCalledWith(4, mockPath("com.elgato.test.0.log"), mockPath("com.elgato.test.1.log"));
		});
	});

	/**
	 * Helper function for getting a mock path.
	 * @param fileName Name of the file.
	 * @returns Mock path.
	 */
	function mockPath(fileName: string) {
		return path.join(mockedDest, fileName);
	}
});
