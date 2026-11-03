import { formatDescription, formatPropertySignature } from "../format.js";
import { createAnchors } from "../markdown/anchors.js";
import { codeBlock, document, heading, inlineCode, joinBlocks } from "../markdown/syntax.js";
import type { TypeDocumentation } from "../model.js";
import type { DocsGenerator } from "./generator.js";

/**
 * Generates a Markdown reference that documents each type in a chapter, with a heading for each property and enum
 * member; the root type's chapter includes an overview of the type.
 */
export const referenceGenerator: DocsGenerator = {
	name: "flat",
	generate(model): string {
		const anchors = createAnchors();

		/**
		 * Renders links to referenced types.
		 * @param references Referenced types.
		 * @returns Markdown; empty when there are no references.
		 */
		const references = (references: readonly TypeDocumentation[]): string =>
			references.length === 0 ? "" : `**References:** ${anchors.link(references)}.`;

		return document(
			model.types.map((type) => {
				const isRoot = type === model.root;
				const id = anchors.type(type);
				const blocks = [
					heading(isRoot ? 1 : 2, inlineCode(type.name), id),
					formatDescription(type.description),
					isRoot ? heading(2, "Overview", anchors.reserve(`${id}.overview`)) : "",
					codeBlock(type.definition),
				];

				for (const property of type.properties) {
					blocks.push(
						heading(3, inlineCode(property.name), anchors.reserve(`${id}.${property.name}`)),
						codeBlock(formatPropertySignature(property)),
						property.optional ? "**Optional.**" : "**Required.**",
						formatDescription(property.description),
						references(property.references),
					);
				}

				for (const member of type.members) {
					blocks.push(
						heading(3, inlineCode(member.name), anchors.reserve(`${id}.${member.name}`)),
						codeBlock(`${member.name} = ${member.value}`),
						formatDescription(member.description),
					);
				}

				if (type.properties.length === 0) {
					blocks.push(references(type.references));
				}

				return joinBlocks(blocks);
			}),
		);
	},
};
