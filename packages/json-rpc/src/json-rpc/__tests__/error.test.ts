import type { JsonObject } from "@elgato/utils";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod/mini";

import { Error } from "../error.js";

describe("Error", () => {
	/**
	 * Asserts JSON-RPC errors are compatible with JSON objects.
	 */
	test("is compatible with JsonObject", () => {
		expectTypeOf<Error>().toExtend<JsonObject>();
	});

	/**
	 * Asserts error data may be omitted.
	 */
	test("accepts omitted data", () => {
		expect(z.safeParse(Error, { code: -32603, message: "Internal error" }).success).toBe(true);
	});

	/**
	 * Asserts error codes must be integers.
	 */
	test("rejects a fractional code", () => {
		expect(z.safeParse(Error, { code: 1.5, message: "Invalid code" }).success).toBe(false);
	});

	/**
	 * Asserts error data must be JSON-compatible.
	 */
	test("rejects non-JSON data", () => {
		expect(z.safeParse(Error, { code: -32603, data: 1n, message: "Internal error" }).success).toBe(false);
	});
});
