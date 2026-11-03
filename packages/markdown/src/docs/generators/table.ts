import { formatDescription } from "../format.js";
import { createAnchors } from "../markdown/anchors.js";
import {
	anchor,
	createHeading,
	document,
	inlineCode,
	inlineHtml,
	joinDeferredBlocks,
	table,
	type DeferredBlock,
} from "../markdown/syntax.js";
import { typescriptCodeBlock } from "../markdown/typescript.js";
import type { DocsGenerator } from "./generator.js";
import { getOrderedEntries } from "./ordered-entries.js";
import { formatOverview } from "./overview.js";

/**
 * Generates a Markdown reference that documents each type in a chapter, with properties and enum members documented
 * in tables. The root and referenced object types show their definitions before their tables; property and member
 * descriptions are rendered as HTML so paragraphs and lists can be retained within a single table cell.
 */
export const tableGenerator: DocsGenerator = {
	name: "table",
	async generate(model, options = {}): Promise<string> {
		const anchors = createAnchors();
		const heading = createHeading(options.headingOffset);

		// Reserve anchors and validate headings before starting concurrent formatting, so completion order cannot
		// affect IDs and invalid headings fail before formatter work begins.
		const chapters = model.types.map((type) => {
			const isRoot = type === model.root;
			const id = anchors.type(type);
			const blocks: DeferredBlock[] = [
				heading(isRoot ? 1 : 2, inlineCode(type.name), id),
				formatDescription(type.description),
			];

			if (isRoot) {
				blocks.push(heading(2, "Overview", anchors.reserve(`${id}-overview`)), () =>
					typescriptCodeBlock(formatOverview(type, options.overview)),
				);
			} else if (type.kind === "object") {
				blocks.push(() => typescriptCodeBlock(formatOverview(type, options.overview)));
			}

			const entries = getOrderedEntries(type);
			const properties = entries.filter((entry) => "type" in entry);
			const members = entries.filter((entry) => "value" in entry);

			// Discovery populates either properties or enum members, which need different table columns. Rows use HTML
			// anchors because Markdown's custom heading ID syntax cannot be attached to a table row.
			if (properties.length > 0) {
				if (isRoot) {
					blocks.push(heading(2, "Properties", anchors.reserve(`${id}-properties`)));
				}

				blocks.push(
					table(
						["Property", "Type", "Required", "Description"],
						properties.map((property) => {
							const links = anchors.link(property.references);
							return [
								anchor(anchors.reserve(`${id}-${property.name}`)) + inlineCode(property.name),
								inlineCode(property.type) + (links.length > 0 ? `<br>See ${links}` : ""),
								property.optional ? "No" : "Yes",
								inlineHtml(formatDescription(property.description)),
							];
						}),
					),
				);
			} else if (members.length > 0) {
				blocks.push(
					table(
						["Member", "Value", "Description"],
						members.map((member) => [
							anchor(anchors.reserve(`${id}-${member.name}`)) + inlineCode(member.name),
							inlineCode(member.value),
							inlineHtml(formatDescription(member.description)),
						]),
					),
				);
			} else {
				// Root and object definitions have already been rendered above.
				if (!isRoot && type.kind !== "object") {
					blocks.push(() => typescriptCodeBlock(type.definition));
				}
				if (type.references.length > 0) {
					blocks.push(`**References:** ${anchors.link(type.references)}.`);
				}
			}

			return blocks;
		});
		return document(await Promise.all(chapters.map(joinDeferredBlocks)));
	},
};
