import { LogLevel } from "./log-level";

/**
 * A log target capable of capturing a log message, e.g. to the file system, console, etc.
 */
export type LogTarget = {
	/**
	 * Writes the {@link message}, and optional {@link error}, to the log target.
	 * @param logLevel Log level that indicates the severity of the log being written.
	 * @param message Message being written.
	 * @param error Optional error provided to be written as part of the log.
	 */
	write(logLevel: LogLevel, message: string, error?: Error | unknown): void;
};
