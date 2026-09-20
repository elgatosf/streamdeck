import type { JsonObject } from "@elgato/utils";
import { expectTypeOf, test } from "vitest";

import type { ErrorResponse } from "../error-response.js";

/**
 * Asserts JSON-RPC error responses are compatible with JSON objects.
 */
test("ErrorResponse is compatible with JsonObject", () => {
	expectTypeOf<ErrorResponse>().toExtend<JsonObject>();
});
