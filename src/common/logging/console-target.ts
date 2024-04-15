import { LogLevel } from ".";
import type { LogEntry, LogTarget } from "./target";

/**
 * Provides a {@link LogTarget} that logs to the console.
 */
export class ConsoleTarget implements LogTarget {
	/**
	 * @inheritdoc
	 */
	public write(entry: LogEntry): void {
		switch (entry.level) {
			case LogLevel.ERROR:
				console.error(...entry.data);
				break;

			case LogLevel.WARN:
				console.warn(...entry.data);
				break;

			default:
				console.log(...entry.data);
		}
	}
}
