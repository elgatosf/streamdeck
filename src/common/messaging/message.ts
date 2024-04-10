import type { JsonValue } from "../json";

/**
 * Determines whether the specified {@link value} is a {@link RawMessageResponse}.
 * @param value Value.
 * @returns `true` when the value of a {@link RawMessageResponse}; otherwise `false`.
 */
export function isRequest(value: unknown): value is RawMessageRequest {
	return isMessage(value, "request") && has(value, "unidirectional", "boolean");
}

/**
 * Determines whether the specified {@link value} is a {@link RawMessageResponse}.
 * @param value Value.
 * @returns `true` when the value of a {@link RawMessageResponse; otherwise `false`.
 */
export function isResponse(value: unknown): value is RawMessageResponse {
	return isMessage(value, "response") && has(value, "status", "number");
}

/**
 * Determines whether the specified {@link value} is a message of type {@link type}.
 * @param value Value.
 * @param type Message type.
 * @returns `true` when the value of a {@link Message} of type {@link type}; otherwise `false`.
 */
function isMessage<T extends MessageType>(value: unknown, type: T): value is Message<T> {
	// The value should be an object.
	if (value === undefined || value === null || typeof value !== "object") {
		return false;
	}

	// The value should have a __type property of "response".
	if (!("__type" in value) || value.__type !== type) {
		return false;
	}

	// The value should should have at least an id, status, and path1.
	return has(value, "id", "string") && has(value, "path", "string");
}

/**
 * Determines whether the specified {@link key} exists in {@link obj}, and is typeof {@link type}.
 * @param obj Object to check.
 * @param key key to check for.
 * @param type Expected type.
 * @returns `true` when the {@link key} exists in the {@link obj}, and is typeof {@link type}.
 */
function has(obj: object, key: string, type: "boolean" | "number" | "string"): boolean {
	return key in obj && typeof obj[key as keyof typeof obj] === type;
}

/**
 * A message sent between the plugin and the property inspector.
 */
type Message<T extends MessageType> = {
	/**
	 * Identifies the object as a request or a response.
	 */
	readonly __type: T;

	/**
	 * Contents of the message.
	 */
	readonly body?: JsonValue;

	/**
	 * Unique identifier associated with message.
	 */
	readonly id: string;

	/**
	 * Path of the request.
	 */
	readonly path: string;
};

/**
 * Identifies the message type.
 */
type MessageType = "request" | "response";

/**
 * A message request sent from the client.
 */
export type RawMessageRequest = Message<"request"> & {
	/**
	 * Indicates whether the request is unidirectional; when `true`, a response will not be awaited.
	 */
	readonly unidirectional: boolean;
};

/**
 * A message response sent from the server.
 */
export type RawMessageResponse = Message<"response"> & {
	/**
	 * Code that indicates the response status.
	 * - `200` the request was successful.
	 * - `202` the request was unidirectional, and does not have a response.
	 * - `406` the request could not be accepted by the server.
	 * - `408` the request timed-out.
	 * - `500` the request failed.
	 * - `501` the request is not implemented by the server, and could not be fulfilled.
	 */
	readonly status: StatusCode;
};

/**
 * Status code of a response.
 * - `200` the request was successful.
 * - `202` the request was unidirectional, and does not have a response.
 * - `406` the request could not be accepted by the server.
 * - `408` the request timed-out.
 * - `500` the request failed.
 * - `501` the request is not implemented by the server, and could not be fulfilled.
 */
export type StatusCode =
	/**
	 * The request was successful.
	 */
	| 200

	/**
	 * The request was unidirectional, and does not have a response
	 */
	| 202

	/**
	 * The request could not be accepted by the server.
	 */
	| 406

	/**
	 * The request timed-out.
	 */
	| 408

	/**
	 * The request failed with an error.
	 */
	| 500

	/**
	 * The request is not implemented by the server, and could not be fulfilled.
	 */
	| 501;
