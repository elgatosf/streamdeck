import { validateStreamDeckPluginLayout } from "@tests";

describe("Stream Deck + layouts", () => {
	/**
	 * Asserts a layout for Stream Deck Neo.
	 */
	test("full layout", () => {
		// Arrange, act, assert.
		const errors = validateStreamDeckPluginLayout("stream-deck-plus.json");
		expect(errors).toHaveLength(0);
	});

	/**
	 * Asserts the maximum width of Stream Deck + layouts.
	 */
	test("width in bounds", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginLayout("stream-deck-plus.json", (layout) => {
			layout.items[0].rect = [0, 0, 232, 100];
		});

		// Assert.
		expect(errors).toHaveError({
			instancePath: "/items/0/rect/2",
			keyword: "maximum",
			params: {
				comparison: "<=",
				limit: 200
			}
		});
	});

	/**
	 * Asserts an unspecified controller is Stream Deck +.
	 */
	test("unspecified controller is Stream Deck +", () => {
		// Arrange, act.
		const errors = validateStreamDeckPluginLayout("stream-deck-plus.json", (layout) => {
			delete layout.controller;
		});

		// Assert.
		expect(errors).toHaveLength(0);
	});
});
