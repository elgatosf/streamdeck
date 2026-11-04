import { Node, ts, type InterfaceDeclaration, type Type, type TypeAliasDeclaration } from "ts-morph";

import { formatPropertySignature } from "../format.js";
import type { DocumentableDeclaration } from "./declaration.js";
import {
	formatType,
	formatUnion,
	hasCallOrConstructSignatures,
	isObjectLike,
	resolvePropertyType,
} from "./properties.js";

/**
 * Indentation of each level of nesting.
 */
const INDENT = "    ";

/**
 * Renders the definition of an object type from the body of the type. The body is computed from resolved properties,
 * while the declaration's kind, export status, name, and type parameters are retained.
 * @param declaration Declaration of the type.
 * @param body Body of the type, e.g. `{ name: string; }`.
 * @returns TypeScript definition.
 */
export function formatObjectDefinition(declaration: InterfaceDeclaration | TypeAliasDeclaration, body: string): string {
	const exported = declaration.isExported() ? "export " : "";
	const parameters = declaration.getTypeParameters();
	const typeParameters =
		parameters.length > 0 ? `<${parameters.map((parameter) => parameter.getText()).join(", ")}>` : "";

	return Node.isInterfaceDeclaration(declaration)
		? `${exported}interface ${declaration.getName()}${typeParameters} ${body}`
		: `${exported}type ${declaration.getName()}${typeParameters} = ${body};`;
}

/**
 * Renders the definition of an object type, with the object types it references (directly, or within unions, arrays,
 * and tuples) inlined as nested structures; generic types are instantiated with their type arguments. Other types,
 * e.g. enums and unions of literals, and recursive references, are referenced by name. Using checker-resolved
 * properties rather than text substitution preserves instantiated generics and inherited members.
 * @param root Declaration of the type.
 * @returns TypeScript definition; `undefined` when the type is not object-like.
 */
export function getExpandedDefinition(root: DocumentableDeclaration): string | undefined {
	if (Node.isEnumDeclaration(root)) {
		return undefined;
	}

	const type = root.getType();
	if (!isObjectLike(type)) {
		return undefined;
	}

	return formatObjectDefinition(root, expandObject(type, root, "", new Set([root])));
}

/**
 * Renders an object type as an object literal type, expanding the types of its properties.
 * @param type Object type.
 * @param root Declaration types are resolved relative to.
 * @param indent Indentation of the line the object starts on.
 * @param ancestors Keys of the types being expanded on this branch, used to prevent infinite recursion without
 * suppressing the same type in sibling properties.
 * @returns Object literal type.
 */
function expandObject(
	type: Type,
	root: DocumentableDeclaration,
	indent: string,
	ancestors: ReadonlySet<unknown>,
): string {
	const properties = type.getProperties();
	if (properties.length === 0) {
		return "{}";
	}

	const inner = indent + INDENT;
	const lines = properties.map((symbol) => {
		const property = resolvePropertyType(symbol, root);
		const expanded = expandType(property.type, property.text, root, inner, ancestors, property.optional);
		return inner + formatPropertySignature({ ...property, name: symbol.getName(), type: expanded });
	});

	return `{\n${lines.join("\n")}\n${indent}}`;
}

/**
 * Renders a type, expanding the object types it contains; types without expandable object types are rendered as
 * `text`, preserving their aliases and avoiding unnecessary reconstruction of their syntax.
 * @param type Type.
 * @param text Text of the type.
 * @param root Declaration types are resolved relative to.
 * @param indent Indentation of the line the type starts on.
 * @param ancestors Keys of the types being expanded.
 * @param excludeUndefined Whether to omit undefined from an optional property union.
 * @returns TypeScript type.
 */
