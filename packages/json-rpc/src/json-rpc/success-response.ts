import { z } from "zod/mini";

import { Id } from "./id.js";
import type { Result } from "./result.js";

/**
 * Successful response object sent to a client.
 */
export type SuccessResponse = {
	/**
	 * Identifier of the request.
	 */
	readonly id: Id;

	/**
	 * The JSON-RPC version.
	 */
	readonly jsonrpc: "2.0";

	/**
	 * Result of the request.
	 */
	readonly result: Result;
};

/**
 * Successful response object sent to a client.
 */
export const SuccessResponse: z.ZodMiniType<SuccessResponse, SuccessResponse> = z.compile(
	z.strictObject({
		jsonrpc: z.literal("2.0"),
		result: z.json(),
		id: Id,
	}),
);
