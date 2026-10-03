import type { JsonObject } from "@elgato/utils";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod/mini";

import { Identifiable } from "../identifiable.js";

describe("Identifiable", () => {
	/**
	 * Asserts identifiable JSON-RPC objects are compatible with JSON objects.
	 */
	test("is compatible with JsonObject", () => {
		expectTypeOf<Identifiable>().toExtend<JsonObject>();
	});

	/**
	 * Asserts identifiable objects accept all identifier types defined by JSON-RPC.
	 */
	test.each(["request-id", 42, null])("accepts the identifier %j", (id) => {
		expect(z.safeParse(Identifiable, { id }).success).toBe(true);
	});

	/**
	 * Asserts an identifier is required.
	 */
	test("rejects an omitted identifier", () => {
		expect(z.safeParse(Identifiable, {}).success).toBe(false);
	});
});
