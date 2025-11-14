import { LogLevel } from "./level.js";

/**
 * A log target capable of capturing a log entry, e.g. to the file system, console, etc.
 */
export type LogTarget = {
	/**
	 * Writes the specified log entry to the target.
	 * @param entry The log entry to write.
	 */
	write(entry: LogEntry): void;
};

/**
 * Defines a log entry to be logged to a {@link LogTarget}.
 */
export type LogEntry = {
	/**
	 * Data to log.
	 */
	data: unknown[] | [string, ...unknown[]];

	/**
	 * Log level that indicates the severity of the log being written.
	 */
	level: LogLevel;

	/**
	 * Scope of the log entry.
	 */
	scope: string;
};

/**
 * Data to log.
 */
export type LogEntryData = unknown[] | [string, ...unknown[]];
