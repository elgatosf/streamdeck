import fs, { Dirent } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { LogLevel } from "../../../common/logging/index.js";
import { FileTarget, type FileTargetOptions } from "../file-target.js";

vi.mock("node:fs");

describe("FileTarget", () => {
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
			level: LogLevel.INFO,
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
				level: LogLevel.ERROR,
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
	 * Creates a mock {@link Dirent}.
	 * @param name The name of the entry
	 * @param isDirectory Mock value of {@link Dirent.isDirectory}.
	 * @returns The mocked {@link Dirent}.
	 */
	function mockDirent(name: string, isDirectory = false) {
		return {
			name,
			isDirectory: vi.fn().mockReturnValue(isDirectory),
		} as unknown as Dirent<NonSharedBuffer>;
	}
});
