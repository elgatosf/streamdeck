import { describe, expect, it } from "vitest";

import { Option, option } from "../option.js";

/**
 * Provides assertions for creating an option.
 */
describe("option", () => {
	it("assigns type", () => {
		// Arrange, act.
		const opt = option({
			disabled: true,
			label: "Elgato",
			value: "elg",
		});

		// Assert.
		expect(opt.type).toBe("option");
		expect(opt.disabled).toBe(true);
		expect(opt.label).toBe("Elgato");
		expect(opt.value).toBe("elg");
	});

	it("does not assign default", () => {
		// Arrange, act.
		const opt = option({
			label: "Elgato",
			value: "elg",
		});

		// Assert.
		expect(opt.type).toBe("option");
		expect(opt.disabled).toBeUndefined();
		expect(opt.label).toBe("Elgato");
		expect(opt.value).toBe("elg");
	});
});

/**
 * Provides assertions for parsing data to an `Option`.
 */
describe("Option", () => {
	it("can parse", () => {
		// Arrange.
		const data: Option = {
			type: "option",
			label: "Elgato",
			disabled: false,
			value: "elg",
		};

		// Act.
		const opt = Option.parse(data);

		// Assert
		expect(opt.type).toBe("option");
		expect(opt.disabled).toBe(false);
		expect(opt.label).toBe("Elgato");
		expect(opt.value).toBe("elg");
	});

	it("does not require disabled", () => {
		// Arrange.
		const data: Option = {
			type: "option",
			label: "Elgato",
			value: "elg",
		};

		// Act.
		const opt = Option.parse(data);

		// Assert
		expect(opt.type).toBe("option");
		expect(opt.disabled).toBeUndefined();
		expect(opt.label).toBe("Elgato");
		expect(opt.value).toBe("elg");
	});

	it("requires label", () => {
		// Arrange.
		const data = {
			type: "option",
			value: "elg",
		};

		// Act, assert.
		const result = Option.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("requires value", () => {
		// Arrange.
		const data = {
			type: "option",
			label: "Elgato",
		};

		// Act, assert.
		const result = Option.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("requires type", () => {
		// Arrange.
		const data = {
			label: "Elgato",
			value: "elg",
		};

		// Act, assert.
		const result = Option.safeParse(data);
		expect(result.success).toBe(false);
	});
});
