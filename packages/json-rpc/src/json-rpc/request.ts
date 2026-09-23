import { z } from "zod/mini";

import { Id } from "./id.js";
import { Parameters } from "./parameters.js";

/**
 * Request object sent to a server.
 */
export type Request = {
	/**
	 * Identifies the request; when undefined, the request is treated as a notification.
	 */
	readonly id?: Id;

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
};

/**
 * Request object sent to a server.
 */
export const Request: z.ZodMiniType<Request, Request> = z.compile(
	z.object({
		id: z.optional(Id),
		jsonrpc: z.literal("2.0"),
		method: z.string(),
		params: Parameters,
	}),
);
