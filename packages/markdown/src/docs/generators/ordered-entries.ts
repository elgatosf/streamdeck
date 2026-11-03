import type { EnumMemberDocumentation, PropertyDocumentation, TypeDocumentation } from "../model.js";

/** Property or enum member included in a type's reference documentation. */
export type DocumentedEntry = EnumMemberDocumentation | PropertyDocumentation;

/**
 * Combines a type's properties and enum members in alphabetical order. Sorting a copy keeps both generators
 * consistent without changing the declaration order retained by the model and its type definitions.
 * @param type Type to read entries from.
 * @returns Entries sorted by name.
 */
export function getOrderedEntries(type: TypeDocumentation): DocumentedEntry[] {
	return [...type.properties, ...type.members].sort((left, right) => left.name.localeCompare(right.name));
}
