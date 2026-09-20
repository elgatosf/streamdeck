import type { JsonObject } from "@elgato/utils";
import { expectTypeOf, test } from "vitest";

import type { Error } from "../error.js";

/**
 * Asserts JSON-RPC errors are compatible with JSON objects.
 */
test("Error is compatible with JsonObject", () => {
	expectTypeOf<Error>().toExtend<JsonObject>();
});
