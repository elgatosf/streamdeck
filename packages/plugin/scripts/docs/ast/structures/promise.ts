import type { Type } from "ts-morph";

import type { SerializationContext } from "../serialization.js";
import type { StructureContext } from "./builder.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents a promise.
 */
export class PromiseStructure extends Structure {
	/**
	 * Context that defines the structure of the type parameter, for example `T` in `Promise<T>`.
	 */
	#context: StructureContext;

	/**
	 * Private backing field for the {@link type}.
	 */
	#type: Structure | undefined;

	/**
	 * Initializes a new instance of the {@link PromiseStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext) {
		super();

		const { type, structureBuilder } = context;

		const [resultType] = type.getTypeArguments();
		if (!resultType) {
			throw new Error("Promise return type is not defined");
		}

		this.#context = {
			type: resultType,
			structureBuilder,
		};
	}

	/**
	 * Return type of the promise.
	 */
	public get type(): Structure {
		return (this.#type ??= this.#context.structureBuilder.getStructure(this.#context.type));
	}

	/**
	 * Determines whether the specified type is a promise.
	 * @param type The type.
	 * @returns `true` when the type is a promise; otherwise `false`.
	 */
	public static isPromise(type: Type): boolean {
		if (!type.isObject()) {
			return false;
		}

		const symbol = type.getSymbol();
		if (!symbol) {
			return false;
		}

		const args = type.getTypeArguments();
		return symbol.getName() === "Promise" && args.length === 1;
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		return `Promise<${ctx.serializeRef(this.type)}>`;
	}
}
