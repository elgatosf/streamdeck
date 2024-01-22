/* eslint-disable no-useless-escape */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Schema, createGenerator } from "ts-json-schema-generator";

// Create a generator so we're able to produce multiple schemas.
const generator = createGenerator({
	extraTags: ["filePath"],
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
	applyCustomKeywords(schema);

	const outputPath = join(outputDir, `${type.toLowerCase()}.json`);
	const contents = JSON.stringify(schema, null, "\t");

	writeFileSync(outputPath, contents);
	console.log(`Successfully generated schema for ${type}.`);
}

/**
 * Applies the custom keywords, aggregating the schema to form a valid structure.
 * @param schema Schema to apply the custom keywords to.
 */
function applyCustomKeywords(schema: ExtendedSchema): void {
	visitNode(schema, (node, keyword, value) => {
		switch (keyword) {
			case "description":
				node.markdownDescription = value?.toString();
				break;

			case "filePath":
				node.pattern = generatePathPattern(value as FilePathOptions);
				break;
		}
	});
}

/**
 * Generates the regular expression pattern of a property based file path's {@link options}.
 * - {@link https://regexr.com/7qpi6 File path, with unknown extension}
 * - {@link https://regexr.com/7qpj7 File path, with extension}
 * - {@link https://regexr.com/7qp5k File path, without extension}
 * @param options Options used to determine how the pattern should be generated.
 * @returns Regular expression pattern.
 */
function generatePathPattern(options: FilePathOptions): string {
	let pattern = "^(?![~\\.]*[\\\\\\/]+)"; // ensure the value doesn't start with a slash, or period followed by a slash.

	// When the file path's extension is unknown, we simply ensure the start of the string.
	if (typeof options === "boolean") {
		if (!options) {
			throw new TypeError(`"false" is not a valid value for "filePath", expected: "true"`);
		}

		return (pattern += ".*$");
	}

	// Validate the options are present.
	if (typeof options !== "object" || !("extensions" in options) || !("includeExtension" in options)) {
		throw new TypeError(`${JSON.stringify(options)} is not a complete set of "filePath" options, expected: { "extensions": string[], "includeExtension": boolean }`);
	}

	// Otherwise, construct the pattern based on the valid extensions.
	const exts = options.extensions
		.map((extension) => {
			const chars = Array.from(extension)
				.slice(1)
				.map((c) => `[${c.toUpperCase()}${c.toLowerCase()}]`)
				.join("");

			return `(${chars})`;
		})
		.join("|");

	if (options.includeExtension) {
		// Ensure the value ends with a valid extension
		pattern += `.*\\.(${exts})$`;
	} else {
		// Use a negative look-ahead to ensure the extension isn't specified.
		pattern += `(?!.*\\.(${exts})$).*$`;
	}

	return pattern;
}

/**
 * Traverses the specified {@link schema} and applies the visitor to each property.
 * @param schema Schema to traverse
 * @param visitor Visitor to each of the schema's properties.
 */
function visitNode(schema: ExtendedSchema, visitor: (schema: ExtendedSchema, keyword: keyof ExtendedSchema, value: unknown) => void): void {
	if (typeof schema === "object") {
		for (const [keyword, value] of Object.entries(schema)) {
			if (typeof value === "object") {
				visitNode(value, visitor);
			}

			visitor(schema, keyword as keyof ExtendedSchema, value);
		}
	}
}

/**
 * Provides an extended JSON schema that includes the `markdownDescription` property.
 */
type ExtendedSchema = Schema & {
	/**
	 * Determines whether the value must represent a file path.
	 */
	filePath?: FilePathOptions;

	/**
	 * Markdown representation of the description.
	 */
	markdownDescription?: string;
};

/**
 * Options used to determine a valid file path, used to generate the regular expression pattern.
 */
type FilePathOptions =
	| boolean
	| {
			/**
			 * Collection of valid file extensions.
			 */
			extensions: string[];
			/**
			 * Determines whether the extension must be present, or omitted, from the file path.
			 */
			includeExtension: boolean;
	  };
