import { LogLevel, type LogEntry } from "../../common/logging";

// Remove any dependencies on node.
const EOL = "\n";

/**
 * Formats the specified entry.
 * @param entry Log entry to format.
 * @returns The formatted log entry as a `string`.
 */
export type LogEntryFormatter = (entry: LogEntry) => string;

/**
 * Creates a new string log entry formatter.
 * @param opts Options that defines the type for the formatter.
 * @returns The string {@link LogEntryFormatter}.
 */
export function stringFormatter(opts?: StringFormatOptions): LogEntryFormatter {
	if (opts?.dataOnly) {
		return ({ data }) => `${reduce(data)}`;
	} else {
		return (entry: LogEntry) => {
			const { data, level, scope } = entry;

			let prefix = `${new Date().toISOString()} ${LogLevel[level].padEnd(5)} `;
			if (scope) {
				prefix += `${scope}: `;
			}

			return `${prefix}${reduce(data)}`;
		};
	}
}

/**
 * Options associated with {@link stringFormatter}.
 */
type StringFormatOptions = {
	/**
	 * Indicates whether the entry should only log the {@link LogEntry.data}.
	 */
	dataOnly?: boolean;
};

/**
 * Stringifies the provided data parameters that make up the log entry.
 * @param data Data parameters.
 * @returns The data represented as a single `string`.
 */
function reduce(data: unknown[]): string {
	let result = "";
	let previousWasError = false;

	for (const value of data) {
		// When the value is an error, write the stack.
		if (typeof value === "object" && value instanceof Error) {
			result += `${EOL}${value.stack}`;
			previousWasError = true;

			continue;
		}

		// When the previous was an error, write a new line.
		if (previousWasError) {
			result += EOL;
			previousWasError = false;
		}

		result += typeof value === "object" ? JSON.stringify(value) : value;
		result += " ";
	}

	return result.trimEnd();
}
