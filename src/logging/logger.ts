import { isDebugMode } from "../common/utils";
import { LogLevel } from "./log-level";
import type { LogTarget } from "./log-target";

/**
 * Logger capable of forwarding messages to a {@link LogTarget}.
 */
export class Logger {
	/**
	 * Options that define the loggers behavior.
	 */
	private readonly options: LoggerOptions;

	/**
	 * Scope associated with this {@link Logger}.
	 */
	private readonly scope: string;

	/**
	 * Initializes a new instance of the {@link Logger} class.
	 * @param opts Options that define the loggers behavior.
	 */
	constructor(opts: LoggerOptions) {
		this.options = { ...opts };
		this.scope = this.options.scope === undefined || this.options.scope.trim() === "" ? "" : `${this.options.scope}: `;

		this.setLevel(opts.level);
	}

	/**
	 * Gets the current {@link LogLevel}.
	 * @returns The {@link LogLevel}.
	 */
	public get level(): LogLevel {
		return this.options.level;
	}

	/**
	 * Creates a scoped logger with the given {@link scope}; logs created by scoped-loggers include their scope to enable their source to be easily identified.
	 * @param scope Value that represents the scope of the new logger.
	 * @returns The scoped logger.
	 */
	public createScope(scope: string): Logger {
		scope = scope.trim();
		if (scope === "") {
			return this;
		}

		return new Logger({
			...this.options,
			scope: this.options.scope ? `${this.options.scope}->${scope}` : scope
		});
	}

	/**
	 * Writes a debug log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public debug(message: string, error?: Error | unknown) {
		return this.log(LogLevel.DEBUG, message, error);
	}

	/**
	 * Writes an error log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public error(message: string, error?: Error | unknown) {
		return this.log(LogLevel.ERROR, message, error);
	}

	/**
	 * Writes an info log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public info(message: string, error?: Error | unknown) {
		return this.log(LogLevel.INFO, message, error);
	}

	/**
	 * Sets the log-level that determine which logs should be written; applies to all future scoped-loggers created from this instance. **NB.** previous scoped-loggers created from
	 * this instance will not have their log-level affected.
	 * @param level The log-level that determines which logs should be written.
	 * @returns This instance for chaining.
	 */
	public setLevel(level: LogLevel): Logger {
		if ((level === LogLevel.DEBUG || level === LogLevel.TRACE) && !isDebugMode()) {
			this.options.level = LogLevel.INFO;
			this.warn(`Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`);
		} else {
			this.options.level = level;
		}

		return this;
	}

	/**
	 * Write a trace log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public trace(message: string, error?: Error | unknown) {
		return this.log(LogLevel.TRACE, message, error);
	}

	/**
	 * Writes a warning log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public warn(message: string, error?: Error | unknown) {
		return this.log(LogLevel.WARN, message, error);
	}

	/**
	 * Writes a log {@link message} with the specified {@link level}.
	 * @param level Log level of the message, printed as part of the overall log message.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	private log(level: LogLevel, message: string, error?: Error | unknown) {
		if (level <= this.options.level) {
			this.options.target.write({
				level,
				message: `${this.scope}${message}`,
				error
			});
		}

		return this;
	}
}

/**
 * Options that define the logger's behavior.
 */
export type LoggerOptions = {
	/**
	 * Minimum log-level required for a log message to be written.
	 */
	level: LogLevel;

	/**
	 * Optional value that defines the scope of the logger.
	 */
	scope?: string;

	/**
	 * Log target that defines where log messages will be written.
	 */
	target: LogTarget;
};
