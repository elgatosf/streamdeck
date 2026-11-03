import type { TypeParameter } from "ts-morph";
import { ts } from "ts-morph";

import type { SerializationContext } from "../serialization.js";
import type { StructureContext } from "./builder.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents a type parameter (i.e. a generic parameter), for example `Foo<T, U>`.
 */
export class TypeParameterStructure extends Structure {
	/**
	 * The string value that represents the type parameter.
	 */
	private readonly parameter: string;

	/**
	 * Context that defines the structure of the type parameter.
	 */
	#context: StructureContext;

	/**
	 * Private backing field for the default type.
	 */
	#defaultType: Structure | undefined;

	/**
	 * Initializes a new instance of the {@link TypeParameterStructure}.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext<TypeParameter>) {
		super();

		this.#context = context;
		this.parameter = context.type.getText(context.structureBuilder.node);
	}

	/**
	 * The default type the type parameter is associated with.
	 */
	public get defaultType(): Structure | undefined {
		if (this.#defaultType === undefined) {
			const node = this.#context.type.compilerType.symbol.declarations?.at(0);
			if (node && ts.isTypeParameterDeclaration(node) && node.default) {
				this.#defaultType = this.#context.structureBuilder.getStructure(node.default);
			}
		}

		return this.#defaultType;
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		if (ctx.expandTypeParameterDefaults && this.defaultType) {
			return ctx.serializeRef(this.defaultType);
		} else {
			return this.parameter;
		}
	}
}
