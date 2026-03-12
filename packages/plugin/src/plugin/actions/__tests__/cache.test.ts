import { describe, expect, it } from "vitest";

import { settingsCache } from "../cache.js";

describe("settingsCache", () => {
	/**
	 * Asserts {@link settingsCache.get} returns `undefined` when no entry exists.
	 */
	it("get returns undefined for unknown id", () => {
		expect(settingsCache.get("unknown")).toBeUndefined();
	});

	/**
	 * Asserts {@link settingsCache.get} returns the cached settings after {@link settingsCache.set}.
	 */
	it("get returns settings after set", () => {
		// Arrange.
		const settings = { name: "Elgato" };
		settingsCache.set("action1", settings);

		// Act, assert.
		expect(settingsCache.get("action1")).toEqual(settings);
	});

	/**
	 * Asserts {@link settingsCache.get} returns `undefined` after cache is invalidated.
	 */
	it("get returns undefined after invalidate", () => {
		// Arrange.
		settingsCache.set("action2", { name: "Test" });

		// Act.
		settingsCache.invalidate("action2");

		// Assert.
		expect(settingsCache.get("action2")).toBeUndefined();
	});

	/**
	 * Asserts {@link settingsCache.invalidate} is a no-op for unknown ids.
	 */
	it("invalidate is no-op for unknown id", () => {
		// Act, assert.
		expect(() => settingsCache.invalidate("nonexistent")).not.toThrow();
	});

	/**
	 * Asserts {@link settingsCache.set} re-validates a previously invalidated entry.
	 */
	it("set re-validates invalidated entry", () => {
		// Arrange.
		settingsCache.set("action3", { name: "First" });
		settingsCache.invalidate("action3");

		// Act.
		settingsCache.set("action3", { name: "Second" });

		// Assert.
		expect(settingsCache.get("action3")).toEqual({ name: "Second" });
	});

	/**
	 * Asserts {@link settingsCache.delete} removes the entry.
	 */
	it("delete removes entry", () => {
		// Arrange.
		settingsCache.set("action4", { name: "Delete me" });

		// Act.
		settingsCache.delete("action4");

		// Assert.
		expect(settingsCache.get("action4")).toBeUndefined();
	});

	/**
	 * Asserts {@link settingsCache.delete} is a no-op for unknown ids.
	 */
	it("delete is no-op for unknown id", () => {
		// Act, assert.
		expect(() => settingsCache.delete("nonexistent")).not.toThrow();
	});
});
