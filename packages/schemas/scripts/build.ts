import type { JSONSchema7 } from "json-schema";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createGenerator } from "ts-json-schema-generator";
import pkg from "../package.json";
import { customKeywordTransformer } from "./transformers/custom-keywords";
import { versionManifests } from "./transformers/version-manifests";

// Prepare the output directory.
const outputDir = join(__dirname, "../streamdeck/plugins");
if (!existsSync(outputDir)) {
	mkdirSync(outputDir, { recursive: true });
}

generateAndWriteSchema("Manifest", [customKeywordTransformer, versionManifests]);
generateAndWriteSchema("Layout", [customKeywordTransformer]);

/**
 * Generates the JSON schema for the specified TypeScript `type`, and writes it locally to `{type}.json`.
 * @param type TypeScript type whose schema should be generated.
 * @param transformers Optional function used to transform the schema.
 */
function generateAndWriteSchema(type: string, transformers?: ((schema: JSONSchema7) => void)[]): void {
	// Build the generator.
	const path = join(__dirname, "../src/streamdeck/plugins/schemas.ts");
	const generator = createGenerator({
		extraTags: ["errorMessage", "imageDimensions", "filePath"],
		path,
		skipTypeCheck: true,
		schemaId: `${pkg.name}/streamdeck/plugins/${type.toLowerCase()}@${pkg.version}`,
		tsconfig: join(__dirname, "../tsconfig.json")
	});

	// Generate the schema, and apply the transformers.
	const schema = generator.createSchema(type);
	transformers?.forEach((t) => t(schema));

	// Determine the output path, and serialize the schema.
	const outputPath = join(outputDir, `${type.toLowerCase()}.json`);
	const contents = JSON.stringify(schema, null, "\t");

	// Finally write the schema.
	writeFileSync(outputPath, contents);
	console.log(`Successfully generated schema for ${type}.`);
}
