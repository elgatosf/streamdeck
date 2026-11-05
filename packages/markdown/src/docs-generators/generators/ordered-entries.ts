import type { EnumMemberDocumentation, PropertyDocumentation, TypeDocumentation } from "../model.js";

/** Property or enum member included in a type's reference documentation. */
export type DocumentedEntry = EnumMemberDocumentation | PropertyDocumentation;

/**
 * Property in a type's documentation, identified by its path from the type; properties of inline object types are
 * documented alongside the type's own properties, e.g. `font.size`, rather than in a chapter of their own.
 */
export interface PropertyEntry extends PropertyDocumentation {
	/**
	 * Dotted path of the property from the type, e.g. `font.size`; used as its visible name and anchor.
	 */
	readonly path: string;

	/**
	 * Path of the property whose inline object type declares this property, e.g. `font` for `font.size`; `undefined`
	 * for the type's own properties.
	 */
	readonly parent: string | undefined;
}

/**
 * Combines a type's properties and enum members in alphabetical order. Sorting a copy keeps both generators
 * consistent without changing the declaration order retained by the model and its type definitions.
 * @param type Type to read entries from.
 * @returns Entries sorted by name.
 */
export function getOrderedEntries(type: TypeDocumentation): DocumentedEntry[] {
	return [...type.properties, ...type.members].sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Flattens a property and the properties of its inline object types, depth-first, so that each parent precedes its
 * alphabetically ordered children.
 * @param property Property to flatten.
 * @param parent Path of the parent property; `undefined` for the type's own properties.
 * @returns Property entries, starting with the property itself.
 */
export function flattenProperty(property: PropertyDocumentation, parent?: string): PropertyEntry[] {
	const path = parent === undefined ? property.name : `${parent}.${property.name}`;
	return [
		{ ...property, path, parent },
		...property.properties
			.toSorted((left, right) => left.name.localeCompare(right.name))
			.flatMap((nested) => flattenProperty(nested, path)),
	];
}
