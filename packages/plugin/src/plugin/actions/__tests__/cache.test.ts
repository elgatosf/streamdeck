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
	 * Asserts cached settings are isolated from mutations to the object passed to {@link settingsCache.set}.
	 */
	it("set clones settings before caching", () => {
		// Arrange.
		const settings = { nested: { name: "Original" } };
		settingsCache.set("action-set-clone", settings);

		// Act.
		settings.nested.name = "Mutated";

		// Assert.
		expect(settingsCache.get("action-set-clone")).toEqual({ nested: { name: "Original" } });
	});

	/**
	 * Asserts cached settings are isolated from mutations to objects returned by {@link settingsCache.get}.
	 */
	it("get returns a cloned copy of cached settings", () => {
		// Arrange.
		settingsCache.set("action-get-clone", { nested: { name: "Original" } });

		// Act.
		const cached = settingsCache.get("action-get-clone") as { nested: { name: string } } | undefined;
		if (cached === undefined) {
			throw new Error("Expected cached settings to exist");
		}

		cached.nested.name = "Mutated";

		// Assert.
		expect(settingsCache.get("action-get-clone")).toEqual({ nested: { name: "Original" } });
	});

	/**
	 * Asserts {@link settingsCache.delete} removes the entry and get returns `undefined`.
	 */
	it("get returns undefined after delete", () => {
		// Arrange.
		settingsCache.set("action2", { name: "Test" });

		// Act.
		settingsCache.delete("action2");

		// Assert.
		expect(settingsCache.get("action2")).toBeUndefined();
	});

	/**
	 * Asserts {@link settingsCache.set} overwrites an existing entry.
	 */
	it("set overwrites existing entry", () => {
		// Arrange.
		settingsCache.set("action3", { name: "First" });

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
