import { z } from "zod/mini";

import { Id } from "./id.js";

/**
 * JSON-RPC object that contains an identifier.
 */
export type Identifiable = {
	/**
	 * Identifier used to correlate a request with its response.
	 */
	readonly id: Id;
};

/**
 * JSON-RPC object that contains an identifier.
 */
export const Identifiable: z.ZodMiniType<Identifiable, Identifiable> = z.compile(
	z.object({
		id: Id,
	}),
);
