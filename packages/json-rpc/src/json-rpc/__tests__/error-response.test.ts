import type { JsonObject } from "@elgato/utils";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod/mini";

import { ErrorResponse } from "../error-response.js";

describe("ErrorResponse", () => {
	/**
	 * Asserts JSON-RPC error responses are compatible with JSON objects.
	 */
	test("is compatible with JsonObject", () => {
		expectTypeOf<ErrorResponse>().toExtend<JsonObject>();
	});

	/**
	 * Asserts error responses accept all identifier types defined by JSON-RPC.
	 */
	test.each(["request-id", 42, null])("accepts the identifier %j", (id) => {
		expect(
			z.safeParse(ErrorResponse, {
				error: { code: -32603, data: null, message: "Internal error" },
				id,
				jsonrpc: "2.0",
			}).success,
		).toBe(true);
	});
});
