import { freeze, get } from "../utils";

/**
 * Provides assertions for {@link freeze}.
 */
describe("freeze", () => {
	it("top-level properties", () => {
		// Arrange.
		const obj = {
			name: "Elgato"
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
				name: "Elgato"
			}
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
	it("gets the value for a top-level path", () => {
		const obj = { foo: "bar" };
		expect(get("foo", obj)).toBe("bar");
	});

	it("gets the value for a nested path", () => {
		const obj = { nested: { number: 13 } };
		expect(get("nested.number", obj)).toBe(13);
	});

	it("handles falsy values", () => {
		const obj = { falsy: false };
		expect(get("falsy", obj)).toBe(false);
	});

	it("defaults to undefined", () => {
		const obj = {};
		expect(get("__unknown.__prop", obj)).toBe(undefined);
	});
});
