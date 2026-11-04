import type { TypeDocumentation } from "../model.js";

/**
 * Unique anchor ids within a single Markdown document, based on `{typeRef}` or `{typeRef}-{propName}`.
 */
export interface Anchors {
	/**
	 * Reserves a lowercase, hyphen-separated anchor id, suffixing it (e.g. `-2`) when the id is already in use.
	 * Names with no remaining letters, marks, or numbers use `section` so they still produce a linkable id.
	 * @param base Preferred id.
	 * @returns Unique id.
	 */
	reserve(base: string): string;

	/**
	 * Gets the anchor id of a type, reserving it on first use so that links and headings agree.
	 * @param type Type.
	 * @returns Unique id of the type.
	 */
	type(type: TypeDocumentation): string;

	/**
	 * Renders a link to the types.
	 * @param types Types to link to.
	 * @returns Comma-separated Markdown links; empty when there are no types.
	 */
	link(types: readonly TypeDocumentation[]): string;
}

/**
 * Creates a registry of unique anchor ids for a single Markdown document. Headings and table rows share the same
 * namespace; type identities are cached so a link can reserve an id before its heading and similarly named types
 * still receive distinct ids.
 * @returns Anchor registry.
 */
export function createAnchors(): Anchors {
	const ids = new Set<string>();
	const typeIds = new Map<TypeDocumentation, string>();

	const anchors: Anchors = {
		reserve(base: string): string {
			// Normalize consistently across renderers while retaining Unicode letters, marks, and numbers.
			const normalized = base
				.toLowerCase()
				.replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
				.replace(/^-+|-+$/g, "");
			const preferred = normalized || "section";
			let id = preferred;
			for (let i = 2; ids.has(id); i++) {
				id = `${preferred}-${i}`;
			}

			ids.add(id);
			return id;
		},
		type(type: TypeDocumentation): string {
			let id = typeIds.get(type);
			if (id === undefined) {
				id = anchors.reserve(type.name);
				typeIds.set(type, id);
			}

			return id;
		},
		link(types: readonly TypeDocumentation[]): string {
			return types.map((type) => `[${type.name}](#${anchors.type(type)})`).join(", ");
		},
	};

	return anchors;
}
