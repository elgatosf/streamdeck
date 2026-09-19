import { z } from "zod/mini";

import type { Result } from "./result.js";

/**
 * Successful response object sent to a client.
 */
export interface SuccessResponse {
	/**
	 * Identifier of the request.
	 */
	readonly id: string;

	/**
	 * The JSON-RPC version.
	 */
	readonly jsonrpc: "2.0";

	/**
	 * Result of the request.
	 */
	readonly result: Result;
}

/**
 * Successful response object sent to a client.
 */
export const SuccessResponse: z.ZodMiniType<SuccessResponse> = z.compile(
	z.strictObject({
		jsonrpc: z.literal("2.0"),
		result: z.any(),
		id: z.string(),
	}),
);
