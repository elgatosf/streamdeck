/* eslint-disable no-useless-escape */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Schema, createGenerator } from "ts-json-schema-generator";

// Create a generator so we're able to produce multiple schemas.
const generator = createGenerator({
	extraTags: ["errorMessage", "filePath"],
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
				validateFilePathOptions(value);
				node.pattern = generatePathPattern(value);
				node.errorMessage = generatePathErrorMessage(value);

				break;
		}
	});
}

/**
 * Validates the specified {@link options} are an instance of {@link FilePathOptions}.
 * @param options Options to validate.
 */
function validateFilePathOptions(options: unknown): asserts options is FilePathOptions {
	if (options === null) {
		throw new TypeError(`"filePath" options must not be null`);
	}

	if (typeof options === "boolean") {
		if (options === false) {
			throw new TypeError(`"false" is not a valid value for "filePath", expected: "true"`);
		}

		return;
	}

	if (typeof options !== "object" || !("extensions" in options) || !("includeExtension" in options)) {
		throw new TypeError(`${JSON.stringify(options)} is not a complete set of "filePath" options, expected: { "extensions": string[], "includeExtension": boolean }`);
	}
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
		return (pattern += ".*$");
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
 * Generates the custom error message associated with a file path.
 * @param options Options that define the valid file path.
 * @returns Custom error message.
 */
function generatePathErrorMessage(options: FilePathOptions): string {
	if (typeof options === "boolean") {
		return "String must be a file located within the plugins's directory";
	}

	const exts = options.extensions.reduce((prev, current, index) => {
		return index === 0 ? current : index === options.extensions.length - 1 ? prev + `, or ${current}` : prev + `, ${current}`;
	}, "");

	const errorMessage = `String must be a ${exts} file located within the plugin's directory`;
	if (options.includeExtension) {
		return errorMessage;
	}

	return `${errorMessage}, with the file extension omitted`;
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
	 * Custom error message shown when the value does not confirm to the defined schemas.
	 */
	errorMessage?: string;

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
	| true
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
