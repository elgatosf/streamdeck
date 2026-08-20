import { describe, expect, it } from "vitest";

import type { DataList } from "../data-list.js";
import { OptionGroup, optionGroup } from "../option-group.js";
import { option } from "../option.js";

/**
 * Provides assertions for creating an option group.
 */
describe("optionGroup", () => {
	it("assigns type", () => {
		// Arrange, act.
		const opt = optionGroup({
			disabled: true,
			label: "Elgato",
			options: [
				option({ label: "Stream Deck", value: "sd" }),
				optionGroup({
					label: "Stream Deck +",
					options: [
						option({ value: "sd+xlr", label: "Stream Deck + XLR" }),
						option({ value: "sd+usb", label: "Stream Deck + USB" }),
					],
				}),
			],
		});

		// Assert.
		expect(opt.type).toBe("option-group");
		expect(opt.disabled).toBe(true);
		expect(opt.label).toBe("Elgato");
		expect(opt.options).toEqual([
			{
				type: "option",
				label: "Stream Deck",
				value: "sd",
			},
			{
				type: "option-group",
				label: "Stream Deck +",
				options: [
					{
						type: "option",
						label: "Stream Deck + XLR",
						value: "sd+xlr",
					},
					{
						type: "option",
						label: "Stream Deck + USB",
						value: "sd+usb",
					},
				],
			},
		]);
	});

	it("does not assign default", () => {
		// Arrange, act.
		const opt = optionGroup({
			label: "Elgato",
			options: [],
		});

		// Assert.
		expect(opt.type).toBe("option-group");
		expect(opt.disabled).toBeUndefined();
		expect(opt.label).toBe("Elgato");
		expect(opt.options).toEqual([]);
	});
});

/**
 * Provides assertions for parsing data to an `OptionGroup`.
 */
describe("OptionGroup", () => {
	it("can parse", () => {
		// Arrange.
		const options: DataList = [
			{
				type: "option" as const,
				label: "Stream Deck",
				value: "sd",
			},
			{
				type: "option-group" as const,
				label: "Stream Deck +",
				options: [
					{
						type: "option" as const,
						label: "Stream Deck + XLR",
						value: "sd+xlr",
					},
					{
						type: "option" as const,
						label: "Stream Deck + USB",
						value: "sd+usb",
					},
				],
			},
		];

		const data: OptionGroup = {
			type: "option-group",
			label: "Elgato",
			disabled: false,
			options,
		};

		// Act.
		const optGroup = OptionGroup.parse(data);

		// Assert
		expect(optGroup.disabled).toBe(false);
		expect(optGroup.type).toBe("option-group");
		expect(optGroup.label).toBe("Elgato");
		expect(optGroup.options).toEqual(options);
	});

	it("does not require disabled", () => {
		// Arrange.
		const data: OptionGroup = {
			type: "option-group",
			label: "Elgato",
			options: [],
		};

		// Act.
		const optGroup = OptionGroup.parse(data);

		// Assert
		expect(optGroup.disabled).toBeUndefined();
		expect(optGroup.type).toBe("option-group");
		expect(optGroup.label).toBe("Elgato");
		expect(optGroup.options).toEqual([]);
	});

	it("requires label", () => {
		// Arrange.
		const data = {
			type: "option-group",
			options: [],
		};

		// Act, assert.
		const result = OptionGroup.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("requires options", () => {
		// Arrange.
		const data = {
			type: "option-group",
			label: "Elgato",
		};

		// Act, assert.
		const result = OptionGroup.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("requires valid options", () => {
		// Arrange.
		const data = {
			type: "option-group",
			label: "Elgato",
			options: ["test"],
		};

		// Act, assert.
		const result = OptionGroup.safeParse(data);
		expect(result.success).toBe(false);
	});

	it("requires type", () => {
		// Arrange.
		const data = {
			label: "Elgato",
			options: [],
		};

		// Act, assert.
		const result = OptionGroup.safeParse(data);
		expect(result.success).toBe(false);
	});
});
