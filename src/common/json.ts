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
