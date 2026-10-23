import { format } from "oxfmt";

import { SerializationContext, type SerializationOptions } from "../serialization.js";
import {
	EnumStructure,
	MethodStructure,
	ObjectStructure,
	PrimitiveStructure,
	PropertyStructure,
	SignatureStructure,
	UnionStructure,
} from "./index.js";

/**
 * A structure that represents a type or symbol.
 */
export abstract class Structure {
	/**
	 * Serializes the structure to a raw string.
	 * @param ctx Context of the serialization, including how it should be serialized.
	 * @returns Structure as a string.
	 */
	public abstract serialize(ctx: SerializationContext): string;

	/**
	 * Determines whether this structure is aliased.
	 * @returns `true` when this structure is aliased; otherwise `false`.
	 */
	public isAliased(): this is Aliased<typeof this> {
		return "alias" in this && this.alias !== undefined && typeof this.alias === "string";
	}

	/**
	 * Determines whether this structure represents an enum.
	 * @returns `true` when this structure represents an enum; otherwise `false`.
	 */
	public isEnum(): this is EnumStructure {
		return this instanceof EnumStructure;
	}

	/**
	 * Determines whether this structure represents a method.
	 * @returns `true` when this structure represents a method; otherwise `false`.
	 */
	public isMethod(): this is MethodStructure {
		return this instanceof MethodStructure;
	}

	/**
	 * Determines whether this structure represents an object.
	 * @returns `true` when this structure represents an object; otherwise `false`.
	 */
	public isObject(): this is ObjectStructure {
		return this instanceof ObjectStructure;
	}

	/**
	 * Determines whether this structure represents a primitive type.
	 * @returns `true` when this structure represents a primitive type; otherwise `false`.
	 */
	public isPrimitive(): this is PrimitiveStructure {
		return this instanceof PrimitiveStructure;
	}

	/**
	 * Determines whether this structure represents a property.
	 * @returns `true` when this structure represents a property; otherwise `false`.
	 */
	public isProperty(): this is PropertyStructure {
		return this instanceof PropertyStructure;
	}

	/**
	 * Determines whether this structure represents a signature type.
	 * @returns `true` when this structure represents a signature type; otherwise `false`.
	 */
	public isSignature(): this is SignatureStructure {
		return this instanceof SignatureStructure;
	}

	/**
	 * Determines whether this structure represents a union type.
	 * @returns `true` when this structure represents a union type; otherwise `false`.
	 */
	public isUnion(): this is UnionStructure {
		return this instanceof UnionStructure;
	}

	/**
	 * Gets a prettified string that represents the structure.
	 * @param opts Serialization options.
	 * @returns Prettified representation of the structure.
	 */
	public async stringify(opts?: SerializationOptions): Promise<string> {
		const alias = this.isAliased() ? this.alias : undefined;
		let type = this.serialize(new SerializationContext({ ...opts, alias }));

		// Prefix the type with an alias if available.
		if (alias) {
			if (this.isEnum()) {
				type = `enum ${alias} = ${type}`;
			} else if (this.isObject() && this.isClass) {
				type = `class ${alias} ${type}`;
			} else {
				type = `type ${alias} = ${type}`;
			}
		}

		// Determine whether to prettify the type.
		if (opts?.rawOutput) {
			return type;
		}

		// Prettify the type.
		const { code, errors } = await format("declaration.ts", type, {
			endOfLine: "lf",
			printWidth: 120,
			useTabs: true,
		});

		if (errors.length > 0) {
			throw new Error(`Failed to format type: ${errors.map((e) => e.message).join(", ")}`);
		}

		// Trim trailing line.
		return code.replace(/\n$/, "");
	}
}

/**
 * An aliased structure.
 */
export type Aliased<T extends Structure> = T & {
	/**
	 * Alias of the structure.
	 */
	readonly alias: string;
};
