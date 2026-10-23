import type { SerializationContext } from "../serialization.js";
import type { StructureContext } from "./builder.js";
import { ObjectStructure, PrimitiveStructure, TupleStructure, UnionStructure } from "./index.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents an array.
 */
export class ArrayStructure extends Structure {
	/**
	 * Alias of the structure.
	 */
	public readonly alias: string | undefined;

	/**
	 * Context that defines the structure.
	 */
	#context: StructureContext;

	/**
	 * Private backing field for the element type.
	 */
	#elementType: ArrayStructure["elementType"] | undefined;

	/**
	 * Initializes a new instance of the {@link ArrayStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext) {
		super();
		this.#context = context;
	}

	/**
	 * Type of the elements within the array.
	 * @returns Element type.
	 */
	public get elementType(): ArrayStructure | ObjectStructure | PrimitiveStructure | TupleStructure | UnionStructure {
		return (this.#elementType ??= this.#context.structureBuilder.getStructure<ArrayStructure["elementType"]>(
			this.#context.type.getArrayElementTypeOrThrow(),
		));
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		if (this.elementType.isUnion()) {
			return `(${ctx.serializeRef(this.elementType)})[]`;
		}

		return `${ctx.serializeRef(this.elementType)}[]`;
	}
}
