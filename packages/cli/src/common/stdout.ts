import chalk from "chalk";
import isInteractive from "is-interactive";
import logSymbols from "log-symbols";

/**
 * Symbols that denote a spinner.
 */
const SPIN_SYMBOLS = ["|", "/", "-", "\\"];

/**
 * Creates a new {@link ConsoleStdOut}.
 * @param reduceMotion Determines whether the standard output stream should display non-essential motion, e.g. spinning bars.
 * @returns The {@link ConsoleStdOut}.
 */
export function createConsole(reduceMotion: boolean): StdOut {
	const interactive = isInteractive() && process.stdout.clearLine !== undefined;
	return new ConsoleStdOut({
		interactive,
		level: MessageLevel.LOG,
		reduceMotion: reduceMotion || !interactive,
	});
}

/**
 * Creates a new {@link ConsoleStdOut} that is only capable of outputting important messages.
 * @returns The {@link ConsoleStdOut}.
 */
export function createQuietConsole(): StdOut {
	return new ConsoleStdOut({
		interactive: false,
		level: MessageLevel.WARN,
		reduceMotion: true,
	});
}

/**
 * Prettifies the value for output.
 * @param value Value to prettify.
 * @returns Prettified value.
 */
export function colorize(value: unknown): string {
	if (typeof value === "string") {
		return chalk.green(`'${value}'`);
	}

	return chalk.yellow(value);
}

/**
 * Options associated with a {@link ConsoleStdOut}.
 */
type ConsoleStdOutOptions = {
	/**
	 * Determines whether the standard output stream is interactive.
	 */
	interactive: boolean;

	/**
	 * The minimum {@link MessageLevel} to write.
	 */
	level: MessageLevel;

	/**
	 * Determines whether the standard output stream should display non-essential motion, e.g. spinning bars.
	 */
	reduceMotion: boolean;
};

/**
 * Provides interactive console writer that writes to the stdout, including a spinner and status results.
 */
export type StdOut = ConsoleStdOut;

/**
 * Error thrown when the stdout should exit with an error code.
 */
export class StdoutError extends Error {
	/**
	 * Initializes a new instance of the {@link StdoutError} class.
	 * @param message Message associated with the error.
	 */
	constructor(message?: string) {
		super(message);
	}
}

/**
 * Provides interactive console writer that writes to the stdout, including a spinner and status results.
 */
class ConsoleStdOut {
	/**
	 * Private backing field for {@link ConsoleStdOut.isLoading}.
	 */
	private _isLoading = false;

	/**
	 * Current symbol index.
	 */
	private index = -1;

	/**
	 * The active message associated with the task denoted by the spinner.
	 */
	private message = "";

	/**
	 * Identifies the timer responsible for displaying the spinning symbol.
	 */
	private timerId?: NodeJS.Timeout;

	/**
	 * Initializes a new instance of the {@link ConsoleStdOut} class.
	 * @param options Options associated with this instance.
	 */
	constructor(private readonly options: ConsoleStdOutOptions) {}

	/**
	 * Gets a value that determines whether there is active loading-feedback, e.g. spinning ({@link ConsoleStdOut.spin}) due to a task running.
	 * @returns `true` when the feedback is spinning; otherwise `false`.
	 */
	public get isLoading(): boolean {
		return this._isLoading;
	}

	/**
	 * Display the {@link message} as an error message, and stops any current interactive feedback (spinners).
	 * @param message Optional text to display.
	 * @returns An error reporter capable of outputting more detailed information.
	 */
	public error(message: string = this.message): ErrorReporter {
		this.stopAndWrite({ level: MessageLevel.ERROR, text: message });
		return new ErrorReporter();
	}

	/**
	 * Exits the process.
	 * @param code Optional exit code.
	 */
	public exit(code?: number): never {
		process.exit(code);
	}

	/**
	 * Display the {@link message} as an informational message, and stops any current interactive feedback (spinners).
	 * @param message Optional text to display.
	 * @returns This instance for chaining.
	 */
	public info(message: string = this.message): this {
		return this.stopAndWrite({ level: MessageLevel.INFO, text: message });
	}

	/**
	 * Logs the specified {@link message} to the console.
	 * @param message Message to write.
	 * @returns This instance for chaining.
	 */
	public log(message?: unknown): this {
		if (MessageLevel.LOG > this.options.level) {
			return this;
		}

		// When interactive, the loading message should always be the last message.
		if (this.isLoading && this.options.interactive) {
			process.stdout.cursorTo(0);
			process.stdout.clearLine(1);
		}

		if (message === undefined) {
			console.log();
		} else {
			console.log(message);
		}

		// When loading, we must check if we can rely on the timer to re-write the message. When reduce motion is active, re-write the message ourselves.
		if (this.isLoading && this.options.reduceMotion && this.options.interactive) {
			process.stdout.write(`- ${this.message}`);
		}

		return this;
	}

