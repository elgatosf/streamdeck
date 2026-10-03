import { z } from "zod/mini";

/**
 * Identifier used to correlate a request with its response.
 */
export type Id = number | string | null;

/**
 * Identifier used to correlate a request with its response.
 */
export const Id: z.ZodMiniType<Id, Id> = z.compile(z.union([z.string(), z.number(), z.null()]));
