import fs, { type Dirent } from "node:fs";
import path from "node:path";

import { type LogEntry, type LogEntryFormatter, type LogTarget } from "../../common/logging";

/**
 * Provides a {@link LogTarget} capable of logging to a local file system.
 */
export class FileTarget implements LogTarget {
	/**
	 * File path where logs will be written.
	 */
	private readonly filePath: string;

	/**
	 * Current size of the logs that have been written to the {@link FileTarget.filePath}.
	 */
	private size = 0;

	/**
	 * Initializes a new instance of the {@link FileTarget} class.
	 * @param options Options that defines how logs should be written to the local file system.
	 */
	constructor(private readonly options: FileTargetOptions) {
		this.filePath = this.getLogFilePath();
		this.reIndex();
	}

	/**
	 * @inheritdoc
	 */
	public write(entry: LogEntry): void {
		const fd = fs.openSync(this.filePath, "a");

		try {
			const msg = this.options.format(entry);
			fs.writeSync(fd, msg + "\n");
			this.size += msg.length;
		} finally {
			fs.closeSync(fd);
		}

		if (this.size >= this.options.maxSize) {
			this.reIndex();
			this.size = 0;
		}
	}

	/**
	 * Gets the file path to an indexed log file.
	 * @param index Optional index of the log file to be included as part of the file name.
	 * @returns File path that represents the indexed log file.
	 */
	private getLogFilePath(index = 0): string {
		return path.join(this.options.dest, `${this.options.fileName}.${index}.log`);
	}

	/**
	 * Gets the log files associated with this file target, including past and present.
	 * @returns Log file entries.
	 */
	private getLogFiles(): LogFileEntry[] {
		const regex = /^\.(\d+)\.log$/;

		return fs
			.readdirSync(this.options.dest, { withFileTypes: true })
			.reduce((prev: LogFileEntry[], entry: Dirent) => {
				if (entry.isDirectory() || entry.name.indexOf(this.options.fileName) < 0) {
					return prev;
				}

				const match = entry.name.substring(this.options.fileName.length).match(regex);
				if (match?.length !== 2) {
					return prev;
				}

				prev.push({
					path: path.join(this.options.dest, entry.name),
					index: parseInt(match[1]),
				});

				return prev;
			}, [])
			.sort(({ index: a }, { index: b }) => {
				return a < b ? -1 : a > b ? 1 : 0;
			});
	}

	/**
	 * Re-indexes the existing log files associated with this file target, removing old log files whose index exceeds the {@link FileTargetOptions.maxFileCount}, and renaming the
	 * remaining log files, leaving index "0" free for a new log file.
	 */
	private reIndex(): void {
		// When the destination directory is new, create it, and return.
		if (!fs.existsSync(this.options.dest)) {
			fs.mkdirSync(this.options.dest);
			return;
		}

		const logFiles = this.getLogFiles();
		for (let i = logFiles.length - 1; i >= 0; i--) {
			const log = logFiles[i];
			if (i >= this.options.maxFileCount - 1) {
				fs.rmSync(log.path);
			} else {
				fs.renameSync(log.path, this.getLogFilePath(i + 1));
			}
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
	 * Name of the log file. The filename extension will be `.log`, and the file will be indexed, e.g. when {@link FileTargetOptions.fileName} is `com.elgato.test`, the resulting output
	 * filename will be `com.elgato.test.1.log`.
	 */
	fileName: string;

	/**
	 * Formatter responsible for formatting the log entry.
	 */
	format: LogEntryFormatter;

	/**
	 * Maximum number of files that can be created as part of the target before old logs should be truncated and removed.
	 */
	maxFileCount: number;

	/**
	 * Maximum size of a log file; when exceeded, file rotation occurs and older log files are removed based on {@link FileTargetOptions.maxFileCount}.
	 */
	maxSize: number;
};
