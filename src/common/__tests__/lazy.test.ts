import { describe, expect, it, vi } from "vitest";

import { Lazy } from "../lazy.js";

describe("Lazy", () => {
	it("loads value from factory", () => {
		// Arrange.
		const valueFactory = vi.fn().mockReturnValue(1);
		const lazy = new Lazy(valueFactory);

		// Act.
		const value = lazy.value;

		// Assert
		expect(value).toBe(1);
		expect(valueFactory).toHaveBeenCalledTimes(1);
		expect(valueFactory).toHaveBeenCalledWith();
	});

	it("loads value once only", () => {
		// Arrange.
		const valueFactory = vi.fn().mockReturnValue(1);
		const lazy = new Lazy(valueFactory);

		// Act, assert.
		expect(lazy.value).toBe(1);
		expect(lazy.value).toBe(1);
		expect(lazy.value).toBe(1);
		expect(valueFactory).toHaveBeenCalledTimes(1);
	});

	it("re-loads value until not undefined", () => {
		// Arrange.
		const valueFactory = vi.fn().mockReturnValueOnce(undefined).mockReturnValueOnce(1);
		const lazy = new Lazy(valueFactory);

		// Act, assert.
		expect(lazy.value).toBeUndefined();
		expect(lazy.value).toBe(1);
		expect(valueFactory).toHaveBeenCalledTimes(2);
		expect(valueFactory).toHaveBeenCalledWith();
	});
});
