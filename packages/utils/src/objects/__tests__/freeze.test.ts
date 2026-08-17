import { describe, expect, it } from "vitest";

import { freeze } from "../freeze.js";

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
