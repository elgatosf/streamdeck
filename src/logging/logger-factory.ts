import { isDebugMode } from "../common/utils";
import { LogLevel } from "./log-level";
import { LogTarget } from "./log-target";
import { Logger } from "./logger";

/**
 * Provides a factory capable of creating {@link Logger}.
 */
export class LoggerFactory {
	/**
	 * Local logger associated with the {@link LoggerFactory}.
	 */
	private readonly logger: Logger;

	/**
	 * Cache of loggers created by this factory.
	 */
	private readonly loggers = new Map<string | undefined, Logger>();

	/**
	 * Options that define the default behavior of the {@link LoggerFactory}, and all {@link Logger} created from it.
	 */
	private readonly options: LoggingOptions;

	/**
	 * Initializes a new instance of the {@link LoggerFactory} class.
	 * @param opts Options that define the default behavior of the {@link LoggerFactory}, and all {@link Logger} created from it.
	 */
	constructor(opts: LoggingOptions) {
		this.options = { ...opts };
		this.logger = this.createLogger("LoggerFactory");

		if (!this.setLogLevel(opts.logLevel)) {
			this.setLogLevel(LogLevel.INFO);
		}
	}

	/**
	 * Creates a scoped {@link Logger} with an optional {@link name}. When a {@link name} is provided, all logs written to the logger will be prefixed with the {@link name} to enable
	 * their source be easily identified.
	 * @param name Name of the {@link Logger}.
	 * @returns The {@link Logger}.
	 */
	public createLogger(name?: string): Logger {
		let logger = this.loggers.get(name);

		if (logger === undefined) {
			logger = new Logger(name, this.options);
			this.loggers.set(name, logger);
		}

		return logger;
	}

	/**
	 * Sets the minimum log level used to determine which log message can be written; default is {@link LogLevel.INFO}, or {@link LogLevel.DEBUG} whilst a debugger can be attached.
	 * **NB.** {@link LogLevel} can only be set to {@link LogLevel.TRACE} or {@link LogLevel.DEBUG} whilst the plugin is in debug mode. Debug mode can be enabled by setting `Nodejs.Inspect`
	 * to `true` within the manifest.
	 * @param value Minimum log level.
	 * @returns `true` when the log level was successfully updated; otherwise `false`.
	 */
	public setLogLevel(value: LogLevel) {
		if ((value === LogLevel.DEBUG || value === LogLevel.TRACE) && !isDebugMode()) {
			this.logger.warn(`Log level cannot be set to ${LogLevel[value]} whilst not in debug mode.`);
			return false;
		}

		this.options.logLevel = value;
		return true;
	}
}

/**
 * Defines the default logging behavior.
 */
export type LoggingOptions = {
	/**
	 * Minimum log-level required for a log message to be written.
	 */
	logLevel: LogLevel;

	/**
	 * Log target that defines where log messages will be written.
	 */
	target: LogTarget;
};
