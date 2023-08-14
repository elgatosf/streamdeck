import { LogLevel } from "./log-level";
import type { LogTarget } from "./log-target";
import type { LoggingOptions } from "./logger-factory";

/**
 * Logger capable of forwarding messages to a {@link LogTarget}.
 */
export class Logger {
	/**
	 * Named associated with this {@link Logger}.
	 */
	private readonly name: string;

	/**
	 * Initializes a new instance of the {@link Logger} class.
	 * @param name Name of the {@link Logger}; this will be included as part of the messages being logged.
	 * @param options Options that define the logging behavior.
	 */
	constructor(name: string | undefined, private readonly options: LoggingOptions) {
		this.name = name === undefined ? "" : `${name}: `;
	}

	/**
	 * Writes a debug log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 */
	public debug(message: string, error?: Error | unknown) {
		this.log(LogLevel.DEBUG, message, error);
	}

	/**
	 * Writes a warning log `error`.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 */
	public error(message: string, error?: Error | unknown) {
		this.log(LogLevel.ERROR, message, error);
	}

	/**
	 * Writes an info log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 */
	public info(message: string, error?: Error | unknown) {
		this.log(LogLevel.INFO, message, error);
	}

	/**
	 * Write a trace log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 */
	public trace(message: string, error?: Error | unknown) {
		this.log(LogLevel.TRACE, message, error);
	}

	/**
	 * Writes a warning log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 */
	public warn(message: string, error?: Error | unknown) {
		this.log(LogLevel.WARN, message, error);
	}

	/**
	 * Writes a log {@link message} with the specified {@link logLevel}.
	 * @param logLevel Log level of the message, printed as part of the overall log message.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 */
	private log(logLevel: LogLevel, message: string, error?: Error | unknown): void {
		if (logLevel <= this.options.logLevel) {
			this.options.target.write(logLevel, `${this.name}${message}`, error);
		}
	}
}
