import type { JsonObject } from "@elgato/utils";
import { expectTypeOf, test } from "vitest";

import type { SuccessResponse } from "../success-response.js";

/**
 * Asserts JSON-RPC success responses are compatible with JSON objects.
 */
test("SuccessResponse is compatible with JsonObject", () => {
	expectTypeOf<SuccessResponse>().toExtend<JsonObject>();
});
