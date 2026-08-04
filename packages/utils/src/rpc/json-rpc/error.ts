import { z } from "zod/v4-mini";

import type { JsonValue } from "../../json.js";

/**
 * Contains information about an error that occurred.
 */
export type JsonRpcError = {
	/**
	 * Indicates the error type that occurred.
	 */
	readonly code: JsonRpcErrorCode | number;

	/**
	 * Short description of the error.
	 */
	readonly message: string;

	/**
	 * Contains additional information about the error.
	 */
	readonly data?: JsonValue;
};

/**
 * Contains information about an error that occurred on the server.
 */
export const JsonRpcError: z.ZodMiniType<JsonRpcError> = z.object({
	code: z.number(),
	message: z.string(),
	data: z.any(),
});

/**
 * Reserved error codes for JSON-RPC 2.0.
 */
export const JsonRpcErrorCode = {
	/**
	 * Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.
	 */
	ParseError: -32700,

	/**
	 * 	The JSON sent is not a valid Request object.
	 */
	InvalidRequest: -32600,

	/**
	 * 	The method does not exist / is not available.
	 */
	MethodNotFound: -32601,

	/**
	 * Invalid method parameter(s).
	 */
	InvalidParams: -32602,

	/**
	 * Internal JSON-RPC error.
	 */
	InternalError: -32603,
} as const;

/**
 * Reserved error codes for JSON-RPC 2.0.
 */
export type JsonRpcErrorCode = (typeof JsonRpcErrorCode)[keyof typeof JsonRpcErrorCode];
