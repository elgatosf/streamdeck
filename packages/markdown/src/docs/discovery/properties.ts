import {
	Node,
	SyntaxKind,
	TypeFormatFlags,
	ts,
	type Symbol as MorphSymbol,
	type PropertyDeclaration,
	type PropertySignature,
	type Type,
	type TypeNode,
} from "ts-morph";

import type { Description } from "../model.js";
import type { DocumentableDeclaration } from "./declaration.js";
import { getDescription } from "./descriptions.js";
import { getNodeReferences, getReferences } from "./references.js";

/**
 * Property discovered on a type, with references to the declarations of other types. References remain declarations
 * until discovery links the complete graph into the compiler-independent model.
 */
export interface DiscoveredProperty {
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
	 * Declarations of the types referenced by the property's type.
	 */
	readonly references: readonly DocumentableDeclaration[];
}

/**
 * Determines whether a type is best documented by its properties, e.g. object literals, interfaces, and intersections
 * of them; arrays, tuples, functions, and dictionaries are not. Excluding containers, callable types, and index
 * signatures avoids presenting library members or open-ended keys as a fixed list of documented properties.
 * @param type Type to check.
 * @returns `true` when the type is documented by its properties.
 */
export function isObjectLike(type: Type): boolean {
	if (type.isIntersection()) {
		return type.getIntersectionTypes().every(isObjectLike);
	}

	return (
		type.isObject() &&
		!type.isArray() &&
		!type.isReadonlyArray() &&
		!type.isTuple() &&
		type.getCallSignatures().length === 0 &&
		type.getConstructSignatures().length === 0 &&
		type.getStringIndexType() === undefined &&
		type.getNumberIndexType() === undefined
	);
}

/**
 * Discovers a property of a type, resolving properties inherited from intersections and generic types. Checker and
 * syntax references are combined because the checker resolves instantiated types but can erase named aliases.
 * @param symbol Symbol of the property.
 * @param owner Declaration of the type the property belongs to.
 * @param tags Names of the JSDoc tags to include.
 * @returns Discovered property.
 */
export function discoverProperty(
	symbol: MorphSymbol,
	owner: DocumentableDeclaration,
	tags: ReadonlySet<string>,
): DiscoveredProperty {
	const { declaration, type, typeNode, text, optional, readonly } = resolvePropertyType(symbol, owner);
	const references =
		typeNode === undefined
			? getReferences([type])
			: [...new Set([...getReferences([type]), ...getNodeReferences(typeNode)])];

	return {
		name: symbol.getName(),
		type: text,
		optional,
		readonly,
		description: declaration === undefined ? { text: "", tags: [] } : getDescription(declaration, tags),
		references,
	};
}

/**
 * Type of a property, resolved relative to the type that owns it. When present, the source node preserves aliases;
 * otherwise the checker supplies the type, including generic substitutions, in the owner's context.
 */
export interface ResolvedPropertyType {
	/**
	 * Declaration of the property, when it is declared as a property signature or declaration.
	 */
	readonly declaration: PropertyDeclaration | PropertySignature | undefined;

	/**
	 * Type of the property, excluding the `undefined` implied by `optional`.
	 */
	readonly type: Type;

	/**
	 * Declared type node the type was resolved from; `undefined` when the type was instantiated.
	 */
	readonly typeNode: TypeNode | undefined;

	/**
	 * TypeScript type of the property.
	 */
	readonly text: string;

	/**
	 * Determines whether the property is optional.
	 */
	readonly optional: boolean;

	/**
	 * Determines whether the property is read-only.
	 */
	readonly readonly: boolean;
}

/**
 * Resolves the type of a property, instantiating properties inherited from intersections and generic types.
 * @param symbol Symbol of the property.
 * @param owner Declaration the property is resolved relative to.
 * @returns Resolved type of the property.
 */
export function resolvePropertyType(symbol: MorphSymbol, owner: DocumentableDeclaration): ResolvedPropertyType {
	const declaration = symbol
		.getDeclarations()
		.find((node) => Node.isPropertySignature(node) || Node.isPropertyDeclaration(node));
	const optional = symbol.hasFlags(ts.SymbolFlags.Optional);
	const readonly = declaration !== undefined && declaration.isReadonly();
	const typeNode = declaration?.getTypeNode();

	// The declared type preserves aliases (e.g. `Action[]`), and is used unless it must be instantiated, for example a
	// property inherited from `Base<T>` whose type is `T`.
	if (typeNode !== undefined && (typeNode.getAncestors().includes(owner) || !dependsOnTypeParameters(typeNode))) {
		const type = typeNode.getType();
		return { declaration, type, typeNode, text: formatType(type, typeNode), optional, readonly };
	}

	// The owner supplies the context for generic substitutions; the original node may reference unresolved parameters.
	let type = symbol.getTypeAtLocation(owner);
	type = optional ? type.getNonNullableType() : type;
	return { declaration, type, typeNode: undefined, text: formatType(type, owner), optional, readonly };
}

/**
 * Determines whether a type node references a type parameter, e.g. `T` or `T[]`.
 * @param typeNode Type node to check.
 * @returns `true` when the type node references a type parameter.
 */
function dependsOnTypeParameters(typeNode: TypeNode): boolean {
	return [typeNode, ...typeNode.getDescendantsOfKind(SyntaxKind.TypeReference)].some(
		(node) => Node.isTypeReference(node) && node.getType().isTypeParameter(),
	);
}

/**
 * Formats a type as TypeScript, without truncation. Full type text is needed for emitted code rather than the
 * abbreviated text the checker may produce for display.
 * @param type Type to format.
 * @param enclosingNode Node used to determine how the type's names are qualified.
 * @returns TypeScript type.
 */
export function formatType(type: Type, enclosingNode: Node): string {
	// TypeScript prints optional tuple elements as `(T | undefined)?`; restore the source form `T?`.
	return type.getText(enclosingNode, TypeFormatFlags.NoTruncation).replace(/\(([^()]+?) \| undefined\)\?/g, "$1?");
}
