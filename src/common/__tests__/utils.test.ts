import { get } from "../utils";

/**
 * Asserts {@link get} correct reads values from objects based on the specified path.
 */
describe("get", () => {
	it("Gets the value for a top-level path", () => {
		const obj = { foo: "bar" };
		expect(get("foo", obj)).toBe("bar");
	});

	it("Gets the value for a nested path", () => {
		const obj = { nested: { number: 13 } };
		expect(get("nested.number", obj)).toBe(13);
	});

	it("Handles falsy values", () => {
		const obj = { falsy: false };
		expect(get("falsy", obj)).toBe(false);
	});

	it("Defaults to undefined", () => {
		const obj = {};
		expect(get("__unknown.__prop", obj)).toBe(undefined);
	});
});
