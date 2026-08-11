import { describe, expect, it } from "vitest";

import { freeze, get, set } from "../index.js";

/**
 * Provides assertions for {@link freeze}.
 */
describe("freeze", () => {
	it("top-level properties", () => {
		// Arrange.
		const obj = {
			name: "Elgato",
		};

		// Act.
		freeze(obj);

		// Assert.
		expect(() => (obj.name = "Other")).toThrowError();
		expect(obj.name).toEqual("Elgato");
	});

	it("nested properties", () => {
		// Arrange.
		const obj = {
			company: {
				name: "Elgato",
			},
		};

		// Act.
		freeze(obj);

		// Assert.
		expect(() => (obj.company.name = "Other")).toThrowError();
		expect(obj.company.name).toEqual("Elgato");
	});

	it("handles undefined", () => {
		// Arrange, act.
		const value = undefined;
		freeze(value);

		// Assert.
		expect(value).toBeUndefined();
	});

	it("handles null", () => {
		// Arrange, act.
		const value = null;
		freeze(value);

		// Assert.
		expect(value).toBeNull();
	});
});

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

/**
 * Provides assertions for {@link set}.
 */
describe("set", () => {
	it("should set value of simple path", () => {
		// Arrange, act.
		const obj = { foo: "Hello" };
		set(obj, "foo", "Good bye");

		// Assert.
		expect(obj.foo).toBe("Good bye");
	});

	it("should set value of nested path", () => {
		// Arrange, act.
		const obj = { nested: { number: 13 } };
		set(obj, "nested.number", 101);

		// Assert.
		expect(obj.nested.number).toBe(101);
	});

	it("should add value of simple path", () => {
		// Arrange, act.
		const obj: Record<string, unknown> = {};
		set(obj, "foo", "bar");

		// Assert.
		expect(obj.foo).toBe("bar");
	});

	it("should add value of nested path", () => {
		// Arrange, act.
		const obj: Record<string, Record<string, unknown>> = { nested: {} };
		set(obj, "nested.number", 13);

		// Assert.
		expect(obj.nested.number).toBe(13);
	});
});
