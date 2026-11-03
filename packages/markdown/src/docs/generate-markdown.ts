import { discoverTypes, findDeclaration, loadSourceFile } from "./discovery/discover-types.js";
import type { DocsGenerator, GeneratorOptions } from "./generators/generator.js";
import type { OverviewStyle } from "./generators/overview.js";
import { referenceGenerator } from "./generators/reference.js";
import { tableGenerator } from "./generators/table.js";
import type { DocumentationModel } from "./model.js";

export type { OverviewStyle };

/**
 * Format used to document a type.
 */
export type DocumentationFormat = "flat" | "table";

/**
 * The format union and its registered implementations must stay in sync.
 */
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
 * Options used to generate Markdown documentation for a type.
 */
export interface DocumentationOptions extends GeneratorOptions {
	/**
	 * Name of the type declared, or exported, by the source.
	 */
	readonly typeName: string;

	/**
	 * Format used to document the type.
	 */
	readonly format: DocumentationFormat;
}

/**
 * TypeScript file from which Markdown documentation can be generated for the types it declares, or exports.
 */
export interface DocumentationSource {
	/**
	 * Generates Markdown documentation for a type and the types it references; each requested root is discovered once,
	 * and can be generated in multiple formats.
	 * @param options Options used to generate the documentation.
	 * @returns Promise resolving to the generated Markdown.
	 * @throws When the format or heading offset is unsupported, the type is not found, or a code block cannot be formatted.
	 */
	generate(options: DocumentationOptions): Promise<string>;
}

/**
 * Loads a TypeScript file once for documentation of multiple root types and formats. Discovery is lazy and cached per
 * root name, so formats share a model while different roots retain their own reference graphs.
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
		async generate(options: DocumentationOptions): Promise<string> {
			const { typeName, format, overview, headingOffset } = options;
			// Reject inherited Object properties as well as unknown formats from untyped callers.
			if (!Object.hasOwn(generators, format)) {
				throw new Error(`Unsupported documentation format "${String(format)}".`);
			}

			return generators[format].generate(discover(typeName), { overview, headingOffset });
		},
	};
}
