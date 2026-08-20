import { describe, expect, it } from "vitest";

import { set } from "../set.js";

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

	it("should not pollute __proto__", () => {
		// Arrange.
		const obj = {};

		// Act, assert.
		expect(() => set(obj, "__proto__.polluted", true)).toThrow(
			'Unsafe path segment "__proto__" in "__proto__.polluted"',
		);
		expect(({} as Record<string, unknown>).polluted).toBeUndefined();
	});

	it("should not pollute constructor.prototype", () => {
		// Arrange.
		const obj = {};

		// Act, assert.
		expect(() => set(obj, "constructor.prototype.polluted", true)).toThrow(
			'Unsafe path segment "constructor" in "constructor.prototype.polluted"',
		);
		expect(({} as Record<string, unknown>).polluted).toBeUndefined();
	});

	it("should not call setter", () => {
		// Arrange
		let setterCalled = false;
		class TestClass {
			/**
			 * Mock setter.
			 */
			public set value(val: unknown) {
				setterCalled = true;
			}
		}

		const obj = {
			nested: new TestClass(),
		};

		// Act.
		set(obj, "nested.value", "Hello world");

		// Assert.
		expect(obj.nested.value).toBe("Hello world");
		expect(setterCalled).toBe(false);
	});
});
