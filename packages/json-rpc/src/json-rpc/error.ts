import type { JsonValue } from "@elgato/utils";
import { z } from "zod/mini";

import type { ErrorCode } from "./error-code.js";

/**
 * Contains information about an error that occurred on the server.
 */
export type Error = {
	/**
	 * Indicates the error type that occurred.
	 */
	readonly code: ErrorCode | number;

	/**
	 * Contains additional information about the error.
	 */
	readonly data?: JsonValue;

	/**
	 * Short description of the error.
	 */
	readonly message: string;
};

/**
 * Contains information about an error that occurred on the server.
 */
export const Error: z.ZodMiniType<Error, Error> = z.compile(
	z.object({
		code: z.int(),
		data: z.optional(z.json()),
		message: z.string(),
	}),
);
