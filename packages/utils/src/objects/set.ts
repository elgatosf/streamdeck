const FORBIDDEN_PROP_NAMES = new Set(["", "__proto__", "prototype", "constructor"]);

/**
 * Sets the specified `value` on the `target` object at the desired property `path`.
 * @param target The target object that is being written to.
 * @param path The path to the property to set.
 * @param value The value to write.
 */
export function set(target: object, path: string, value: unknown): void {
	const props = path.split(".");

	// Validate the path does not contain forbidden segments.
	for (const prop of props) {
		if (FORBIDDEN_PROP_NAMES.has(prop)) {
			throw new Error(`Unsafe path segment "${prop}" in "${path}"`);
		}
	}

	// Ensure there is a path to the value.
	let curr = target as Record<string, unknown>;
	for (let i = 0; i < props.length - 1; i++) {
		const prop = props[i];
		let value = Object.hasOwn(curr, prop) ? curr[prop] : undefined;

		if (value === null || (typeof value !== "object" && typeof value !== "function")) {
			defineProperty(curr, prop, (value = {}));
		}

		curr = value as Record<string, unknown>;
	}

	// Set the value.
	defineProperty(curr, props[props.length - 1], value);
}

/**
 * Defines a property on the specified object.
 * @param obj Object where the property will be defined.
 * @param prop Property name.
 * @param value Initial value.
 */
function defineProperty<T>(obj: T, prop: PropertyKey, value: unknown): void {
	Object.defineProperty(obj, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true,
	});
}
