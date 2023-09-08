import { isDebugMode } from "../common/utils";
import { LogLevel } from "./log-level";
import type { LogTarget } from "./log-target";

/**
 * Logger capable of forwarding messages to a {@link LogTarget}.
 */
export class Logger {
	/**
	 * Backing field for the {@link Logger.level}.
	 */
	private _level?: LogLevel;

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

		if (typeof this.options.level !== "function") {
			this.setLevel(this.options.level);
		}
	}

	/**
	 * Gets the {@link LogLevel}.
	 * @returns The {@link LogLevel}.
	 */
	public get level(): LogLevel {
		if (this._level !== undefined) {
			return this._level;
		}

		return typeof this.options.level === "function" ? this.options.level() : this.options.level;
	}

	/**
	 * Creates a scoped logger with the given {@link scope}; logs created by scoped-loggers include their scope to enable their source to be easily identified.
	 * @param scope Value that represents the scope of the new logger.
	 * @returns The scoped logger, or this instance when {@link scope} is not defined.
	 */
	public createScope(scope: string): Logger | this {
		scope = scope.trim();
		if (scope === "") {
			return this;
		}

		return new Logger({
			...this.options,
			level: () => this.level,
			scope: this.options.scope ? `${this.options.scope}->${scope}` : scope
		});
	}

	/**
	 * Writes a debug log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public debug(message: string, error?: Error | unknown): this {
		return this.log(LogLevel.DEBUG, message, error);
	}

	/**
	 * Writes an error log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public error(message: string, error?: Error | unknown): this {
		return this.log(LogLevel.ERROR, message, error);
	}

	/**
	 * Writes an info log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public info(message: string, error?: Error | unknown): this {
		return this.log(LogLevel.INFO, message, error);
	}

	/**
	 * Sets the log-level that determines which logs should be written. **NB.** this level will be inherited by all scoped loggers unless they have log-level explicitly defined.
	 * @param level The log-level that determines which logs should be written; when `undefined`, the level will be inherited from the parent logger, or default to the environment level.
	 * @returns This instance for chaining.
	 */
	public setLevel(level?: LogLevel): this {
		if ((level === LogLevel.DEBUG || level === LogLevel.TRACE) && !isDebugMode()) {
			this._level = LogLevel.INFO;
			this.warn(`Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`);
		} else {
			this._level = level;
		}

		return this;
	}

	/**
	 * Write a trace log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public trace(message: string, error?: Error | unknown): this {
		return this.log(LogLevel.TRACE, message, error);
	}

	/**
	 * Writes a warning log {@link message}.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	public warn(message: string, error?: Error | unknown): this {
		return this.log(LogLevel.WARN, message, error);
	}

	/**
	 * Writes a log {@link message} with the specified {@link level}.
	 * @param level Log level of the message, printed as part of the overall log message.
	 * @param message Message to write to the log.
	 * @param error Optional error to log with the {@link message}.
	 * @returns This instance for chaining.
	 */
	private log(level: LogLevel, message: string, error?: Error | unknown): this {
		if (level <= this.level) {
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
	level: LogLevel | (() => LogLevel);

	/**
	 * Optional value that defines the scope of the logger.
	 */
	scope?: string;

	/**
	 * Log target that defines where log messages will be written.
	 */
	target: LogTarget;
};
