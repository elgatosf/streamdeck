import type { TypeDocumentation } from "../model.js";

/**
 * Unique anchor ids within a single Markdown document, based on `{typeRef}` or `{typeRef.propName}`.
 */
export interface Anchors {
	/**
	 * Reserves an anchor id, suffixing it (e.g. `-2`) when the id is already in use.
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
 * Creates a registry of unique anchor ids for a single Markdown document.
 * @returns Anchor registry.
 */
export function createAnchors(): Anchors {
	const ids = new Set<string>();
	const typeIds = new Map<TypeDocumentation, string>();

	const anchors: Anchors = {
		reserve(base: string): string {
			let id = base;
			for (let i = 2; ids.has(id); i++) {
				id = `${base}-${i}`;
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
