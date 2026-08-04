/**
 * Parses the specified value to a truthy boolean (using {@link https://stackoverflow.com/questions/784929/what-does-the-operator-do-in-javascript `!!` notation}).
 * @param value Value to parse.
 * @returns `true` when the value is truthy; otherwise `false`.
 */
export function parseBoolean(value: unknown): boolean | undefined {
	if (typeof value === "string" && (value === "0" || value === "false")) {
		return false;
	}

	return !!value;
}

/**
 * Parses the specified value to a number (using {@link parseFloat}).
 * @param value Value to parse.
 * @returns The parsed value; otherwise `undefined`.
 */
export function parseNumber(value: unknown): number | undefined {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value !== "string") {
		return undefined;
	}

	value = parseFloat(value);
	return typeof value === "number" && !isNaN(value) ? value : undefined;
}
