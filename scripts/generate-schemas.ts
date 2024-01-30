/* eslint-disable no-useless-escape */
import type { JSONSchema7 } from "json-schema";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createGenerator } from "ts-json-schema-generator";
import { customKeywordTransformer } from "./schema-transformers/custom-keywords";
import { layoutTransformer } from "./schema-transformers/layout";

// Create a generator so we're able to produce multiple schemas.
const generator = createGenerator({
	extraTags: ["errorMessage", "imageDimensions", "filePath"],
	path: join(__dirname, "../src/plugin/index.ts"),
	skipTypeCheck: true,
	tsconfig: join(__dirname, "../tsconfig.json")
});

// Prepare the output directory.
const outputDir = join(__dirname, "../schemas");
if (!existsSync(outputDir)) {
	mkdirSync(outputDir, { recursive: true });
}

generateAndWriteSchema("Manifest");
generateAndWriteSchema("Layout", layoutTransformer);

/**
 * Generates the JSON schema for the specified TypeScript `type`, and writes it locally to `{type}.json`.
 * @param type TypeScript type whose schema should be generated.
 * @param transform Optional function used to transform the schema.
 */
function generateAndWriteSchema(type: string, transform?: (schema: JSONSchema7) => void): void {
	const schema = generator.createSchema(type);
	if (transform) {
		transform(schema);
	}

	// Apply the custom keyword transformer to all schemas
	customKeywordTransformer(schema);

	// Determine the output path, and serialize the schema.
	const outputPath = join(outputDir, `${type.toLowerCase()}.json`);
	const contents = JSON.stringify(schema, null, "\t");

	// Finally write the schema.
	writeFileSync(outputPath, contents);
	console.log(`Successfully generated schema for ${type}.`);
}
