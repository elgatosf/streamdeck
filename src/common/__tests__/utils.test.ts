import { PromiseCompletionSource } from "../promises";
import { debounce, freeze, get, parseBoolean, parseNumber, set } from "../utils";

/**
 * Provides assertions for {@link debounce}.
 */
describe("debounce", () => {
	it("should only invoke the function once before completing", async () => {
		// Arrange.
		let callCount = 0;
		const fn = debounce(() => {
			callCount++;
		}, 1);

		// when, then.
		await Promise.all([fn(), fn(), fn()]);
		expect(callCount).toBe(1);
	});

	it("should wait for the delay before invoking the callback", async () => {
		// Arrange.
		const awaiter = new PromiseCompletionSource<void>();
		const fn = debounce(() => awaiter.setResult(), 100);

		// Act.
		const start = Math.floor(performance.now());

		await fn();
		await awaiter.promise;

		const elapsed = Math.ceil(performance.now()) - start;

		// Assert.
		expect(elapsed).toBeGreaterThanOrEqual(100);
	});

	it("should reset the promise after each callback", async () => {
		// Arrange.
		let callCount = 0;
		const fn = debounce(() => {
			callCount++;
		}, 1);

		// when, then.
		await fn();
		expect(callCount).toBe(1);

		// when, then.
		await fn();
		expect(callCount).toBe(2);
	});

	it("should invoke callback before setting promise completion source", async () => {
		// Arrange.
		let callbackTime!: number;

		// Act.
		const fn = debounce(() => {
			callbackTime = performance.now();
		}, 100);
		await fn();

		// Assert.
		expect(performance.now()).toBeGreaterThan(callbackTime);
	});
});

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
		expect(get("foo", obj)).toBe("bar");
	});

	it("should retrieve value of nested path", () => {
		// Arrange, act, assert.
		const obj = { nested: { number: 13 } };
		expect(get("nested.number", obj)).toBe(13);
	});

	it("should retrieve value of path that returns falsy", () => {
		// Arrange, act, assert.
		const obj = { falsy: false };
		expect(get("falsy", obj)).toBe(false);
	});

	it("should retrieve undefined when the property does not exist", () => {
		// Arrange, act, assert.
		const obj = {};
		expect(get("__unknown.__prop", obj)).toBe(undefined);
	});
});

/**
 * Provides assertions for {@link parseBoolean}.
 */
describe("parseBoolean", () => {
	/**
	 * Asserts {@link parseBoolean} parses truthy values that represent `true`.
	 */
	test.each([
		{},
		true,
		1,
		"true",
		"any",
	])("%s is true", (value) => {
		expect(parseBoolean(value)).toBe(true);
	});

	/**
	 * Asserts {@link parseBoolean} parses truthy values that represent `false`.
	 */
	test.each([
		undefined,
		null,
		false,
		0,
	])("%s is false", (value) => {
		expect(parseBoolean(value)).toBe(false);
	});
});

/**
 * Provides assertions for {@link parseNumber}.
 */
describe("parseNumber", () => {
	/**
	 * Asserts {@link parseNumber} with values that can be parsed.
	 */
	test.each([
		{
			value: -1,
			expected: -1,
		},
		{
			value: 0,
			expected: 0,
		},
		{
			value: 1,
			expected: 1,
		},
		{
			value: "13",
			expected: 13,
		},
		{
			value: "25.0",
			expected: 25,
		},
		{
			value: "99.9",
			expected: 99.9,
		},
		{
			value: "100a",
			expected: 100,
		},
	])("parses $value = $expected", ({ value, expected }) => {
		expect(parseNumber(value)).toBe(expected);
	});

	/**
	 * Asserts {@link parseNumber} with values that cannot be parsed.
	 */
	test.each([
		undefined,
		null,
		"false",
		"a123b",
		{},
	])("$value = undefined", (value) => {
		expect(parseNumber(value)).toBeUndefined();
	});
});

/**
 * Provides assertions for {@link set}.
 */
describe("set", () => {
	it("should set value of simple path", () => {
		// Arrange, act.
		const obj = { foo: "Hello" };
		set("foo", obj, "Good bye");

		// Assert.
		expect(obj.foo).toBe("Good bye");
	});

	it("should set value of nested path", () => {
		// Arrange, act.
		const obj = { nested: { number: 13 } };
		set("nested.number", obj, 101);

		// Assert.
		expect(obj.nested.number).toBe(101);
	});

	it("should add value of simple path", () => {
		// Arrange, act.
		const obj: Record<string, unknown> = {};
		set("foo", obj, "bar");

		// Assert.
		expect(obj.foo).toBe("bar");
	});

	it("should add value of nested path", () => {
		// Arrange, act.
		const obj: Record<string, Record<string, unknown>> = { nested: {} };
		set("nested.number", obj, 13);

		// Assert.
		expect(obj.nested.number).toBe(13);
	});
});
