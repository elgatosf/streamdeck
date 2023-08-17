import fs, { Dirent } from "node:fs";
import { EOL } from "node:os";
import path from "node:path";

import { FileTarget, FileTargetOptions } from "../file-target";
import { LogLevel } from "../log-level";

jest.mock("node:fs");

describe("FileTarget", () => {
	const mockedDate = new Date(2000, 11, 25, 10, 30, 0, 123);
	const mockedFileDescriptor = 13;

	beforeEach(() => jest.useFakeTimers().setSystemTime(mockedDate));
	afterEach(() => jest.resetAllMocks());

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

			const options: FileTargetOptions = {
				dest: path.join("home", "test", "logs"),
				fileName: "com.elgato.test",
				maxFileCount: 1,
				maxSize: 1024 * 10 * 10
			};
			const fileTarget = new FileTarget(options);

			// Act.
			fileTarget.write(logLevel, "Hello world");

			// Assert.
			expect(fs.openSync).toHaveBeenCalledTimes(1);
			expect(fs.openSync).toHaveBeenNthCalledWith(1, path.join(options.dest, "com.elgato.test.0.log"), "a");
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

			const options: FileTargetOptions = {
				dest: path.join("home", "tests", "logs"),
				fileName: "com.elgato.test",
				maxFileCount: 1,
				maxSize: 1024 * 10 * 10
			};

			const fileTarget = new FileTarget(options);

			const err = new Error("Hello world, this is a test");

			// Act.
			fileTarget.write(logLevel, "Hello world", err);

			// Assert.
			expect(fs.openSync).toHaveBeenCalledTimes(1);
			expect(fs.openSync).toHaveBeenNthCalledWith(1, path.join(options.dest, "com.elgato.test.0.log"), "a");
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
				mockDirent("__com.elgato.test.0.log"), // Ignored other file name.
				mockDirent("com.elgato.test.0.log"),
				mockDirent("com.elgato.test.log"), // Ignore invalid index format.
				mockDirent("com.elgato.test.4.log"),
				mockDirent("com.elgato.test.5.log"),
				mockDirent("com.elgato.other.0.log"), // Ignore other file name.
				mockDirent("com.elgato.test.0.log", true), // Ignore directories.
				mockDirent("com.elgato.test.1.log")
			]);

			const options: FileTargetOptions = {
				dest: path.join("home", "test", "logs"),
				fileName: "com.elgato.test",
				maxFileCount: 3,
				maxSize: 100
			};

			// Act.
			new FileTarget(options);

			// Assert.
			expect(fs.rmSync).toHaveBeenCalledTimes(2);
			expect(fs.rmSync).toHaveBeenNthCalledWith(1, path.join(options.dest, "com.elgato.test.5.log"));
			expect(fs.rmSync).toHaveBeenNthCalledWith(2, path.join(options.dest, "com.elgato.test.4.log"));

			expect(fs.renameSync).toHaveBeenCalledTimes(2);
			expect(fs.renameSync).toHaveBeenNthCalledWith(1, path.join(options.dest, "com.elgato.test.1.log"), path.join(options.dest, "com.elgato.test.2.log"));
			expect(fs.renameSync).toHaveBeenNthCalledWith(2, path.join(options.dest, "com.elgato.test.0.log"), path.join(options.dest, "com.elgato.test.1.log"));
		});

		/**
		 * Asserts {@link FileTarget} re-indexes when the log file size is exceeded.
		 */
		it("Occurs when size exceeded", async () => {
			// Arrange.
			const dirEntries = [mockDirent("com.elgato.test.0.log"), mockDirent("com.elgato.test.1.log")];

			jest.spyOn(fs, "existsSync").mockReturnValue(true);
			jest.spyOn(fs, "readdirSync").mockReturnValueOnce(dirEntries);
			jest.spyOn(fs, "readdirSync").mockReturnValueOnce([...dirEntries, mockDirent("com.elgato.test.2.log")]);

			const options: FileTargetOptions = {
				dest: path.join("home", "test", "logs"),
				fileName: "com.elgato.test",
				maxFileCount: 3,
				maxSize: 50
			};

			const fileTarget = new FileTarget(options);

			// Act.
			fileTarget.write(LogLevel.ERROR, "Hello world (1)");
			fileTarget.write(LogLevel.ERROR, "Hello world (2)");
			fileTarget.write(LogLevel.ERROR, "Hello world (3)");

			expect(fs.rmSync).toHaveBeenCalledTimes(1);
			expect(fs.rmSync).toHaveBeenLastCalledWith(path.join(options.dest, "com.elgato.test.2.log"));
			expect(fs.renameSync).toHaveBeenCalledTimes(4); // Re-indexing occurs twice, once on construction, and then on exceeding size.
			expect(fs.renameSync).nthCalledWith(3, path.join(options.dest, "com.elgato.test.1.log"), path.join(options.dest, "com.elgato.test.2.log"));
			expect(fs.renameSync).nthCalledWith(4, path.join(options.dest, "com.elgato.test.0.log"), path.join(options.dest, "com.elgato.test.1.log"));
		});
	});

	/**
	 * Creates a mock {@link Dirent}.
	 * @param name The name of the entry
	 * @param isDirectory Mock value of {@link Dirent.isDirectory}.
	 * @returns The mocked {@link Dirent}.
	 */
	function mockDirent(name: string, isDirectory = false) {
		return {
			name,
			isDirectory: jest.fn().mockReturnValue(isDirectory)
		} as unknown as Dirent;
	}
});
