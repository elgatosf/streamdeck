import fs from "node:fs";
import path from "node:path";

import type { LogEntryFormatter } from "../format.js";
import type { LogEntry, LogTarget } from "../target.js";

/**
 * Provides a {@link LogTarget} capable of logging to a local file system.
 */
export class FileTarget implements LogTarget {
	/**
	 * File path where logs will be written.
	 */
	readonly #filePath: string;

	/**
	 * Options that defines how logs should be written to the local file system.
	 */
	readonly #options: FileTargetOptions;

	/**
	 * Current size of the logs that have been written to the {@link FileTarget.#filePath}.
	 */
	#size = 0;

	/**
	 * Number of log entries that could not be written, and have not yet been reported in the log file.
	 */
	#dropped = 0;

	/**
	 * Initializes a new instance of the {@link FileTarget} class.
	 * @param options Options that defines how logs should be written to the local file system.
	 */
	constructor(options: FileTargetOptions) {
		this.#options = options;
		this.#filePath = this.getLogFilePath();
		this.tryReIndex();
	}

	/**
	 * Writes the log entry to the log file. A log entry that cannot be written, for example because the disk is
	 * full or the file is read-only, is dropped rather than thrown to the caller; the number of dropped entries
	 * is written to the log file once writing succeeds again.
	 * @param entry The log entry to write.
	 */
	public write(entry: LogEntry): void {
		let msg = this.#options.format(entry);
		if (this.#dropped > 0) {
			msg = `${this.#options.format(this.getDroppedEntry())}\n${msg}`;
		}

		if (!this.tryAppend(msg + "\n")) {
			this.#dropped++;
			return;
		}

		this.#dropped = 0;
		this.#size += msg.length;

		if (this.#size >= this.#options.maxSize) {
			// When re-indexing fails, the next attempt happens once another `maxSize` has been written.
			this.tryReIndex();
			this.#size = 0;
		}
	}

	/**
	 * Gets the log entry that reports the number of log entries that were dropped.
	 * @returns The log entry.
	 */
	private getDroppedEntry(): LogEntry {
		const count = this.#dropped;
		return {
			data: [
				`${count} log ${count === 1 ? "entry was" : "entries were"} dropped because the log file could not be written.`,
			],
			level: "warn",
			scope: "",
		};
	}

	/**
	 * Gets the file path to an indexed log file.
	 * @param index Optional index of the log file to be included as part of the file name.
	 * @returns File path that represents the indexed log file.
	 */
	private getLogFilePath(index = 0): string {
		return path.join(this.#options.dest, `${this.#options.fileName}.${index}.log`);
	}

	/**
	 * Gets the log files associated with this file target, including past and present.
	 * @returns Log file entries.
	 */
	private getLogFiles(): LogFileEntry[] {
		const regex = /^\.(\d+)\.log$/;

		return fs
			.readdirSync(this.#options.dest, { withFileTypes: true })
			.reduce((prev: LogFileEntry[], entry: fs.Dirent) => {
				if (entry.isDirectory() || entry.name.indexOf(this.#options.fileName) < 0) {
					return prev;
				}

				const logIndex = entry.name.substring(this.#options.fileName.length).match(regex)?.[1];
				if (!logIndex) {
					return prev;
				}

				prev.push({
					path: path.join(this.#options.dest, entry.name),
					index: parseInt(logIndex),
				});

				return prev;
			}, [])
			.sort(({ index: a }, { index: b }) => {
				return a < b ? -1 : a > b ? 1 : 0;
			});
	}

	/**
	 * Re-indexes the existing log files associated with this file target, removing old log files whose
	 * index exceeds the `maxFileCount`, and renaming the remaining log files, leaving index "0" free
	 * for a new log file.
	 */
	private reIndex(): void {
		// When the destination directory is new, create it, and return.
		if (!fs.existsSync(this.#options.dest)) {
			fs.mkdirSync(this.#options.dest, {
				recursive: true,
			});

			return;
		}

		const logFiles = this.getLogFiles();
		for (let i = logFiles.length - 1; i >= 0; i--) {
			const log = logFiles[i];
			if (!log) {
				continue;
			}

			if (i >= this.#options.maxFileCount - 1) {
				fs.rmSync(log.path);
			} else {
				fs.renameSync(log.path, this.getLogFilePath(i + 1));
			}
		}
	}

	/**
	 * Appends the data to the log file.
	 * @param data Data to append.
	 * @returns `true` when the data was written; otherwise `false`.
	 */
	private tryAppend(data: string): boolean {
		let fd: number | undefined;
		try {
			fd = fs.openSync(this.#filePath, "a");
			fs.writeSync(fd, data);
			return true;
		} catch {
			return false;
		} finally {
			if (fd !== undefined) {
				try {
					fs.closeSync(fd);
				} catch {
					// The data has been written, and the file descriptor cannot be used again.
				}
			}
		}
	}

	/**
	 * Re-indexes the log files (see {@link FileTarget.reIndex}); a failure, for example when a log file is held
	 * open by another process, is ignored, and log entries continue to be appended to the current log file.
	 */
	private tryReIndex(): void {
		try {
			this.reIndex();
		} catch {
			// Logging must never fail because the log files could not be rotated.
		}
	}
}

/**
 * A log file entry.
 */
type LogFileEntry = {
	/**
	 * Index of the log file.
	 */
	index: number;

	/**
	 * Path to the log file.
	 */
	path: string;
};

/**
 * Options that determine the behavior of a {@link FileTarget}.
 */
export type FileTargetOptions = {
	/**
	 * Destination folder where log files will be written.
	 */
	dest: string;

	/**
	 * Name of the log file. The filename extension will be `.log`, and the file will be indexed, e.g.
	 * when `fileName` is `com.elgato.test`, the resulting output filename will be `com.elgato.test.1.log`.
	 */
	fileName: string;

	/**
	 * Formatter responsible for formatting the log entry.
	 */
	format: LogEntryFormatter;

	/**
	 * Maximum number of files that can be created as part of the target before old logs should be truncated
	 * and removed.
	 */
	maxFileCount: number;

	/**
	 * Maximum size of a log file; when exceeded, file rotation occurs and older log files are removed
	 * based on `maxFileCount`.
	 */
	maxSize: number;
};
