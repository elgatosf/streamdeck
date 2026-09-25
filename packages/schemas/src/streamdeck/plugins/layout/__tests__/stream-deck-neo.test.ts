import { validateStreamDeckPluginLayout } from "@tests";
import { describe, expect, test } from "vitest";

describe("Stream Deck Neo layouts", () => {
	/**
	 * Asserts a layout for Stream Deck Neo.
	 */
	test("full layout", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginLayout("stream-deck-neo.json");
		expect(errors).toHaveLength(0);
	});

	/**
	 * Asserts the maximum height of Stream Deck Neo layouts.
	 */
	test("height in bounds", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginLayout("stream-deck-neo.json", (layout) => {
			layout.items[0].rect = [0, 0, 200, 100];
		});

		// Assert.
		expect(errors).toHaveError({
			instancePath: "/items/0/rect/3",
			keyword: "maximum",
			params: {
				comparison: "<=",
				limit: 50,
			},
		});
	});

	/**
	 * Asserts an unspecified controller is not Stream Deck Neo.
	 */
	test("unspecified controller is not Stream Deck Neo", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginLayout("stream-deck-neo.json", (layout) => {
			delete layout.controller;
			layout.items[0].rect = [0, 0, 232, 50];
		});

		// Assert (height)
		expect(errors).toHaveError({
			instancePath: "/items/0/rect/2",
			keyword: "maximum",
			params: {
				comparison: "<=",
				limit: 200,
			},
		});
	});
});
