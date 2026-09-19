import { z } from "zod/mini";

import { Parameters } from "./parameters.js";

/**
 * Request object sent to a server.
 */
export interface Request {
	/**
	 * Identifies the request; when undefined, the request is treated as a notification.
	 */
	readonly id?: string;

	/**
	 * The JSON-RPC version.
	 */
	readonly jsonrpc: "2.0";

	/**
	 * Name of the method to invoke.
	 */
	readonly method: string;

	/**
	 * Optional parameters supplied to the method.
	 */
	readonly params?: Parameters;
}

/**
 * Request object sent to a server.
 */
export const Request: z.ZodMiniType<Request, Request> = z.compile(
	z.object({
		id: z.optional(z.string()),
		jsonrpc: z.literal("2.0"),
		method: z.string(),
		params: Parameters,
	}),
);
