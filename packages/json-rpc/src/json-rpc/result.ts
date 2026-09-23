import type { JsonObject, JsonValue } from "@elgato/utils";

/**
 * Result sent with a response.
 */
export type Result = JsonObject | JsonValue[] | boolean | number | string | null;
