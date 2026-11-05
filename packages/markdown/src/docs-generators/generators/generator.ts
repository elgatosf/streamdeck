import type { DocumentationModel } from "../model.js";
import type { OverviewStyle } from "./overview.js";

/**
 * Options used to generate documentation.
 */
export interface GeneratorOptions {
	/**
	 * Style of the overview of the root type, and of each referenced object type; default is `collapsed`.
	 */
	readonly overview?: OverviewStyle;

	/**
	 * Number of levels headings are offset by, e.g. `0` starts headings at `#`, and `2` starts headings at `###`;
	 * default is `0`.
	 */
	readonly headingOffset?: number;
}

/**
 * Generates documentation from a documentation model; generators are independent of how types are discovered,
 * allowing new output formats to be added without changes to discovery. The model already contains both overview
 * representations, so rendering does not need to resolve types again.
 */
export interface DocsGenerator {
	/**
	 * Unique name of the generator, e.g. `flat`.
	 */
	readonly name: string;

	/**
	 * Generates documentation of the model.
	 * @param model Documentation model.
	 * @param options Options used to generate the documentation.
	 * @returns Promise resolving to the generated documentation after its code blocks have been formatted.
	 * @throws When the heading offset is invalid or a code block cannot be formatted.
	 */
	generate(model: DocumentationModel, options?: GeneratorOptions): Promise<string>;
}
