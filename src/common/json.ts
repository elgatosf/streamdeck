/**
 * JSON object.
 */
export type JsonObject = {
	[key: string]: JsonValue;
};

/**
 * JSON primitive value.
 */
export type JsonPrimitive = boolean | number | string | null | undefined;

/**
 * JSON value.
 */
export type JsonValue = JsonObject | JsonPrimitive | JsonValue[];

/**
 * Converts the source object to a serializable instance that includes members, and properties with getters.
 * @param source Source object to convert to a serializable.
 * @returns Serializable instance.
 */
export function toSerializable(source: unknown): unknown {
	if (source === undefined || source === null || typeof source !== "object") {
		return source;
	}

	const result: Record<string, object> = { ...source };
	const proto = Object.getPrototypeOf(source);

	for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
		if (desc.get) {
			result[name] = source[name as keyof typeof source];
		}
	}

	return result;
}
