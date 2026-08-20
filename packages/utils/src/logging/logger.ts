import { defcon, type LogLevel } from "./level.js";
import type { LogEntry, LogEntryData, LogTarget } from "./target.js";

/**
 * Logger capable of forwarding messages to a {@link LogTarget}.
 */
export class Logger {
	/**
	 * Backing field for the {@link Logger.level}.
	 */
	#level?: LogLevel;

	/**
	 * Options that define the loggers behavior.
	 */
	readonly #options: LoggerOptions & Required<Pick<LoggerOptions, "minimumLevel">>;

	/**
	 * Scope associated with this {@link Logger}.
	 */
	readonly #scope: string;

	/**
	 * Initializes a new instance of the {@link Logger} class.
	 * @param opts Options that define the loggers behavior.
	 */
	constructor(opts: LoggerOptions) {
		this.#options = { minimumLevel: "trace", ...opts };
		this.#scope = this.#options.scope === undefined || this.#options.scope.trim() === "" ? "" : this.#options.scope;

		if (typeof this.#options.level !== "function") {
			this.setLevel(this.#options.level);
		}
	}

	/**
	 * Gets the {@link LogLevel}.
	 * @returns The {@link LogLevel}.
	 */
	public get level(): LogLevel {
		if (this.#level !== undefined) {
			return this.#level;
		}

		return typeof this.#options.level === "function" ? this.#options.level() : this.#options.level;
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
			...this.#options,
			level: () => this.level,
			scope: this.#options.scope ? `${this.#options.scope}->${scope}` : scope,
		});
	}

	/**
	 * Writes the arguments as a debug log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public debug(...data: LogEntryData): this {
		return this.write({ level: "debug", data, scope: this.#scope });
	}

	/**
	 * Writes the arguments as error log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public error(...data: LogEntryData): this {
		return this.write({ level: "error", data, scope: this.#scope });
	}

	/**
	 * Writes the arguments as an info log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public info(...data: LogEntryData): this {
		return this.write({ level: "info", data, scope: this.#scope });
	}

	/**
	 * Sets the log-level that determines which logs should be written. The specified level will be inherited by all scoped loggers unless they have log-level explicitly defined.
	 * @param level The log-level that determines which logs should be written; when `undefined`, the level will be inherited from the parent logger, or default to the environment level.
	 * @returns This instance for chaining.
	 */
	public setLevel(level?: LogLevel): this {
		if (level !== undefined && defcon(level) > defcon(this.#options.minimumLevel)) {
			this.#level = "info";
		} else {
			this.#level = level;
		}

		return this;
	}

	/**
	 * Writes the arguments as a trace log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public trace(...data: LogEntryData): this {
		return this.write({ level: "trace", data, scope: this.#scope });
	}

	/**
	 * Writes the arguments as a warning log entry.
	 * @param data Message or data to log.
	 * @returns This instance for chaining.
	 */
	public warn(...data: LogEntryData): this {
		return this.write({ level: "warn", data, scope: this.#scope });
	}

	/**
	 * Writes the log entry.
	 * @param entry Log entry to write.
	 * @returns This instance for chaining.
	 */
	public write(entry: LogEntry): this {
		if (defcon(entry.level) <= defcon(this.level)) {
			this.#options.targets.forEach((t) => t.write(entry));
		}

		return this;
	}
}

/**
 * Options that define the logger's behavior.
 */
export type LoggerOptions = {
	/**
	 * Determines the minimum level of logs that can be written.
	 */
	level: LogLevel | (() => LogLevel);

	/**
	 * Minimum level the logger can be set to.
	 */
	minimumLevel?: LogLevel;

	/**
	 * Optional value that defines the scope of the logger.
	 */
	scope?: string;

	/**
	 * Log targets where logs will be written to.
	 */
	targets: LogTarget[];
};
