import type { Description, PropertyDocumentation } from "./model.js";

/**
 * Pattern of property names that can be written without quotes.
 */
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Formats a description, and its tags, as Markdown.
 * @param description Description to format.
 * @returns Markdown; empty when there is no description.
 */
export function formatDescription(description: Description): string {
	return [description.text, ...description.tags.map((tag) => `**@${tag.name}**\n\n${tag.text}`.trim())]
		.filter((text) => text.length > 0)
		.join("\n\n");
}

/**
 * Formats a property as a TypeScript property signature, e.g. `readonly name?: string;`.
 * @param property Property to format.
 * @returns TypeScript property signature.
 */
export function formatPropertySignature(
	property: Pick<PropertyDocumentation, "name" | "optional" | "readonly" | "type">,
): string {
	const readonly = property.readonly ? "readonly " : "";
	const name = IDENTIFIER.test(property.name) ? property.name : JSON.stringify(property.name);
	const optional = property.optional ? "?" : "";
	return `${readonly}${name}${optional}: ${property.type};`;
}
