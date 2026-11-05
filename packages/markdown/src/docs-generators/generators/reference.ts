import { formatDescription, formatPropertySignature } from "../format.js";
import { createAnchors } from "../markdown/anchors.js";
import { createHeading, document, inlineCode, joinDeferredBlocks, type DeferredBlock } from "../markdown/syntax.js";
import { tsCodeBlock } from "../markdown/ts-code-block.js";
import type { TypeDocumentation } from "../model.js";
import type { DocsGenerator } from "./generator.js";
import { flattenProperty, getOrderedEntries } from "./ordered-entries.js";
import { formatOverview } from "./overview.js";

/**
 * Generates a Markdown reference that documents each type in a chapter, with a heading for each property and enum
 * member. The root has a level 1 heading and a labelled overview; referenced types use level 2 headings followed by
 * their definitions, and individual properties and members use level 3 headings. Descriptions remain Markdown.
 */
export const referenceGenerator: DocsGenerator = {
	name: "flat",
	async generate(model, options = {}): Promise<string> {
		const anchors = createAnchors();
		const heading = createHeading(options.headingOffset);

		/**
		 * Renders links to referenced types.
		 * @param references Referenced types.
		 * @returns Markdown; empty when there are no references.
		 */
		const references = (references: readonly TypeDocumentation[]): string =>
			references.length === 0 ? "" : `**References:** ${anchors.link(references)}.`;

		// Reserve anchors and validate headings before starting concurrent formatting, so completion order cannot
		// affect IDs and invalid headings fail before formatter work begins.
		const chapters = model.types.map((type) => {
			const isRoot = type === model.root;
			const id = anchors.type(type);
			const blocks: DeferredBlock[] = [
				heading(isRoot ? 1 : 2, inlineCode(type.name), id),
				formatDescription(type.description),
				isRoot ? heading(2, "Overview", anchors.reserve(`${id}-overview`)) : "",
				(): Promise<string> => tsCodeBlock(formatOverview(type, options.overview)),
			];

			for (const entry of getOrderedEntries(type)) {
				if ("type" in entry) {
					// Nested properties link to their parent, as their signature does not show the object they belong to.
					const ids = new Map<string, string>();
					for (const property of flattenProperty(entry)) {
						const propertyId = anchors.reserve(`${id}-${property.path}`);
						ids.set(property.path, propertyId);

						blocks.push(
							heading(3, inlineCode(property.path), propertyId),
							() => tsCodeBlock(formatPropertySignature(property), "property"),
							property.optional ? "**Optional.**" : "**Required.**",
							property.parent === undefined
								? ""
								: `**Property of:** [${inlineCode(property.parent)}](#${ids.get(property.parent)}).`,
							formatDescription(property.description),
							references(property.references),
						);
					}
				} else {
					blocks.push(
						heading(3, inlineCode(entry.name), anchors.reserve(`${id}-${entry.name}`)),
						() => tsCodeBlock(`${entry.name} = ${entry.value}`, "member"),
						formatDescription(entry.description),
					);
				}
			}

			// Avoid repeating property references at the type level; types without properties have no per-property list.
			if (type.properties.length === 0) {
				blocks.push(references(type.references));
			}

			return blocks;
		});
		return document(await Promise.all(chapters.map(joinDeferredBlocks)));
	},
};
