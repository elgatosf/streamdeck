import { formatDescription } from "../format.js";
import { createAnchors } from "../markdown/anchors.js";
import { anchor, codeBlock, document, heading, inlineCode, inlineHtml, joinBlocks, table } from "../markdown/syntax.js";
import type { DocsGenerator } from "./generator.js";

/**
 * Generates a Markdown reference that documents each type in a chapter, with properties and enum members documented
 * in tables; descriptions are rendered as HTML so they can be placed within table cells.
 */
export const tableGenerator: DocsGenerator = {
	name: "table",
	generate(model): string {
		const anchors = createAnchors();

		return document(
			model.types.map((type) => {
				const isRoot = type === model.root;
				const id = anchors.type(type);
				const blocks = [heading(isRoot ? 1 : 2, inlineCode(type.name), id), formatDescription(type.description)];

				if (isRoot) {
					blocks.push(heading(2, "Overview", anchors.reserve(`${id}.overview`)), codeBlock(type.definition));
				}

				if (type.properties.length > 0) {
					if (isRoot) {
						blocks.push(heading(2, "Properties", anchors.reserve(`${id}.properties`)));
					}

					blocks.push(
						table(
							["Property", "Type", "Required", "Description"],
							type.properties.map((property) => {
								const links = anchors.link(property.references);
								return [
									anchor(anchors.reserve(`${id}.${property.name}`)) + inlineCode(property.name),
									inlineCode(property.type) + (links.length > 0 ? `<br>See ${links}` : ""),
									property.optional ? "No" : "Yes",
									inlineHtml(formatDescription(property.description)),
								];
							}),
						),
					);
				} else if (type.members.length > 0) {
					blocks.push(
						table(
							["Member", "Value", "Description"],
							type.members.map((member) => [
								anchor(anchors.reserve(`${id}.${member.name}`)) + inlineCode(member.name),
								inlineCode(member.value),
								inlineHtml(formatDescription(member.description)),
							]),
						),
					);
				} else {
					if (!isRoot) {
						blocks.push(codeBlock(type.definition));
					}
					if (type.references.length > 0) {
						blocks.push(`**References:** ${anchors.link(type.references)}.`);
					}
				}

				return joinBlocks(blocks);
			}),
		);
	},
};
