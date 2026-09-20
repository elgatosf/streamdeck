import type { JsonObject } from "@elgato/utils";
import { expectTypeOf, test } from "vitest";

import type { Request } from "../request.js";

/**
 * Asserts JSON-RPC requests are compatible with JSON objects.
 */
test("Request is compatible with JsonObject", () => {
	expectTypeOf<Request>().toExtend<JsonObject>();
});