	/**
	 * Displays an interactive spinner and the {@link message}.
	 * @param message Text to show next to the spinner.
	 * @param task Task that the spinner represents.
	 * @returns A promise fulfilled when the {@link task} completes.
	 */
	public async spin(
		message: string,
		task?: (writer: ConsoleStdOut, spin: Spinner) => Promise<number | void> | void,
	): Promise<void> {
		// Confirm we can spin.
		if (this.options.level < MessageLevel.LOG) {
			return;
		}

		// Ensure only a single operation displays live-feedback.
		if (this.isLoading) {
			throw new Error("An operation is already occupying the busy indicator.");
		}

		// Start the spinner; when there is a task, we should wait for it.
		this.message = message;
		if (task === undefined) {
			this.startSpinner();
		} else {
			try {
				this.startSpinner();
				await task(this, {
					setText: (message: string) => (this.message = message),
				});

				if (this.isLoading) {
					this.success();
				}
			} catch (err) {
				if (this.isLoading) {
					this.error();
				}

				throw err;
			}
		}
	}

	/**
	 * Display the {@link message} as a success message, and stops any current interactive feedback (spinners).
	 * @param message Optional text to display.
	 * @returns This instance for chaining.
	 */
	public success(message: string = this.message): this {
		return this.stopAndWrite({ level: MessageLevel.SUCCESS, text: message });
	}

	/**
	 * Display the {@link message} as a warning message, and stops any current interactive feedback (spinners).
	 * @param message Optional text to display.
	 * @returns This instance for chaining.
	 */
	public warn(message: string = this.message): this {
		return this.stopAndWrite({ level: MessageLevel.WARN, text: message });
	}

	/**
	 * Gets the symbol associated with the {@link level}.
	 * @param level Message level.
	 * @returns Associated symbol that denotes the {@link level} as an icon.
	 */
	private getSymbol(level: MessageLevel): string {
		if (process.env.VisualStudioVersion) {
			return "";
		}

		switch (level) {
			case MessageLevel.ERROR:
				return `${logSymbols.error} `;
			case MessageLevel.WARN:
				return `${logSymbols.warning} `;
			case MessageLevel.SUCCESS:
				return `${logSymbols.success} `;
			case MessageLevel.INFO:
				return `${logSymbols.info} `;
			default:
				return "logSymbols.error";
		}
	}

	/**
	 * Starts the spinner.
	 */
	private startSpinner(): void {
		const write = (symbol: string): void => {
			process.stdout.clearLine(1); // Prevent flickering
			process.stdout.cursorTo(0);
			process.stdout.write(`${symbol} ${this.message}`);
		};

		if (!this.options.interactive) {
			console.log(this.message);
		} else if (this.options.reduceMotion) {
			write("-");
		} else {
			this.timerId = setInterval(() => write(SPIN_SYMBOLS[++this.index % SPIN_SYMBOLS.length]), 150);
		}

		this._isLoading = true;
	}

	/**
	 * Writes the message; when there is an active spinner, it is stopped and the message is associated with the task that was running.
	 * @param param0 Message to display.
	 * @param param0.level The {@link MessageLevel} associated with the message.
	 * @param param0.text Text to write.
	 * @returns This instance for chaining.
	 */
	private stopAndWrite({ level, text }: Message): this {
		if (this._isLoading) {
			if (this.timerId) {
				clearInterval(this.timerId);
				this.timerId = undefined;
			}

			if (this.options.interactive) {
				process.stdout.cursorTo(0);
				process.stdout.clearLine(1);
			}
		}

		this._isLoading = false;
		if (level <= this.options.level) {
			console.log(`${this.getSymbol(level)}${text}`);
		}

		return this;
	}
}

/**
 * Spinner that indicates a busy status.
 */
type Spinner = {
	setText(message: string): void;
};

/**
 * Provides logging and exiting facilities as part of reporting an error.
 */
class ErrorReporter {
	/**
	 * Determines whether a message has been logged; the first log is yellow.
	 */
	private hasMessageBeenLogged = false;

	/**
	 * Exits the process.
	 * @param code Optional exit code.
	 */
	public exit(code?: number): never {
		process.exit(code);
	}

	/**
	 * Logs a message to the console; if this is the first message as part of the reporter, the message will be highlighted in yellow.
	 * @param message Message to log.
	 * @returns This instance for chaining.
	 */
	public log(message: unknown): this {
		console.log();

		if (this.hasMessageBeenLogged) {
			console.log(message);
		} else {
			console.log(chalk.yellow(message));
		}

		this.hasMessageBeenLogged = true;
		return this;
	}
}

/**
 * Provides information for a message to display as part of the spinner.
 */
type Message = {
	/**
	 * Level of the message; this also represents the symbol that will be shown.
	 */
	level: MessageLevel;

	/**
	 * Text shown next to the symbol.
	 */
	text: unknown;
};

/**
 * Levels of logging used by {@link ConsoleStdOut}.
 */
enum MessageLevel {
	/**
	 * Error message used to indicate an error was thrown, or something critically went wrong.
	 */
	ERROR = 0,

	/**
	 * Warning message used to indicate something went wrong, but the application is able to recover.
	 */
	WARN = 1,

	/**
	 * Success message that indicates the completion of a task or operation
	 */
	SUCCESS = 2,

	/**
	 * Information message for general usage.
	 */
	INFO = 3,

	/**
	 * Miscellaneous information that is not represented by a symbol.
	 */
	LOG = 4,
}
