/**
 * Massive thank you Rinat Zaripov's {@link https://gist.github.com/zaripych}, and his GitHub gist that
 * made a lot of this possible. {@link https://gist.github.com/zaripych/963fa6584524e5b446b70548dbabbf65}.
 */
import { createWrappedNode, type JSDoc, Node, Symbol, SyntaxKind, Type, type TypeChecker } from "ts-morph";
import { ts } from "ts-morph";

import { ArrayStructure } from "./array.js";
import { EnumStructure } from "./enum.js";
import { ObjectStructure } from "./object.js";
import { PrimitiveStructure } from "./primitive.js";
import { PromiseStructure } from "./promise.js";
import { SignatureStructure } from "./signature.js";
import type { Structure } from "./structure.js";
import { TupleStructure } from "./tuple.js";
import { TypeParameterStructure } from "./type-parameter.js";
import { UnionStructure } from "./union.js";

/**
 * Structure builder, responsible for building structures from types.
 */
export class StructureBuilder {
	/**
	 * Provides a cache of previously evaluated structures, indexed by their alias.
	 */
	#cache: Map<unknown, Structure> = new Map();

	/**
	 * Initializes a new instance of the {@link StructureBuilder} class.
	 * @param node Source node of the structures created from this builder.
	 * @param typeChecker Type checker associated with the source node.
	 */
	constructor(
		public readonly node: Node,
		private readonly typeChecker: TypeChecker,
	) {}

	/**
	 * Gets the alias for the specified type.
	 * @param type The type.
	 * @param parent The parent node.
	 * @returns The alias of the type; otherwise `undefined`.
	 */
	public getAlias(type: Type, parent?: Node): string | undefined {
		// Attempt to get the alias from the parent
		if (Node.isTyped(parent)) {
			const typeNode = parent.getTypeNodeOrThrow();
			if (typeNode.isKind(SyntaxKind.TypeReference)) {
				return typeNode.getTypeName().getText();
			}
		}

		const alias = type.getAliasSymbol()?.getName() ?? type.getSymbol()?.getName();
		return alias !== "__type" ? alias : undefined;
	}

	/**
	 * Gets the alias for the specified type.
	 * @param type The type.
	 * @param parent The parent node.
	 * @returns The alias of the type; otherwise an error is thrown.
	 */
	public getAliasOrThrow(type: Type, parent?: Node): string {
		const alias = this.getAlias(type, parent);
		if (!alias) {
			throw new Error("Unable to determine alias");
		}

		return alias;
	}

	/**
	 * Gets the JSDocs for the specified value.
	 * @param value The value.
	 * @returns The JSDocs; otherwise undefined.
	 */
	public getJSDocs(value: Node | Symbol | Type): JSDoc | undefined {
		let node: Node | undefined;
		if (value instanceof Node) {
			node = value;
		} else {
			const symbol = value instanceof Symbol ? value : value.getAliasSymbol() || value.getSymbol();
			node = symbol?.getDeclarations().at(0) || undefined;
		}

		if (node && Node.isJSDocable(node)) {
			return node.getJsDocs().at(0);
		}
	}

	/**
	 * Gets the structure for the specified type.
	 * @param typeOrNode The type or original node.
	 * @param parent The parent node.
	 * @returns The structure that represents the type
	 */
	public getStructure<T extends Structure = Structure>(typeOrNode: ts.Node | Type, parent?: Node): T {
		// When the parameter is a node, continue with the type.
		if (!(typeOrNode instanceof Type)) {
			const node = createWrappedNode(typeOrNode, {
				typeChecker: this.typeChecker.compilerObject,
			});

			return this.getStructure<T>(node.getType(), node);
		}

		// When the type is not identified, simply create it's structure.
		if (!("id" in typeOrNode.compilerType)) {
			return this.#createStructure(typeOrNode, parent) as T;
		}

		const { id } = typeOrNode.compilerType;

		// Otherwise, only create new structures, guarding against circular dependencies.
		let structure = this.#cache.get(id);
		if (structure === undefined) {
			this.#cache.set(id, (structure = this.#createStructure(typeOrNode, parent)));
		}

		return structure as T;
	}

	/**
	 * Creates a structure from the specified type.
	 * @param type The type.
	 * @param parent The parent node the type is associated with.
	 * @returns The structure that represents the type.
	 */
	#createStructure(type: Type, parent?: Node): Structure {
		// Primitives, for example `string`, `number`, etc.
		if (PrimitiveStructure.isPrimitive(type)) {
			return new PrimitiveStructure(this.#createContext(type));
		}

		// Enums.
		if (type.isEnum()) {
			return new EnumStructure(this.#createContext(type));
		}

		// Arrays, for example `string[]`.
		if (type.isArray()) {
			return new ArrayStructure(this.#createContext(type));
		}

		// Tuples, for example `[string, number]`.
		if (type.isTuple()) {
			return new TupleStructure(this.#createContext(type));
		}

		// Promises, for example `Promise<string>`, `Promise<object>`, etc.
		if (PromiseStructure.isPromise(type)) {
			return new PromiseStructure(this.#createContext(type));
		}

		// Function signatures.
		if (SignatureStructure.isFunction(type)) {
			return new SignatureStructure(type.getCallSignatures().at(0)!, this);
		}

		// Objects, for example `{ name: string }`.
		// Intersection types, for example `{ foo: string; } & { bar: string }`.
		if (type.isObject() || type.isIntersection()) {
			return new ObjectStructure(this.#createContext(type), parent);
		}

		// Union types, for example `string | number`.
		if (type.isUnion()) {
			return new UnionStructure(this.#createContext(type));
		}

		// Type parameters, for example `T` in `Foo<T>`.
		if (type.isTypeParameter()) {
			return new TypeParameterStructure(this.#createContext(type));
		}

		throw new Error("Unsupported type");
	}

	/**
	 * Creates a context for the specified type.
	 * @param type Type.
	 * @returns The context.
	 */
	#createContext<T>(type: T): StructureContext<T> {
		return { type, structureBuilder: this };
	}
}

/**
 * Context of a structure.
 */
export type StructureContext<TType = Type> = {
	/**
	 * Structure builder responsible for building structures, JSDocs, aliases, etc.
	 */
	structureBuilder: StructureBuilder;

	/**
	 * Type that represents the structure.
	 */
	type: TType;
};
