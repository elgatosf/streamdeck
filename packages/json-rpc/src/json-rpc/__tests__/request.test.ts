import type { JsonObject } from "@elgato/utils";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod/mini";

import { Request } from "../request.js";

describe("Request", () => {
	/**
	 * Asserts JSON-RPC requests are compatible with JSON objects.
	 */
	test("is compatible with JsonObject", () => {
		expectTypeOf<Request>().toExtend<JsonObject>();
	});

	/**
	 * Asserts requests accept all identifier types defined by JSON-RPC.
	 */
	test.each(["request-id", 42, null])("accepts the identifier %j", (id) => {
		expect(z.safeParse(Request, { id, jsonrpc: "2.0", method: "method" }).success).toBe(true);
	});
});
