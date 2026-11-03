import type { Type } from "ts-morph";
import { ts } from "ts-morph";

import type { SerializationContext } from "../serialization.js";
import { ArrayStructure } from "./array.js";
import type { StructureContext } from "./builder.js";
import type { ObjectStructure } from "./object.js";
import type { PrimitiveStructure } from "./primitive.js";
import { Structure } from "./structure.js";
import type { TupleStructure } from "./tuple.js";

/**
 * Structure that represents a union of types.
 */
export class UnionStructure extends Structure {
	/**
	 * Alias of the structure.
	 */
	public readonly alias: string | undefined;

	/**
	 * JSDoc description.
	 */
	public readonly description: string | undefined;

	/**
	 * Context that defines the structure.
	 */
	#context: StructureContext<Type<ts.UnionType>>;

	/**
	 * Private backing field for the types.
	 */
	#types: UnionStructure["types"] | undefined;

	/**
	 * Initializes a new instance of the {@link UnionStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext<Type<ts.UnionType>>) {
		super();

		this.#context = context;

		this.alias = context.structureBuilder.getAlias(context.type);
		this.description = context.structureBuilder.getJSDocs(context.type)?.getDescription();
	}

	/**
	 * Types that make up the union, represented as structures.
	 * @returns Array of types.
	 */
	public get types(): (ArrayStructure | ObjectStructure | PrimitiveStructure | TupleStructure)[] {
		return (this.#types ??= this.#context.type
			.getUnionTypes()
			.map((type) => this.#context.structureBuilder.getStructure(type)));
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		if (this.alias && ctx.preferAlias(this)) {
			return this.alias;
		}

		return this.types.map((type) => ctx.serializeRef(type)).join(ctx.unionSeparator);
	}
}
