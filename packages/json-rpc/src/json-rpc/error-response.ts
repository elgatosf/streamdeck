import { z } from "zod/mini";

import { Error } from "./error.js";

/**
 * Error response object sent to a client.
 */
export type ErrorResponse = {
	/**
	 * Identifier of the request, or null if there was an error detecting the id of the request.
	 */
	readonly id: string | null;

	/**
	 * The error that occurred.
	 */
	readonly error: Error;

	/**
	 * The JSON-RPC version.
	 */
	readonly jsonrpc: "2.0";
};

/**
 * Error response object sent to a client.
 */
export const ErrorResponse: z.ZodMiniType<ErrorResponse, ErrorResponse> = z.compile(
	z.strictObject({
		jsonrpc: z.literal("2.0"),
		error: Error,
		id: z.union([z.string(), z.null()]),
	}),
);
