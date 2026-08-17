import { describe, expect, it } from "vitest";

import { get } from "../get.js";

/**
 * Provides assertions for {@link get}.
 */
describe("get", () => {
	it("should retrieve value of simple path", () => {
		// Arrange, act, assert.
		const obj = { foo: "bar" };
		expect(get(obj, "foo")).toBe("bar");
	});

	it("should retrieve value of nested path", () => {
		// Arrange, act, assert.
		const obj = { nested: { number: 13 } };
		expect(get(obj, "nested.number")).toBe(13);
	});

	it("should retrieve value of path that returns falsy", () => {
		// Arrange, act, assert.
		const obj = { falsy: false };
		expect(get(obj, "falsy")).toBe(false);
	});

	it("should retrieve undefined when the property does not exist", () => {
		// Arrange, act, assert.
		const obj = {};
		expect(get(obj, "__unknown.__prop")).toBe(undefined);
	});
});
