/**
 * Levels of logging.
 */
export enum LogLevel {
	/**
	 * Error message used to indicate an error was thrown, or something critically went wrong.
	 */
	ERROR = 0,

	/**
	 * Warning message used to indicate something went wrong, but the application is able to recover.
	 */
	WARN = 1,

	/**
	 * Information message for general usage.
	 */
	INFO = 2,

	/**
	 * Debug message used to detail information useful for profiling the applications runtime.
	 */
	DEBUG = 3,

	/**
	 * Trace message used to monitor low-level information such as method calls, performance tracking, etc.
	 */
	TRACE = 4,
}
