import { z } from "zod/v4-mini";

import type { JsonObject, JsonPrimitive, JsonValue } from "../../json.js";
import { JsonRpcError } from "./error.js";

/**
 * Successful response object sent to a client.
 */
export type JsonRpcSuccessResponse = {
	/**
	 * The JSON-RPC version.
	 */
	readonly jsonrpc: "2.0";

	/**
	 * Result of the RPC request.
	 */
	readonly result: Exclude<JsonPrimitive, undefined> | JsonObject | JsonValue[];

	/**
	 * Identifier of the RPC request.
	 */
	readonly id: string;
};

/**
 * Successful response object sent to a client.
 */
export const JsonRpcSuccessResponse: z.ZodMiniType<JsonRpcSuccessResponse> = z.strictObject({
	jsonrpc: z.literal("2.0"),
	result: z.any(),
	id: z.string(),
});

/**
 * Error response object sent to a client.
 */
export type JsonRpcErrorResponse = {
	/**
	 * The JSON-RPC version.
	 */
	readonly jsonrpc: "2.0";

	/**
	 * The error that occurred.
	 */
	readonly error: JsonRpcError;

	/**
	 * Identifier of the RPC request; this may be undefined if the error is for a notification.
	 */
	readonly id?: string;
};

/**
 * Error response object sent to a client.
 */
export const JsonRpcErrorResponse: z.ZodMiniType<JsonRpcErrorResponse> = z.strictObject({
	jsonrpc: z.literal("2.0"),
	error: JsonRpcError,
	id: z.optional(z.string()),
});

/**
 * Response object sent to a client.
 */
export const JsonRpcResponse = z.union([JsonRpcSuccessResponse, JsonRpcErrorResponse]);

/**
 * Response object sent to a client.
 */
export type JsonRpcResponse = z.infer<typeof JsonRpcResponse>;