function expandType(
	type: Type,
	text: string,
	root: DocumentableDeclaration,
	indent: string,
	ancestors: ReadonlySet<unknown>,
	excludeUndefined = false,
): string {
	if (!containsExpandable(type, ancestors, new Set())) {
		return text;
	}

	const key = getExpandableKey(type, ancestors);
	if (key !== undefined) {
		return expandObject(type, root, indent, new Set([...ancestors, key]));
	}

	const expand = (inner: Type): string => expandType(inner, formatType(inner, root), root, indent, ancestors);
	// Parenthesize expanded unions before array or optional tuple suffixes to preserve precedence; without it,
	// `(A | B)[]` would become `A | B[]`.
	const element = (inner: Type): string =>
		inner.isUnion() && !inner.isBoolean() && containsExpandable(inner, ancestors, new Set())
			? `(${expand(inner)})`
			: expand(inner);

	if (type.isUnion()) {
		// Optional properties imply `undefined`, which is omitted as it is represented by the `?` modifier.
		const members = type.getUnionTypes().filter((member) => !excludeUndefined || !member.isUndefined());
		return formatUnion(members, expand);
	}

	if (type.isArray() || type.isReadonlyArray()) {
		const prefix = type.isReadonlyArray() ? "readonly " : "";
		return `${prefix}${element(type.getArrayElementTypeOrThrow())}[]`;
	}

	if (type.isTuple()) {
		// Element types do not carry the tuple's optional, rest, and readonly syntax; recover it from compiler metadata.
		const target = (type.compilerType as unknown as ts.TupleTypeReference).target;
		const elements = type.getTupleElements().map((inner, i) => {
			const flags = target.elementFlags[i] ?? ts.ElementFlags.Required;
			if (flags & ts.ElementFlags.Variadic) {
				return `...${expand(inner)}`;
			}

			if (flags & ts.ElementFlags.Rest) {
				return `...${element(inner)}[]`;
			}

			if (flags & ts.ElementFlags.Optional) {
				// Optional elements imply `undefined`; unions and callable types need parentheses before `?`.
				const types = inner.isUnion() ? inner.getUnionTypes().filter((member) => !member.isUndefined()) : [inner];
				const text = formatUnion(types, expand);
				const parenthesize = types.length > 1 || (types.length === 1 && hasCallOrConstructSignatures(types[0]!));
				return `${parenthesize ? `(${text})` : text}?`;
			}

			return expand(inner);
		});

		return `${target.readonly ? "readonly " : ""}[${elements.join(", ")}]`;
	}

	return text;
}

/**
 * Determines whether the type is, or contains (within unions, arrays, and tuples), an object type that can be expanded.
 * @param type Type.
 * @param ancestors Keys of the types being expanded.
 * @param visited Types already visited during this search, preventing cycles in container types.
 * @returns `true` when the type contains an expandable object type; otherwise `false`.
 */
function containsExpandable(type: Type, ancestors: ReadonlySet<unknown>, visited: Set<Type>): boolean {
	if (visited.has(type)) {
		return false;
	}
	visited.add(type);

	if (getExpandableKey(type, ancestors) !== undefined) {
		return true;
	}

	if (type.isUnion()) {
		return type.getUnionTypes().some((member) => containsExpandable(member, ancestors, visited));
	}

	if (type.isArray() || type.isReadonlyArray()) {
		return containsExpandable(type.getArrayElementTypeOrThrow(), ancestors, visited);
	}

	if (type.isTuple()) {
		return type.getTupleElements().some((element) => containsExpandable(element, ancestors, visited));
	}

	return false;
}

/**
 * Gets a recursion key for an expandable object type. Named types use their declaration, excluding declaration files
 * to avoid inlining library internals. Anonymous intersections use their compiler type when all constituents can be
 * expanded; a key already in `ancestors` is not expanded again.
 * @param type Type.
 * @param ancestors Keys of the types being expanded.
 * @returns Key of the type; `undefined` when the type cannot be expanded.
 */
function getExpandableKey(type: Type, ancestors: ReadonlySet<unknown>): unknown {
	if (!isObjectLike(type)) {
		return undefined;
	}

	const declaration = (type.getAliasSymbol() ?? type.getSymbol())?.getDeclarations()[0];
	if (declaration !== undefined) {
		return declaration.getSourceFile().isDeclarationFile() || ancestors.has(declaration) ? undefined : declaration;
	}

	// Anonymous intersections are keyed by their type, and expanded when their constituents are.
	if (type.isIntersection() && type.getIntersectionTypes().every((inner) => getExpandableKey(inner, ancestors))) {
		return ancestors.has(type.compilerType) ? undefined : type.compilerType;
	}

	return undefined;
}
