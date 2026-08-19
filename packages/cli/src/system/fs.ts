import ignore from "ignore";
import { get } from "lodash";
import {
	cpSync,
	createReadStream,
	existsSync,
	lstatSync,
	mkdirSync,
	type PathLike,
	readlinkSync,
	type RmOptions,
	rmSync,
	type Stats,
} from "node:fs";
import { lstat, mkdir, readdir, readFile } from "node:fs/promises";
import { platform } from "node:os";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline";

export const streamDeckIgnoreFilename = ".sdignore";
export const defaultIgnorePatterns = [streamDeckIgnoreFilename, ".git", "/.env*", "*.log", "*.js.map"];

/**
 * Gets files within the specified {@link path}, and their associated information, for example file size. When a `.sdignore` file is found within the {@link path}, it is respected,
 * and the files are ignored.
 * @param path Path to the directory to read.
 * @param ignorePatterns Collection of default ignore patterns; this will be concatenated with patterns defined in a `.sdignore` file if one exists.
 * @yields Files in the directory.
 */
export async function* getFiles(path: string, ignorePatterns?: string[]): AsyncGenerator<FileInfo> {
	if (!existsSync(path)) {
		return;
	}

	if (!lstatSync(path).isDirectory()) {
		throw new Error("Path is not a directory");
	}

	const ignores = await getIgnores(path, ignorePatterns);

	// We don't use withFileTypes as this yields incomplete results in Node.js 20.5.1; as we need the size anyway, we instead can rely on lstatSync as a direct call.
	for (const entry of await readdir(path, { encoding: "utf-8", recursive: true })) {
		// Ensure the file isn't ignored.
		if (ignores(entry)) {
			continue;
		}

		const absolute = resolve(path, entry);
		const stats = await lstat(absolute);

		// We only want files.
		if (!stats.isFile()) {
			continue;
		}

		yield {
			name: basename(absolute),
			path: {
				absolute,
				relative: entry,
			},
			size: {
				bytes: stats.size,
				text: sizeAsString(stats.size),
			},
		};
	}
}

/**
 * Builds an ignore predicate from the `.sdignore` file located within the specified {@link path}. The predicate will return `true` when the path supplied to it should be ignored.
 * @param path Path to the directory that contains the optional `.sdignore` file.
 * @param defaultPatterns Collection of default ignore patterns.
 * @returns Predicate that determines whether the path should be ignored; returns `true` when the path should be ignored.
 */
export async function getIgnores(
	path: string,
	defaultPatterns: string[] = defaultIgnorePatterns,
): Promise<(path: string) => boolean> {
	const i = ignore().add(defaultPatterns);

	// When a ".sdignore" file is present, add the ignore patterns.
	const file = join(path, streamDeckIgnoreFilename);
	if (existsSync(file)) {
		const fileStream = createReadStream(file);
		try {
			const rl = createInterface({
				input: fileStream,
				crlfDelay: Infinity,
			});

			// Treat each line as a pattern, adding it to the ignore.
			for await (const line of rl) {
				i.add(line);
			}
		} finally {
			fileStream.close();
		}
	}

	return (p) => i.ignores(p);
}

/**
 * Determines whether the specified {@link path}, or the path it links to, is a directory.
 * @param path The path.
 * @returns `true` when the path, or the path it links to, is a directory; otherwise `false`.
 */
export function isDirectory(path: string): boolean {
	return checkStats(path, (stats) => stats?.isDirectory() === true);
}

/**
 * Determines whether the specified {@link path}, or the path it links to, is a file.
 * @param path The path.
 * @returns `true` when the path, or the path it links to, is a file; otherwise `false`.
 */
export function isFile(path: string): boolean {
	return checkStats(path, (stats) => stats?.isFile() === true);
}

/**
 * Synchronously moves the {@link source} to the {@link dest} path.
 * @param source Source path being moved.
 * @param dest Destination where the {@link source} will be moved to.
 * @param options Options that define the move.
 */
export function moveSync(source: string, dest: string, options?: MoveOptions): void {
	if (!existsSync(source)) {
		throw new Error("Source does not exist");
	}

	if (!lstatSync(source).isDirectory()) {
		throw new Error("Source must be a directory");
	}

	if (existsSync(dest)) {
		if (options?.overwrite) {
			rmSync(dest, { recursive: true });
		} else {
			throw new Error("Destination already exists");
		}
	}

	// Ensure the new directory exists, copy the contents, and clean-up.
	mkdirSync(dest, { recursive: true });
	cpSync(source, dest, { recursive: true });
	rmSync(source, { recursive: true });
}

/**
 * Makes the directory specified by the {@link path} when it does not exist; when it exists, the path is validated to ensure it is a directory.
 * @param path Path of the directory to make.
 */
export async function mkdirIfNotExists(path: string): Promise<void> {
	if (!existsSync(path)) {
		await mkdir(path, { recursive: true });
	} else if (!isDirectory(path)) {
		throw new Error("Path exists, but is not a directory");
	}
}

