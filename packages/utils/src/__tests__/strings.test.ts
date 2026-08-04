import { describe, expect, test } from "vitest";

import { format } from "../strings.js";

describe("format", () => {
	/**
	 * Provides assertions for a successful format.
	 */
	describe("success", () => {
		test("empty format string", () => {
			expect(format("")).toBe("");
		});

		test("placeholders", () => {
			expect(format("Hello {0}", "world")).toBe("Hello world");
		});

		test("multiple placeholders", () => {
			expect(format("{0} {1} {2}", "a", "b", "c")).toBe("a b c");
		});

		test("repeating placeholders", () => {
			expect(format("{0} {0} {0}", "a", "b", "c")).toBe("a a a");
		});
	});

	/**
	 * Provides assertions for the stringification of different args.
	 */
	describe("stringification", () => {
		test("number", () => {
			expect(format("{0} + {1} = {2}", 1, 2, 3)).toBe("1 + 2 = 3");
		});

		test("null and boolean arguments", () => {
			expect(format("{0} {1} {2}", null, true, false)).toBe("null true false");
		});

		test("object with toString", () => {
			const obj = { toString: () => "Hello world" };
			expect(format("{0}", obj)).toBe("Hello world");
		});
	});

	/**
	 * Provides assertions for strings that would result in an incomplete or partial output.
	 */
	describe("partial output", () => {
		test("name placeholder", () => {
			expect(format("{name}", "test")).toBe("{name}");
		});

		test("out-of-range placeholders", () => {
			expect(format("{0} {1} {2}", "a")).toBe("a {1} {2}");
		});

		test("undefined args", () => {
			expect(format("Hello world")).toBe("Hello world");
			expect(format("Hello {0}, this is a test {0}")).toBe("Hello {0}, this is a test {0}");
			expect(format("Hello world {0}", undefined)).toBe("Hello world {0}");
		});

		test("no placeholders, extra args", () => {
			expect(format("plain text", "extra", 123)).toBe("plain text");
		});

		test("placeholder with leading zeros", () => {
			expect(format("{00}", "a")).toBe("a");
			expect(format("{01}", "a", "b")).toBe("b");
		});
	});

	/**
	 * Provides assertions for escaping braces.
	 */
	describe("escaping", () => {
		test("escaped and placeholder", () => {
			expect(format("{{0}} = {0}", "test")).toBe("{0} = test");
		});

		test("empty", () => {
			expect(format("{{}}", "Test")).toBe("{{}}");
		});

		test("braces with numbers", () => {
			expect(format("{{1}}", "foo", "bar")).toBe("{1}");
			expect(format("{{0}} {{1}}", "foo", "bar")).toBe("{0} {1}");
		});

		test("nested braces", () => {
			expect(format("{{{0}}}", "foo")).toBe("{{0}}");
		});
	});
});
