import { LogLevel } from "./log-level";

/**
 * A log target capable of capturing a log entry, e.g. to the file system, console, etc.
 */
export type LogTarget = {
	/**
	 * Writes the specified {@link entry} to the log target.
	 * @param entry The log entry to write.
	 */
	write(entry: LogEntry): void;
};

/**
 * Defines a log entry to be logged to a {@link LogTarget}.
 */
export type LogEntry = {
	/**
	 * Log level that indicates the severity of the log being written.
	 */
	level: LogLevel;

	/**
	 * Message associated with the log entry, aka the log.
	 */
	message: string;

	/**
	 * Optional error provided to be written as part of the log.
	 */
	error?: Error | unknown;
};
