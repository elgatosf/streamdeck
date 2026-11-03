import { schemaDeclarations } from "../ast/dts-reader.js";
import { ContentBuilderContext, ContentWriter, toMarkdown } from "../content/index.js";

const name = "stream-deck-plugin-manifest";

/**
 * Generates content for the Stream Deck SDK plugin manifest page.
 */
export async function loadContent(): Promise<void> {
	const writer = new ContentWriter(name);

	// Validate the structure is an object.
	const manifest = schemaDeclarations.getStructure("Manifest");
	if (!manifest.isObject()) {
		throw new Error("Failed to get type: Manifest");
	}

	// TypeScript declaration MDX file.
	const type = await manifest.stringify();
	await writer.writeCodeBlockFile("references/_manifest-declaration.g.mdx", type, {
		title: "Manifest TypeScript declaration",
		lang: "ts",
	});

	// Definitions MDX file.
	const definitions = toMarkdown(manifest, new ContentBuilderContext({ firstHeading: 3 }));
	await writer.writeFile("references/_manifest-definitions.g.mdx", definitions);
}
