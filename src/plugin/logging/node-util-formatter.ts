import { EOL } from "node:os";
import { inspect } from "node:util";
import { LogLevel, type LogEntry } from "../../common/logging";

/**
 * Formats the specified entry, stringify'ing data using `node:inspect`.
 * @param entry Log entry to format.
 * @returns The formatted log entry as a `string`.
 */
export function format(entry: LogEntry): string {
	const { data, level, scope } = entry;

	let msg = `${new Date().toISOString()} ${LogLevel[level].padEnd(5)} `;
	if (scope) {
		msg += `${scope}: `;
	}

	return `${msg}${toString(data)}${EOL}`;
}

/**
 * Stringifies the provided data parameters that make up the log entry.
 * @param data Data parameters.
 * @returns The data represented as a single `string`.
 */
function toString(data: unknown[]): string {
	let result = "";
	let previousWasError = false;

	for (const value of data) {
		if (typeof value === "object" && value instanceof Error) {
			result += EOL;
			previousWasError = true;
		} else if (previousWasError) {
			result += EOL;
			previousWasError = false;
		}

		result += `${typeof value === "object" ? inspect(value, false, null, false) : value} `;
	}

	return result.trimEnd();
}
