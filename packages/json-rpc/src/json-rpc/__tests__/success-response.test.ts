import type { JsonObject } from "@elgato/utils";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod/mini";

import { SuccessResponse } from "../success-response.js";

describe("SuccessResponse", () => {
	/**
	 * Asserts JSON-RPC success responses are compatible with JSON objects.
	 */
	test("is compatible with JsonObject", () => {
		expectTypeOf<SuccessResponse>().toExtend<JsonObject>();
	});

	/**
	 * Asserts success responses accept all identifier types defined by JSON-RPC.
	 */
	test.each(["request-id", 42, null])("accepts the identifier %j", (id) => {
		expect(z.safeParse(SuccessResponse, { id, jsonrpc: "2.0", result: null }).success).toBe(true);
	});
});
