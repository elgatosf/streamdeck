import { toSerializable } from "../json";

describe("toSerializable", () => {
	/**
	 * Asserts converting objects.
	 */
	it("object", () => {
		// Arrange.
		const obj = {
			name: "Elgato",
		};

		// Act.
		const result = toSerializable(obj);

		// Assert.
		expect(result).not.toBe(obj);
		expect(result).toStrictEqual(obj);
	});

	/**
	 * Asserts converting objects with getters.
	 */
	it("object (with getters)", () => {
		// Arrange.
		const obj = new MockClass();

		// Act.
		const result = toSerializable(obj);

		// Assert.
		expect(result).not.toBe(obj);
		expect(result).toStrictEqual({
			getter: "Elgato",
			member: "Elgato",
		});
	});

	/**
	 * Asserts converting booleans.
	 */
	it("boolean", () => {
		expect(toSerializable(true)).toBe(true);
		expect(toSerializable(false)).toBe(false);
	});

	/**
	 * Asserts converting numbers.
	 */
	it("number", () => {
		expect(toSerializable(1)).toBe(1);
	});

	/**
	 * Asserts converting strings.
	 */
	it("string", () => {
		expect(toSerializable("Hello world")).toBe("Hello world");
	});

	/**
	 * Asserts converting functions.
	 */
	it("function", () => {
		// Arrange.
		const noop = () => ({
			/* no-op */
		});

		// Act, assert.
		expect(toSerializable(noop)).toBe(noop);
	});
});

class MockClass {
	#name: string;

	constructor() {
		this.#name = "Elgato";
		this.member = this.#name;
	}

	get getter(): string {
		return this.#name;
	}

	set setter(value: string) {
		// Should not be serialized.
	}

	public readonly member: string;

	public fn(): void {
		// Should not be serialized.
	}
}
