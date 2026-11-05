import { Node, SyntaxKind, type Type } from "ts-morph";

import type { DocumentableDeclaration } from "./declaration.js";

/**
 * Finds the named, user-defined types referenced by types; containers and generic type arguments are walked, whereas
 * named type bodies are not, as they are documented separately. Declaration-file types are excluded to avoid
 * documenting library internals; visited types and ordered declaration sets prevent cycles and duplicate references.
 * @param types Types to inspect.
 * @param owner Declaration to exclude from the references, e.g. to prevent a type referencing itself.
 * @returns Referenced declarations, in the order they were found.
 */
export function getReferences(types: readonly Type[], owner?: DocumentableDeclaration): DocumentableDeclaration[] {
	const references = new Set<DocumentableDeclaration>();
	const visited = new Set<Type>();

	/**
	 * Visits generic arguments even when their outer type is excluded, e.g. `Detail` in `Promise<Detail>`.
	 * @param type Type whose arguments are visited.
	 */
	function visitTypeArguments(type: Type): void {
		const typeArguments = type.getAliasTypeArguments();
		(typeArguments.length > 0 ? typeArguments : type.getTypeArguments()).forEach(visit);
	}

	/**
	 * Visits a type, adding it to the references when it is a named type.
	 * @param type Type to visit.
	 */
	function visit(type: Type): void {
		if (visited.has(type)) {
			return;
		}
		visited.add(type);

		const symbol = type.getAliasSymbol() ?? type.getSymbol();
		for (const node of symbol?.getDeclarations() ?? []) {
			// Enum members are documented through their parent enum, not as separate types.
			const declaration = Node.isEnumMember(node) ? node.getParent() : node;
			if (isDocumentable(declaration) && !declaration.getSourceFile().isDeclarationFile()) {
				if (declaration !== owner) {
					references.add(declaration);
				}
				visitTypeArguments(type);
				return;
			}
		}

		visitTypeArguments(type);
		if (type.isArray() || type.isReadonlyArray()) {
			visit(type.getArrayElementTypeOrThrow());
		} else if (type.isTuple()) {
			type.getTupleElements().forEach(visit);
		} else if (type.isUnion()) {
			type.getUnionTypes().forEach(visit);
		} else if (type.isIntersection()) {
			type.getIntersectionTypes().forEach(visit);
		}
	}

	types.forEach(visit);
	return [...references];
}

/**
 * Finds the named, user-defined types referenced by name within a type node. Unlike {@link getReferences}, this
 * finds aliases the type checker erases, such as instantiated generic aliases (`Bar<"bar", TRect>`) and aliases of
 * primitives (`type X = number`).
 * @param node Type node to inspect.
 * @param owner Declaration to exclude from the references, e.g. to prevent a type referencing itself.
 * @returns Referenced declarations, in the order they were found.
 */
export function getNodeReferences(node: Node | undefined, owner?: DocumentableDeclaration): DocumentableDeclaration[] {
	const references = new Set<DocumentableDeclaration>();

	/**
	 * Visits a node, adding the declarations of type references, and then visiting its children.
	 * @param current Node to visit.
	 */
	function visit(current: Node): void {
		// The checker resolves computed types, e.g. `(typeof Versions)[number]`; scanning their syntax would instead
		// discover intermediate names that are not necessarily references in the resolved type.
		if (
			Node.isIndexedAccessTypeNode(current) ||
			Node.isTypeQuery(current) ||
			(Node.isTypeOperatorTypeNode(current) && current.getOperator() === SyntaxKind.KeyOfKeyword)
		) {
			return;
		}

		if (Node.isTypeReference(current)) {
			let symbol = current.getTypeName().getSymbol();
			// Resolve import aliases to the original declaration so references share its identity.
			symbol = symbol?.getAliasedSymbol() ?? symbol;
			for (const declaration of symbol?.getDeclarations() ?? []) {
				if (isDocumentable(declaration) && declaration !== owner && !declaration.getSourceFile().isDeclarationFile()) {
					references.add(declaration);
				}
			}
		}

		current.forEachChild(visit);
	}

	if (node !== undefined) {
		visit(node);
	}

	return [...references];
}

/**
 * Determines whether the node is a declaration that can be documented.
 * @param node Node to check.
 * @returns `true` when the node can be documented.
 */
export function isDocumentable(node: Node): node is DocumentableDeclaration {
	return Node.isEnumDeclaration(node) || Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node);
}
