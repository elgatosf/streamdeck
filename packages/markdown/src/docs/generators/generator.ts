import type { DocumentationModel } from "../model.js";

/**
 * Generates documentation from a documentation model; generators are independent of how types are discovered,
 * allowing new output formats to be added without changes to discovery.
 */
export interface DocsGenerator {
	/**
	 * Unique name of the generator, e.g. `flat`.
	 */
	readonly name: string;

	/**
	 * Generates documentation of the model.
	 * @param model Documentation model.
	 * @returns Generated documentation.
	 */
	generate(model: DocumentationModel): string;
}