/**
 * Reads the specified {@link path} and parses the contents as JSON.
 * @param path Path to the JSON file.
 * @returns Contents parsed as JSON.
 */
export async function readJsonFile<T>(path: string): Promise<JsonFile<T>> {
	if (!existsSync(path)) {
		throw new Error(`JSON file not found, ${path}`);
	}

	try {
		const contents = await readFile(path, { encoding: "utf-8" });
		const value = JSON.parse(contents) as T;

		return {
			value,
			stringify(): string {
				// Detect the original line ending style (CRLF or LF)
				const lineEnding = contents.includes("\r\n") ? "\r\n" : "\n";

				// Detect the original indentation style (tabs or spaces)
				const indentMatch = contents.match(/^[\t ]+/m);
				const indent = indentMatch?.[0] ?? "\t";

				let stringified = JSON.stringify(value, undefined, indent);

				// Preserve original line endings
				if (lineEnding === "\r\n") {
					stringified = stringified.replace(/(?<!\r)\n/g, "\r\n");
				}

				return stringified;
			},
		};
	} catch (cause) {
		throw new Error(`Failed to pase JSON file, ${path}`, { cause });
	}
}

/**
 * A JSON file with its parsed value and a method to stringify it while preserving formatting.
 */
export type JsonFile<T> = {
	/**
	 * The parsed value of the JSON file.
	 */
	readonly value: T;
	/**
	 * Stringifies the JSON value while preserving original formatting.
	 * @returns The stringified JSON.
	 */
	stringify(): string;
};

/**
 * Defines how a path will be relocated.
 */
type MoveOptions = {
	/**
	 * When the destination path already exists, it will be overwritten.
	 */
	overwrite?: boolean;
};

/**
 * Gets the platform-specific string representation of the file size, to 1 decimal place. For example, given 1060 bytes:
 * - macOS would yield "1.1 kB" as it is decimal based (1000).
 * - Windows would yield "1.0 KiB" as it is binary-based (1024).
 * @param bytes Size in bytes.
 * @returns String representation of the size.
 */
export function sizeAsString(bytes: number): string {
	const isBinary = platform() === "win32";
	const units = isBinary ? ["KiB", "MiB", "GiB", "TiB"] : ["kB", "MB", "GB", "TB"];
	const unitSize = isBinary ? 1024 : 1000;

	if (bytes < unitSize) {
		return `${bytes} B`;
	}

	let i = -1;
	do {
		bytes /= unitSize;
		i++;
	} while (Math.round(bytes) >= unitSize);

	return `${bytes.toFixed(1)} ${units[i]}`;
}

/**
 * Checks the stats of a given path and applies the {@link check} to them to determine the result.
 * @param path Path to check; when the path represents a symbolic link, the link is referenced.
 * @param check Function used to determine if the stats fulfil the check.
 * @returns `true` when the stats of the {@link path} fulfil the {@link check}; otherwise `false`.
 */
function checkStats(path: string, check: (stats?: Stats) => boolean): boolean {
	const stats = lstatSync(path, { throwIfNoEntry: false });
	if (stats === undefined) {
		return false;
	}

	if (stats.isSymbolicLink()) {
		return checkStats(readlinkSync(path), check);
	}

	return check(stats);
}

/**
 * Removes files and directories at the specified path. When an error is encountered, the retry delay
 * will be awaited, and the removal retried. This will continue until the removal was successful, or
 * the max retries is reached.
 * @param path Path to remove.
 * @param options Removal options.
 */
export async function rm(path: PathLike, options?: RmOptions): Promise<void> {
	const { maxRetries = 0, retryDelay = 100, ...opts } = options ?? {};

	let callCount = 0;
	const run = async (): Promise<void> => {
		try {
			callCount++;
			rmSync(path, opts);
		} catch (e) {
			if (callCount <= maxRetries && isResourceBusyError(e)) {
				await new Promise((res) => setTimeout(res, retryDelay));
				await run();
			} else {
				throw e;
			}
		}
	};

	await run();
}

/**
 * Determines whether the specified error indicates the resource was busy.
 * @param e The error
 * @returns `true` when the error was caused due to a busy resource; otherwise `false`.
 */
export function isResourceBusyError(e: unknown): boolean {
	return get(e, "code") === "EBUSY";
}

/**
 * Information about a file.
 */
export type FileInfo = {
	/**
	 * Name of the file.
	 */
	name: string;

	/**
	 * Path to the file.
	 */
	path: {
		/**
		 * Absolute path to the file.
		 */
		absolute: string;

		/**
		 * Relative path to the file.
		 */
		relative: string;
	};

	/**
	 * Size of the file in bytes.
	 */
	size: {
		/**
		 * Size in bytes.
		 */
		bytes: number;

		/**
		 * String representation of the size, for example "1.8 GiB", "2.3 kB", etc.
		 */
		text: string;
	};
};
