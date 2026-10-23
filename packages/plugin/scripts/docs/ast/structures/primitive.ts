import { Type } from "ts-morph";

import type { StructureContext } from "./builder.js";
import { Structure } from "./structure.js";

/**
 * Represents a primitive type, for example a string, number, etc.
 */
export class PrimitiveStructure extends Structure {
	/**
	 * String representation of the primitive type.
	 */
	public readonly type: string;

	/**
	 * Initializes a new instance of the {@link PrimitiveStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext) {
		super();

		const { type, structureBuilder } = context;

		const value = type.getLiteralValue();
		if (value === undefined || typeof value === "string" || value instanceof String) {
			this.type = type.getText(structureBuilder.node);
		} else {
			this.type = value?.toString();
		}
	}

	/**
	 * Determines whether the specified type is primitive.
	 * @param type The type.
	 * @returns `true` when the type is a primitive; otherwise `false`.
	 */
	public static isPrimitive(type: Type): boolean {
		const intrinsicName = (): string =>
			(
				type.compilerType as unknown as {
					/**
					 *
					 */
					intrinsicName: string;
				}
			).intrinsicName;

		return (
			type.isString() ||
			type.isStringLiteral() ||
			type.isTemplateLiteral() ||
			type.isUndefined() ||
			type.isNull() ||
			type.isUnknown() ||
			type.isAny() ||
			type.isNumber() ||
			type.isNumberLiteral() ||
			type.isBoolean() ||
			type.isBooleanLiteral() ||
			intrinsicName() === "object" ||
			intrinsicName() === "void"
		);
	}

	/**
	 * @inheritdoc
	 */
	public serialize(): string {
		return this.type;
	}
}
