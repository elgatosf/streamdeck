import type { JsonObject, JsonValue } from "@elgato/utils";
import { z } from "zod/mini";

/**
 * Parameters sent with a request.
 */
export type Parameters = JsonObject | JsonValue[] | undefined;

/**
 * Parameters sent with a request.
 */
export const Parameters: z.ZodMiniType<Parameters, Parameters> = z.compile(
	z.optional(
		z.union([
			z.record(z.string(), z.json()),
			z.array(z.json()),
			z.undefined(),
		]),
	),
);
