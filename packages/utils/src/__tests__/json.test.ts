import { assertType, describe, test } from "vitest";

import type { JsonObject, JsonPrimitive, JsonValue } from "../index.js";

describe("json", () => {
	test("JsonObject", () => {
		assertType<JsonObject>({
			name: "Elgato",
		});
	});

	describe("JsonPrimitive", () => {
		test("boolean", () => {
			assertType<JsonPrimitive>(true);
			assertType<JsonPrimitive>(false);
		});

		test("number", () => assertType<JsonPrimitive>(1));
		test("string", () => assertType<JsonPrimitive>("Hello"));
		test("null", () => assertType<JsonPrimitive>(null));
		test("undefined", () => assertType<JsonPrimitive>(undefined));
	});

	describe("JsonValue", () => {
		test("array", () => assertType<JsonValue>(["array"]));
		test("object", () => assertType<JsonValue>({}));
		test("primitive", () => assertType<JsonValue>(true));
	});
});
