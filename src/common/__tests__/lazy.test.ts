import { Lazy } from "../lazy";

describe("Lazy", () => {
	it("loads value from factory", () => {
		// Arrange.
		const valueFactory = jest.fn().mockReturnValue(1);
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
		const valueFactory = jest.fn().mockReturnValue(1);
		const lazy = new Lazy(valueFactory);

		// Act, assert.
		expect(lazy.value).toBe(1);
		expect(lazy.value).toBe(1);
		expect(lazy.value).toBe(1);
		expect(valueFactory).toHaveBeenCalledTimes(1);
	});

	it("re-loads value until not undefined", () => {
		// Arrange.
		const valueFactory = jest.fn().mockReturnValueOnce(undefined).mockReturnValueOnce(1);
		const lazy = new Lazy(valueFactory);

		// Act, assert.
		expect(lazy.value).toBeUndefined();
		expect(lazy.value).toBe(1);
		expect(valueFactory).toHaveBeenCalledTimes(2);
		expect(valueFactory).toHaveBeenCalledWith();
	});
});
