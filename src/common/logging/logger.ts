import { LogLevel } from "./level";
import type { LogEntryData, LogTarget } from "./target";

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
		this.scope = this.options.scope === undefined || this.options.scope.trim() === "" ? "" : this.options.scope;

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
	 * Writes the arguments as a debug log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public debug(...data: LogEntryData): this {
		return this.log(LogLevel.DEBUG, ...data);
	}

	/**
	 * Writes the arguments as error log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public error(...data: LogEntryData): this {
		return this.log(LogLevel.ERROR, ...data);
	}

	/**
	 * Writes the arguments as an info log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public info(...data: LogEntryData): this {
		return this.log(LogLevel.INFO, ...data);
	}

	/**
	 * Sets the log-level that determines which logs should be written. The specified level will be inherited by all scoped loggers unless they have log-level explicitly defined.
	 * @param level The log-level that determines which logs should be written; when `undefined`, the level will be inherited from the parent logger, or default to the environment level.
	 * @returns This instance for chaining.
	 */
	public setLevel(level?: LogLevel): this {
		if ((level === LogLevel.DEBUG || level === LogLevel.TRACE) && !this.options.isDebugMode) {
			this._level = LogLevel.INFO;
			this.warn(`Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`);
		} else {
			this._level = level;
		}

		return this;
	}

	/**
	 * Writes the arguments as a trace log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public trace(...data: LogEntryData): this {
		return this.log(LogLevel.TRACE, ...data);
	}

	/**
	 * Writes the arguments as a warning log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public warn(...data: LogEntryData): this {
		return this.log(LogLevel.WARN, ...data);
	}

	/**
	 * Writes a log entry.
	 * @param level Log level of the message, printed as part of the overall log message.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	private log(level: LogLevel, ...data: LogEntryData): this {
		if (level <= this.level) {
			this.options.targets.forEach((t) => t.write({ data, level, scope: this.scope }));
		}

		return this;
	}
}

/**
 * Options that define the logger's behavior.
 */
export type LoggerOptions = {
	/**
	 * Indicates whether the current context is running in debug mode.
	 */
	isDebugMode: boolean;

	/**
	 * Determines the minimum level of logs that can be written.
	 */
	level: LogLevel | (() => LogLevel);

	/**
	 * Optional value that defines the scope of the logger.
	 */
	scope?: string;

	/**
	 * Log targets where logs will be written to.
	 */
	targets: LogTarget[];
};
