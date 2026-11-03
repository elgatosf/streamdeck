/**
 * Documentation of a root type and the types it references; the model is independent of how the types were
 * discovered, allowing generators to render documentation without knowledge of the TypeScript compiler.
 */
export interface DocumentationModel {
	/**
	 * Type the documentation was generated for; this is always the first item of `types`.
	 */
	readonly root: TypeDocumentation;

	/**
	 * Root type, and the types it references (directly or transitively), in the order they were discovered.
	 */
	readonly types: readonly TypeDocumentation[];
}

/**
 * Documentation of a named type.
 */
export interface TypeDocumentation {
	/**
	 * Name of the type, e.g. `Action`.
	 */
	readonly name: string;

	/**
	 * Kind of type, determining which of `properties` and `members` are populated.
	 * - `enum` has `members`.
	 * - `object` has `properties`.
	 * - `other` (e.g. unions, tuples, and primitives) has neither, and is best represented by its `definition`.
	 */
	readonly kind: "enum" | "object" | "other";

	/**
	 * Description of the type.
	 */
	readonly description: Description;

	/**
	 * TypeScript definition of the type, without documentation; properties are resolved, e.g. properties inherited
	 * from intersections are included.
	 */
	readonly definition: string;

	/**
	 * Properties of an `object` type, in declaration order.
	 */
	readonly properties: readonly PropertyDocumentation[];

	/**
	 * Members of an `enum` type, in declaration order.
	 */
	readonly members: readonly EnumMemberDocumentation[];

	/**
	 * Other documented types referenced by the type.
	 */
	readonly references: readonly TypeDocumentation[];
}

/**
 * Documentation of a property of an object type.
 */
export interface PropertyDocumentation {
	/**
	 * Name of the property.
	 */
	readonly name: string;

	/**
	 * TypeScript type of the property, excluding the `undefined` implied by `optional`.
	 */
	readonly type: string;

	/**
	 * Determines whether the property is optional.
	 */
	readonly optional: boolean;

	/**
	 * Determines whether the property is read-only.
	 */
	readonly readonly: boolean;

	/**
	 * Description of the property.
	 */
	readonly description: Description;

	/**
	 * Documented types referenced by the property's type.
	 */
	readonly references: readonly TypeDocumentation[];
}

/**
 * Documentation of a member of an enum.
 */
export interface EnumMemberDocumentation {
	/**
	 * Name of the member.
	 */
	readonly name: string;

	/**
	 * Value of the member, as TypeScript, e.g. `0` or `"value"`.
	 */
	readonly value: string;

	/**
	 * Description of the member.
	 */
	readonly description: Description;
}

/**
 * Description of a type, property, or member, parsed from its documentation.
 */
export interface Description {
	/**
	 * Description, as Markdown.
	 */
	readonly text: string;

	/**
	 * Tags associated with the description, e.g. `@deprecated`.
	 */
	readonly tags: readonly DescriptionTag[];
}

/**
 * Tag associated with a description, e.g. `@deprecated`.
 */
export interface DescriptionTag {
	/**
	 * Name of the tag, without the `@` prefix.
	 */
	readonly name: string;

	/**
	 * Text of the tag, as Markdown.
	 */
	readonly text: string;
}
