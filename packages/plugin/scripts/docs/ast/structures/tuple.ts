import type { Type } from "ts-morph";
import { ts } from "ts-morph";

import type { SerializationContext } from "../serialization.js";
import type { StructureBuilder, StructureContext } from "./builder.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents a tuple.
 */
export class TupleStructure extends Structure {
	/**
	 * Alias of the structure.
	 */
	public readonly alias: string | undefined;

	/**
	 * Context that defines the structure.
	 */
	#context: StructureContext<Type<ts.TupleType>>;

	/**
	 * Private backing field for the elements.
	 */
	#elements: TupleStructure["elements"] | undefined;

	/**
	 * Initializes a new instance of the {@link TupleStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext<Type<ts.TupleType>>) {
		super();

		this.#context = context;
		this.alias = context.structureBuilder.getAlias(context.type);
	}

	/**
	 * Elements within the tuple, represented as a structure.
	 */
	public get elements(): TupleMemberStructure[] {
		return (this.#elements ??= this.getElements());
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		return `[${this.elements
			.map((element) => {
				const type = element.type.isUnion() ? `(${ctx.serializeRef(element.type)})` : ctx.serializeRef(element.type);
				const { name, optional } = element;

				if (name) {
					if (optional) {
						return `${name}?: ${type}`; // [name?: string]
					} else {
						return `${name}: ${type}`; // [name: string]
					}
				}

				if (optional) {
					return `${type}?`; // [string?]
				}

				return type; // [string]
			})
			.join(", ")}]`;
	}

	/**
	 * Gets the elements structures of the tuple, from the tuple's target type.
	 * @returns The element structures.
	 */
	private getElements(): TupleMemberStructure[] {
		// Tuple types are references to their target, which defines the element names and flags.
		const { target } = this.#context.type.compilerType as unknown as ts.TupleTypeReference;

		return this.#context.type.getTupleElements().map((element, i) => {
			const declaration = target.labeledElementDeclarations?.[i];
			const name = declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : undefined;
			const optional = ((target.elementFlags[i] ?? 0) & ts.ElementFlags.Optional) !== 0;

			return new TupleMemberStructure(name, optional, element, this.#context.structureBuilder);
		});
	}
}

/**
 * Structure that represents a member of a tuple.
 */
class TupleMemberStructure extends Structure {
	/**
	 * Private backing field for the type.
	 */
	#type: Structure | undefined;

	/**
	 * Initializes a new instance of the {@link TupleMemberStructure} class.
	 * @param name Name of the tuple member, when labeled.
	 * @param optional Determines whether the tuple member is optional.
	 * @param elementType Type of the tuple member.
	 * @param structureBuilder Structure builder responsible for building this structure, and it's descendants.
	 */
	constructor(
		public readonly name: string | undefined,
		public readonly optional: boolean,
		private readonly elementType: Type,
		private readonly structureBuilder: StructureBuilder,
	) {
		super();
	}

	/**
	 * Type of the tuple member.
	 */
	public get type(): Structure {
		return (this.#type ??= this.structureBuilder.getStructure(this.elementType));
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		return ctx.serializeRef(this.type);
	}
}

export { type TupleMemberStructure };
