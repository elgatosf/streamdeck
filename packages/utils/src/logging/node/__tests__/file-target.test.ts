import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { LogEntry } from "../../target.js";
import { FileTarget, type FileTargetOptions } from "../file-target.js";

vi.mock("node:fs");

describe("FileTarget", () => {
	afterEach(() => vi.resetAllMocks());

	/**
	 * Asserts {@link FileTarget.write} writes the formatted log message to the file.
	 */
	it("writes the formatted message", async () => {
		// Arrange.
		const mockedFileDescriptor = 13;

		vi.spyOn(fs, "existsSync").mockReturnValue(false);
		vi.spyOn(fs, "openSync").mockReturnValue(mockedFileDescriptor);
		const format = vi.fn().mockReturnValue("Hello world");

		const options: FileTargetOptions = {
			dest: path.join("home", "test", "logs"),
			fileName: "com.elgato.test",
			format,
			maxFileCount: 1,
			maxSize: 1024 * 10 * 10,
		};
		const fileTarget = new FileTarget(options);

		// Act.
		const entry = {
			level: "info" as const,
			data: ["Hello world"],
			scope: "Test->Logger",
		};

		fileTarget.write(entry);

		// Assert.
		expect(format).toHaveBeenCalledTimes(1);
		expect(format).toHaveBeenCalledWith(entry);
		expect(fs.openSync).toHaveBeenCalledTimes(1);
		expect(fs.openSync).toHaveBeenNthCalledWith(1, path.join(options.dest, "com.elgato.test.0.log"), "a");
		expect(fs.writeSync).toHaveBeenCalledTimes(1);
		expect(fs.writeSync).toHaveBeenCalledWith(mockedFileDescriptor, "Hello world\n");
		expect(fs.closeSync).toHaveBeenCalledTimes(1);
		expect(fs.closeSync).toHaveBeenCalledWith(mockedFileDescriptor);
	});

	describe("Write failures", () => {
		const options: FileTargetOptions = {
			dest: path.join("home", "test", "logs"),
			fileName: "com.elgato.test",
			format: ({ data, level }) => `${level} ${data.join(" ")}`,
			maxFileCount: 3,
			maxSize: 1024,
		};

		const entry = (message: string): LogEntry => ({ level: "info", data: [message], scope: "" });

		/**
		 * Asserts {@link FileTarget.write} does not throw when the log file cannot be opened.
		 */
		it("drops the entry when the file cannot be opened", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(false);
			vi.mocked(fs.openSync).mockImplementationOnce(() => {
				throw fsError("EPERM");
			});

			const fileTarget = new FileTarget(options);

			// Act, assert.
			expect(() => fileTarget.write(entry("Hello world"))).not.toThrow();
			expect(fs.writeSync).not.toHaveBeenCalled();
			expect(fs.closeSync).not.toHaveBeenCalled();
		});

		/**
		 * Asserts {@link FileTarget.write} does not throw, and closes the file, when the entry cannot be written.
		 */
		it("drops the entry when the file cannot be written", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(false);
			vi.spyOn(fs, "openSync").mockReturnValue(13);
			vi.mocked(fs.writeSync).mockImplementationOnce(() => {
				throw fsError("ENOSPC");
			});

			const fileTarget = new FileTarget(options);

			// Act, assert.
			expect(() => fileTarget.write(entry("Hello world"))).not.toThrow();
			expect(fs.closeSync).toHaveBeenCalledTimes(1);
			expect(fs.closeSync).toHaveBeenCalledWith(13);
		});

		/**
		 * Asserts {@link FileTarget.write} does not throw when the file cannot be closed after the entry was written.
		 */
		it("does not throw when the file cannot be closed", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(false);
			vi.spyOn(fs, "openSync").mockReturnValue(13);
			vi.mocked(fs.closeSync).mockImplementationOnce(() => {
				throw fsError("EIO");
			});

			const fileTarget = new FileTarget(options);

			// Act.
			expect(() => fileTarget.write(entry("First"))).not.toThrow();
			fileTarget.write(entry("Second"));

			// Assert; the first entry was written, so it is not reported as dropped.
			expect(fs.writeSync).toHaveBeenCalledTimes(2);
			expect(fs.writeSync).toHaveBeenNthCalledWith(2, 13, "info Second\n");
		});

		/**
		 * Asserts {@link FileTarget.write} reports the number of dropped entries once, when writing succeeds again.
		 */
		it("reports dropped entries once writing succeeds", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(false);
			vi.spyOn(fs, "openSync").mockReturnValue(13);
			vi.mocked(fs.writeSync)
				.mockImplementationOnce(() => {
					throw fsError("ENOSPC");
				})
				.mockImplementationOnce(() => {
					throw fsError("ENOSPC");
				});

			const fileTarget = new FileTarget(options);

			// Act.
			fileTarget.write(entry("One"));
			fileTarget.write(entry("Two"));
			fileTarget.write(entry("Three"));
			fileTarget.write(entry("Four"));

			// Assert.
			expect(fs.writeSync).toHaveBeenCalledTimes(4);
			expect(fs.writeSync).toHaveBeenNthCalledWith(
				3,
				13,
				"warn 2 log entries were dropped because the log file could not be written.\ninfo Three\n",
			);
			expect(fs.writeSync).toHaveBeenNthCalledWith(4, 13, "info Four\n");
		});

		/**
		 * Asserts {@link FileTarget.write} keeps counting entries that are dropped while the report itself cannot be written.
		 */
		it("keeps counting when the report cannot be written", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(false);
			vi.spyOn(fs, "openSync").mockReturnValue(13);
			vi.mocked(fs.writeSync)
				.mockImplementationOnce(() => {
					throw fsError("ENOSPC");
				})
				.mockImplementationOnce(() => {
					throw fsError("ENOSPC");
				});

			const fileTarget = new FileTarget(options);

			// Act.
			fileTarget.write(entry("One"));
			fileTarget.write(entry("Two"));
			fileTarget.write(entry("Three"));

			// Assert.
			expect(fs.writeSync).toHaveBeenNthCalledWith(
				2,
				13,
				"warn 1 log entry was dropped because the log file could not be written.\ninfo Two\n",
			);
			expect(fs.writeSync).toHaveBeenNthCalledWith(
				3,
				13,
				"warn 2 log entries were dropped because the log file could not be written.\ninfo Three\n",
			);
		});

		/**
		 * Asserts constructing a {@link FileTarget} does not throw when the log files cannot be re-indexed.
		 */
		it("does not throw when re-indexing fails on construction", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			vi.spyOn(fs, "readdirSync").mockReturnValue([mockDirent("com.elgato.test.0.log")]);
			vi.mocked(fs.renameSync).mockImplementationOnce(() => {
				throw fsError("EBUSY");
			});
			vi.spyOn(fs, "openSync").mockReturnValue(13);

			// Act.
			const fileTarget = new FileTarget(options);
			fileTarget.write(entry("Hello world"));

			// Assert.
			expect(fs.writeSync).toHaveBeenCalledWith(13, "info Hello world\n");
		});

		/**
		 * Asserts {@link FileTarget.write} does not throw when re-indexing fails after the entry was written, and
		 * only retries once the maximum size has been written again.
		 */
		it("does not throw when re-indexing fails after the entry was written", () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			vi.spyOn(fs, "readdirSync").mockReturnValue([mockDirent("com.elgato.test.0.log")]);
			vi.spyOn(fs, "openSync").mockReturnValue(13);

			const fileTarget = new FileTarget({ ...options, format: (): string => "x".repeat(10), maxSize: 20 });
			vi.mocked(fs.readdirSync).mockClear();
			vi.mocked(fs.renameSync).mockImplementationOnce(() => {
				throw fsError("EBUSY");
			});

			// Act, assert.
			fileTarget.write(entry("One"));
			expect(() => fileTarget.write(entry("Two"))).not.toThrow(); // Size exceeded; re-indexing fails.
			expect(fs.readdirSync).toHaveBeenCalledTimes(1);

			expect(() => fileTarget.write(entry("Three"))).not.toThrow(); // Size not yet exceeded again.
			expect(fs.readdirSync).toHaveBeenCalledTimes(1);

			expect(() => fileTarget.write(entry("Four"))).not.toThrow(); // Size exceeded again; retried.
			expect(fs.readdirSync).toHaveBeenCalledTimes(2);

			expect(fs.writeSync).toHaveBeenCalledTimes(4);
		});
	});

	describe("Re-indexing", () => {
		/**
		 * Asserts {@link FileTarget} re-indexes old log files upon construction.
		 */
		it("Occurs on construction", async () => {
			// Arrange.
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			vi.spyOn(fs, "readdirSync").mockReturnValue([
				mockDirent("__com.elgato.test.0.log"), // Ignored other file name.
				mockDirent("com.elgato.test.0.log"),
				mockDirent("com.elgato.test.log"), // Ignore invalid index format.
				mockDirent("com.elgato.test.4.log"),
				mockDirent("com.elgato.test.5.log"),
				mockDirent("com.elgato.other.0.log"), // Ignore other file name.
				mockDirent("com.elgato.test.0.log", true), // Ignore directories.
				mockDirent("com.elgato.test.1.log"),
			]);

			const options: FileTargetOptions = {
				dest: path.join("home", "test", "logs"),
				fileName: "com.elgato.test",
				format: vi.fn(),
				maxFileCount: 3,
				maxSize: 100,
			};

			// Act.
			new FileTarget(options);

			// Assert.
			expect(fs.rmSync).toHaveBeenCalledTimes(2);
			expect(fs.rmSync).toHaveBeenNthCalledWith(1, path.join(options.dest, "com.elgato.test.5.log"));
			expect(fs.rmSync).toHaveBeenNthCalledWith(2, path.join(options.dest, "com.elgato.test.4.log"));

			expect(fs.renameSync).toHaveBeenCalledTimes(2);
			expect(fs.renameSync).toHaveBeenNthCalledWith(
				1,
				path.join(options.dest, "com.elgato.test.1.log"),
				path.join(options.dest, "com.elgato.test.2.log"),
			);
			expect(fs.renameSync).toHaveBeenNthCalledWith(
				2,
				path.join(options.dest, "com.elgato.test.0.log"),
				path.join(options.dest, "com.elgato.test.1.log"),
			);
		});

		/**
		 * Asserts {@link FileTarget} re-indexes when the log file size is exceeded.
		 */
		it("Occurs when size exceeded", async () => {
			// Arrange.
			const dirEntries = [mockDirent("com.elgato.test.0.log"), mockDirent("com.elgato.test.1.log")];

			vi.spyOn(fs, "openSync").mockReturnValue(1);
			vi.spyOn(fs, "existsSync").mockReturnValue(true);
			vi.spyOn(fs, "readdirSync").mockReturnValueOnce(dirEntries);
			vi.spyOn(fs, "readdirSync").mockReturnValueOnce([...dirEntries, mockDirent("com.elgato.test.2.log")]);

			const options: FileTargetOptions = {
				dest: path.join("home", "test", "logs"),
				fileName: "com.elgato.test",
				format: vi.fn().mockReturnValue("x".repeat(10)),
				maxFileCount: 3,
				maxSize: 29,
			};

			const fileTarget = new FileTarget(options);

			// Act.
			const entry = {
				level: "error" as const,
				data: [],
				scope: "",
			};

			fileTarget.write(entry);
			fileTarget.write(entry);
			fileTarget.write(entry);

			expect(fs.rmSync).toHaveBeenCalledTimes(1);
			expect(fs.rmSync).toHaveBeenLastCalledWith(path.join(options.dest, "com.elgato.test.2.log"));
			expect(fs.renameSync).toHaveBeenCalledTimes(4); // Re-indexing occurs twice, once on construction, and then on exceeding size.
			expect(fs.renameSync).nthCalledWith(
				3,
				path.join(options.dest, "com.elgato.test.1.log"),
				path.join(options.dest, "com.elgato.test.2.log"),
			);
			expect(fs.renameSync).nthCalledWith(
				4,
				path.join(options.dest, "com.elgato.test.0.log"),
				path.join(options.dest, "com.elgato.test.1.log"),
			);
		});
	});

	/**
	 * Creates an error that resembles one thrown by `node:fs`.
	 * @param code The error code.
	 * @returns The error.
	 */
	function fsError(code: string): NodeJS.ErrnoException {
		return Object.assign(new Error(`${code}: mocked failure`), { code });
	}

	/**
	 * Creates a mock {@link fs.Dirent}.
	 * @param name The name of the entry
	 * @param isDirectory Mock value of {@link fs.Dirent.isDirectory}.
	 * @returns The mocked {@link fs.Dirent}.
	 */
	function mockDirent(name: string, isDirectory = false): fs.Dirent<Buffer<ArrayBuffer>> {
		return {
			name,
			isDirectory: vi.fn().mockReturnValue(isDirectory),
		} as unknown as fs.Dirent<Buffer<ArrayBuffer>>;
	}
});
