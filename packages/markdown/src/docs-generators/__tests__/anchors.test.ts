import { describe, expect, test } from "vitest";

import { createAnchors } from "../markdown/anchors.js";
import type { TypeDocumentation } from "../model.js";

describe("createAnchors", () => {
	/**
	 * Asserts names are lowercased and separators are converted to hyphens, while Unicode letters are retained.
	 */
	test("normalizes names", () => {
		const anchors = createAnchors();

		expect(anchors.reserve("Manifest.Actions")).toBe("manifest-actions");
		expect(anchors.reserve("Action.Encoder.Layout")).toBe("action-encoder-layout");
		expect(anchors.reserve("Root.State Names / #1")).toBe("root-state-names-1");
		expect(anchors.reserve("Type.\u00c9lan")).toBe("type-\u00e9lan");
	});

	/**
	 * Asserts names that normalize to the same ID receive unique suffixes.
	 */
	test("resolves normalized collisions", () => {
		const anchors = createAnchors();

		expect(anchors.reserve("Root.Value")).toBe("root-value");
		expect(anchors.reserve("root-value")).toBe("root-value-2");
		expect(anchors.reserve("ROOT Value")).toBe("root-value-3");
		expect(anchors.reserve("...")).toBe("section");
		expect(anchors.reserve("$")).toBe("section-2");
	});

	/**
	 * Asserts type links reuse their reserved ID even when other names collide with it.
	 */
	test("reuses type ids in links", () => {
		const anchors = createAnchors();
		const type: TypeDocumentation = {
			name: "SomeType",
			kind: "other",
			description: { text: "", tags: [] },
			definition: "type SomeType = string;",
			expandedDefinition: "type SomeType = string;",
			properties: [],
			members: [],
			references: [],
		};

		expect(anchors.reserve("sometype")).toBe("sometype");
		expect(anchors.type(type)).toBe("sometype-2");
		expect(anchors.type(type)).toBe("sometype-2");
		expect(anchors.link([type])).toBe("[SomeType](#sometype-2)");
	});
});
