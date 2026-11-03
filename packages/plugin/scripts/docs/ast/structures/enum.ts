import type { SerializationContext } from "../serialization.js";
import type { StructureContext } from "./builder.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents an enum.
 */
export class EnumStructure extends Structure {
	/**
	 * Alias of the structure.
	 */
	public readonly alias: string;

	/**
	 * JSDoc description.
	 */
	public readonly description: string | undefined;

	/**
	 * Members of the enumeration.
	 */
	public readonly members: EnumMemberStructure[];

	/**
	 * Initializes a new instance of the {@link EnumStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext) {
		super();

		const { type, structureBuilder } = context;

		if (!type.isEnum()) {
			throw new Error("Type is not an enum");
		}

		this.alias = context.structureBuilder.getAliasOrThrow(context.type);
		this.description = structureBuilder.getJSDocs(type)?.getDescription();
		this.members = type.getUnionTypes().map((member) => {
			return new EnumMemberStructure({ type: member, structureBuilder });
		});
	}

	/**
	 * @inheritdoc
	 */
	public serialize(): string {
		return this.alias;
	}
}

/**
 * Structure that represents an enum member.
 */
class EnumMemberStructure extends Structure {
	/**
	 * JSDoc description.
	 */
	public readonly description?: string;

	/**
	 * Name of the enum member.
	 */
	public readonly name: string;

	/**
	 * Type of the enum member.
	 */
	public readonly type: Structure;

	/**
	 * Initializes a new instance of the {@link EnumMemberStructure} class.
	 * @param context Context that defines the structure.
	 */
	constructor(context: StructureContext) {
		super();

		const { type, structureBuilder } = context;

		this.description = structureBuilder.getJSDocs(type)?.getDescription();
		this.name = type.compilerType.symbol.escapedName.toString();
		this.type = structureBuilder.getStructure(type);
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		return ctx.serializeRef(this.type);
	}
}

export { type EnumMemberStructure };
