import { StreamDeck } from "../stream-deck";

jest.mock("../stream-deck");

describe("Index", () => {
	/**
	 * Asserts the default export of the library is an instance of {@link StreamDeck}.
	 */
	it("Exports StreamDeck as default", async () => {
		// Arrange, act, assert.
		const index = (await require("../index")) as typeof import("../index");
		expect(index.default).toBeInstanceOf(StreamDeck);
		expect(index.default).toStrictEqual(index.streamDeck);
		expect(StreamDeck).toHaveBeenCalledTimes(1);
		expect(StreamDeck).toHaveBeenCalledWith();
	});
});
