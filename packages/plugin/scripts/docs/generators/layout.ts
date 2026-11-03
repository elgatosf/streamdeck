import { schemaDeclarations } from "../ast/dts-reader.js";
import { ContentBuilderContext, ContentWriter, toMarkdown } from "../content/index.js";

const name = "stream-deck-plugin-layout";

/**
 * Generates content for the Stream Deck SDK plugin layout page.
 */
export async function loadContent(): Promise<void> {
	const writer = new ContentWriter(name);

	// Validate the structure is an object, or a union of objects (one per device type).
	const layout = schemaDeclarations.getStructure("Layout");
	if (!layout.isObject() && !layout.isUnion()) {
		throw new Error("Failed to get type: Layout");
	}

	// TypeScript declaration MDX file.
	const type = await layout.stringify();
	await writer.writeCodeBlockFile("references/_layout-declaration.g.mdx", type, {
		title: "Layout TypeScript declaration",
		lang: "ts",
	});

	// Definitions MDX file.
	const definitions = toMarkdown(layout, new ContentBuilderContext({ firstHeading: 3 }));
	await writer.writeFile("references/_layout-definitions.g.mdx", definitions);
}
