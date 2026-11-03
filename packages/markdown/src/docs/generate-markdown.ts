import { discoverTypes, findDeclaration, loadSourceFile } from "./discovery/discover-types.js";
import type { DocsGenerator } from "./generators/generator.js";
import { referenceGenerator } from "./generators/reference.js";
import { tableGenerator } from "./generators/table.js";
import type { DocumentationModel } from "./model.js";

/**
 * Format used to document a type.
 */
export type DocumentationFormat = "flat" | "table";

const generators = {
	flat: referenceGenerator,
	table: tableGenerator,
} satisfies Record<DocumentationFormat, DocsGenerator>;

/**
 * Options used to load a TypeScript file from which documentation can be generated.
 */
export interface DocumentationSourceOptions {
	/**
	 * Path to the TypeScript file that declares, or exports, the types.
	 */
	readonly src: string;

	/**
	 * Optional path to a tsconfig file used to resolve types. When omitted, strict compiler options are used.
	 */
	readonly tsconfigFile?: string;

	/**
	 * Names of the JSDoc tags to include, without the `@` prefix. When omitted, the default tags are used.
	 */
	readonly tags?: Iterable<string>;
}

/**
 * TypeScript file from which Markdown documentation can be generated for the types it declares, or exports.
 */
export interface DocumentationSource {
	/**
	 * Generates Markdown documentation for a type and the types it references; each type is discovered once, and can
	 * be generated in multiple formats.
	 * @param typeName Name of the type declared, or exported, by the source.
	 * @param format Format used to document the type.
	 * @returns Generated Markdown.
	 * @throws When the format is unsupported, or the type is not found.
	 */
	generate(typeName: string, format: DocumentationFormat): string;
}

/**
 * Options used to generate Markdown documentation for a TypeScript type.
 */
export interface GenerateMarkdownOptions extends DocumentationSourceOptions {
	/**
	 * Name of the type declared, or exported, by `src`.
	 */
	readonly typeName: string;

	/**
	 * Format used to document the type.
	 */
	readonly format: DocumentationFormat;
}

/**
 * Loads a TypeScript file from which Markdown documentation can be generated for multiple types and formats, without
 * reloading the file or rediscovering types.
 * @param options Options used to load the file and discover types.
 * @returns Source from which documentation can be generated.
 * @throws When the source or tsconfig file cannot be read.
 */
export function createDocumentationSource(options: DocumentationSourceOptions): DocumentationSource {
	const { src, tsconfigFile, tags } = options;
	const source = loadSourceFile(src, tsconfigFile);
	const models = new Map<string, DocumentationModel>();

	const discover = (typeName: string): DocumentationModel => {
		let model = models.get(typeName);
		if (model === undefined) {
			const declaration = findDeclaration(source, typeName);
			if (declaration === undefined) {
				throw new Error(`Unable to find type "${typeName}" in ${src}.`);
			}

			model = discoverTypes(declaration, { tags });
			models.set(typeName, model);
		}

		return model;
	};

	return {
		generate(typeName: string, format: DocumentationFormat): string {
			if (!Object.hasOwn(generators, format)) {
				throw new Error(`Unsupported documentation format "${String(format)}".`);
			}

			return generators[format].generate(discover(typeName));
		},
	};
}

/**
 * Generates Markdown documentation for a TypeScript type and the types it references. When documenting multiple types
 * or formats from the same file, prefer {@link createDocumentationSource}.
 * @param options Options used to discover and generate documentation.
 * @returns Generated Markdown.
 * @throws When the format is unsupported, the source or tsconfig file cannot be read, or the type is not found.
 */
export function generateMarkdown(options: GenerateMarkdownOptions): string {
	const { typeName, format } = options;

	if (!Object.hasOwn(generators, format)) {
		throw new Error(`Unsupported documentation format "${String(format)}".`);
	}

	return createDocumentationSource(options).generate(typeName, format);
}
