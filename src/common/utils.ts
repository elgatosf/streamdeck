/**
 * Prevents the modification of existing property attributes and values on the value, and all of its child properties, and prevents the addition of new properties.
 * @param value Value to freeze.
 */
export function freeze<T>(value: T): void {
	if (value !== undefined && value !== null && typeof value === "object" && !Object.isFrozen(value)) {
		Object.freeze(value);
		Object.values(value).forEach(freeze);
	}
}

/**
 * Gets the value at the specified {@link path}.
 * @param path Path to the property to get.
 * @param source Source object that is being read from.
 * @returns Value of the property.
 */
export function get(path: string, source: unknown): unknown {
	const props: string[] = path.split(".");
	return props.reduce((obj, prop) => obj && obj[prop as keyof object], source);
}

/**
 * Utility type that acts as an alternate for `type[key]`. This type provides better support for aliasing
 * types when parsing them using the abstract syntax tree, used when generating documentation.
 */
export type KeyOf<T, K extends keyof T> = Omit<T[K], "">;
