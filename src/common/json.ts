/**
 * Credit to Maksim Zemskov
 * https://hackernoon.com/mastering-type-safe-json-serialization-in-typescript
 */

/**
 * JSON primitive value.
 */
export type JsonPrimitive = boolean | number | string | null | undefined;

/**
 * JSON value.
 */
export type JsonValue =
	| JsonPrimitive
	| JsonValue[]
	| {
			[key: string]: JsonValue;
	  };

/**
 * JSON compatible value.
 */
export type JsonCompatible<T> = unknown extends T
	? never
	: {
			[P in keyof T]: T[P] extends JsonValue ? T[P] : T[P] extends NotAssignableToJson ? never : JsonCompatible<T[P]>;
	  };

/**
 * Values that aren't assignable to JSON.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
type NotAssignableToJson = Function | bigint | symbol;
