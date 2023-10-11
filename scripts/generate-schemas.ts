import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Schema, createGenerator } from "ts-json-schema-generator";

// Create a generator so we're able to produce multiple schemas.
const generator = createGenerator({
	path: join(__dirname, "../src/index.ts"),
	skipTypeCheck: true,
	tsconfig: join(__dirname, "../tsconfig.json")
});

// Prepare the output directory.
const outputDir = join(__dirname, "../schemas");
if (!existsSync(outputDir)) {
	mkdirSync(outputDir, { recursive: true });
}

generateAndWriteSchema("Manifest");
generateAndWriteSchema("Layout");

/**
 * Generates the JSON schema for the specified TypeScript `type`, and writes it locally to `{type}.json`.
 * @param type TypeScript type whose schema should be generated.
 */
function generateAndWriteSchema(type: string): void {
	const schema = generator.createSchema(type);
	addMarkdownDescription(schema);

	const outputPath = join(outputDir, `${type.toLowerCase()}.json`);
	const contents = JSON.stringify(schema, null, "\t");

	writeFileSync(outputPath, contents);
	console.log(`Successfully generated schema for ${type}.`);
}

/**
 * Traverses the specified `schema` and appends the `markdownDescription` property for all definitions within the schema that have a `description`.
 * @param schema Schema definition whose properties should be traversed, and `markdownDescription` applied.
 */
function addMarkdownDescription(schema: ExtendedSchema): void {
	if (typeof schema === "object") {
		for (const [prop, value] of Object.entries(schema)) {
			if (typeof value === "object") {
				addMarkdownDescription(value);
			}

			if (prop === "description") {
				schema.markdownDescription = value;
			}
		}
	}
}

/**
 * Provides an extended JSON schema that includes the `markdownDescription` property.
 */
type ExtendedSchema = Schema & {
	/**
	 * Markdown representation of the description.
	 */
	markdownDescription?: string;
};
