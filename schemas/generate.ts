import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import { createGenerator, Schema } from "ts-json-schema-generator";

// Create a generator so we're able to produce multiple schemas.
const generator = createGenerator({
	path: path.join(__dirname, "../src/index.ts"),
	tsconfig: path.join(__dirname, "../tsconfig.json")
});

generateAndWriteSchema("Manifest");

/**
 * Generates the JSON schema for the specified TypeScript `type`, and writes it locally to `{type}.json`.
 * @param type TypeScript type whose schema should be generated.
 */
function generateAndWriteSchema(type: string) {
	const schema = generator.createSchema(type);
	addMarkdownDescription(schema);

	const outputPath = path.join(__dirname, `${type.toLowerCase()}.json`);
	const contents = JSON.stringify(schema, null, "\t");

	fs.writeFile(outputPath, contents, {}, () => {
		console.log(`Successfully generated schema for ${chalk.green(type)}.`);
	});
}

/**
 * Traverses the specified `schema` and appends the `markdownDescription` property for all definitions within the schema that have a `description`.
 * @param schema Schema definition whose properties should be traversed, and `markdownDescription` applied.
 */
function addMarkdownDescription(schema: ExtendedSchema) {
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
