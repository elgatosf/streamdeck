import {
	GetAccessorDeclaration,
	MethodDeclaration,
	MethodSignature,
	Node,
	PropertyDeclaration,
	PropertySignature,
	Symbol,
	SymbolFlags,
	SyntaxKind,
	type Type,
} from "ts-morph";
import { ts } from "ts-morph";

import type { SerializationContext } from "../serialization.js";
import type { StructureBuilder, StructureContext } from "./builder.js";
import { SignatureStructure } from "./signature.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents an object.
 */
export class ObjectStructure extends Structure {
	/**
	 * Alias of the structure.
	 */
	public readonly alias: string | undefined;

	/**
	 * JSDoc description.
	 */
	public readonly description: string | undefined;

	/**
	 * Indexer associated with the object.
	 */
	public readonly index: IndexStructure | undefined;

	/**
	 * Determines whether the object structure represents a class.
	 */
	public readonly isClass: boolean;

	/**
	 * Private backing field for the members.
	 */
	#members: (MethodStructure | PropertyStructure)[] | undefined;

	/**
	 * Context that defines the structure
	 */
	#context: StructureContext<Type<ts.IntersectionType> | Type<ts.ObjectType>>;

	/**
	 * Initializes a new instance of the {@link ObjectStructure} class.
	 * @param context Context that defines the structure.
	 * @param parent The parent node.
	 */
	constructor(context: StructureContext<Type<ts.IntersectionType> | Type<ts.ObjectType>>, parent: Node | undefined) {
		super();

		this.#context = context;

		this.alias = context.structureBuilder.getAlias(context.type, parent);
		this.description = context.structureBuilder.getJSDocs(context.type)?.getDescription();
		this.isClass = context.type.isClass();

		// Set the index type (todo: consider support for numbers).
		const indexType = this.#context.type.getStringIndexType();
		if (indexType) {
			this.index = new IndexStructure(
				{
					structureBuilder: this.#context.structureBuilder,
					type: indexType,
				},
				this.#context.type,
			);
		}

		/*
		 * todo: functions.
		 *
		 * const functions = type.getCallSignatures().map((sig) => this.formatSignature(sig, "declaration", next));
		 * const numberIndexType = type.getNumberIndexType());
		 * stringIndexType = type.getStringIndexType();
		 */
	}

	/**
	 * Members that make up the object.
	 * @returns Array of members.
	 */
	public get members(): (MethodStructure | PropertyStructure)[] {
		return (this.#members ??= this.#context.type.isIntersection()
			? Array.from(this.getMembersFromIntersectionTypes())
			: this.getMembers());
	}

	/**
	 * Methods within the object.
	 * Array of methods.
	 */
	public get methods(): MethodStructure[] {
		return this.members.filter((m) => m instanceof MethodStructure) as MethodStructure[];
	}

	/**
	 * Properties within the object.
	 * @returns Array of properties.
	 */
	public get properties(): PropertyStructure[] {
		return this.members.filter((m) => m instanceof PropertyStructure) as PropertyStructure[];
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		if (this.alias && ctx.preferAlias(this)) {
			return this.alias;
		}

		// Gets the name, with the optional marker.
		const getName = (name: string, optional: boolean): string => {
			const escapedName = name.includes("-") ? `"${name}"` : name;
			return optional ? escapedName + "?" : escapedName;
		};

		// Properties of the object.
		const props = `${this.properties
			.sort((a, b) => a.name.localeCompare(b.name, "en"))
			.map(({ name, optional, type }: PropertyStructure) => {
				return `${getName(name, optional)}: ${ctx.serializeRef(type)}`;
			})
			.join(";\n")}`;

		// Methods of the object.
		const methods = this.methods
			.sort((a, b) => a.name.localeCompare(b.name, "en"))
			.flatMap(({ name, optional, signatures }) => {
				return signatures.map((signature) => {
					return `${getName(name, optional)}${signature.serialize(ctx)}`;
				});
			})
			.join(";\n");

		const format = (propsOrMethods: string): string => (propsOrMethods ? `${propsOrMethods};\n` : propsOrMethods);
		return `{\n${this.index?.serialize(ctx) ?? ""}${format(props)}${format(methods)}}`;
	}

	/**
	 * Gets the members that make up the object.
	 * @returns The structures of each member.
	 */
	private getMembers(): (MethodStructure | PropertyStructure)[] {
		return this.#context.type.getProperties().map((property) => {
			const [node] = property.getDeclarations();

			// Methods.
			if (node instanceof MethodDeclaration || node instanceof MethodSignature) {
				return new MethodStructure(property, this.#context.structureBuilder);
			}

			// Properties.
			if (
				node instanceof PropertyDeclaration ||
				node instanceof PropertySignature ||
				node instanceof GetAccessorDeclaration
			) {
				return new PropertyStructure(node, property, this.#context.structureBuilder);
			}

			throw new Error("Unable to determine member type");
		});
	}

	/**
	 * Gets the members that make up the object, from each of the intersection types.
	 * @yields The structures of each member.
	 */
	private *getMembersFromIntersectionTypes(): Iterable<MethodStructure | PropertyStructure> {
		for (const intersectionType of this.#context.type.getIntersectionTypes()) {
			const structure = this.#context.structureBuilder.getStructure(intersectionType);
			if (!(structure instanceof ObjectStructure)) {
				throw new Error("Only intersections made of object types are supported");
			}

			for (const member of structure.members) {
				yield member;
			}
		}
	}
}

/**
 * Provides a structure that represents a string indexer within a type.
 */
class IndexStructure extends Structure {
	/**
	 * Context that defines the structure
	 */
	readonly #context: StructureContext<Type>;

	/**
	 * Identifier name, for example `[hello: string]: string` would be `hello`.
	 */
	readonly #identifier: string | undefined;

	/**
	 * Initializes a new instance of the {@link IndexStructure} class.
	 * @param context Context that defines the structure.
	 * @param parent Parent type that declares the index signature.
	 */
	constructor(context: StructureContext<Type>, parent: Type<ts.IntersectionType | ts.ObjectType>) {
		super();
		this.#context = context;
		this.#identifier = this.#getIdentifier(parent);
	}

	/**
	 * @inheritdoc
	 */
	public override serialize(ctx: SerializationContext): string {
		const structure = this.#context.structureBuilder.getStructure(this.#context.type);
		const identifier = this.#identifier ? `${this.#identifier}: ` : "";

		return `[${identifier}string]: ${ctx.serializeRef(structure)};`;
	}

	/**
	 * Gets the identifier associated with the index.
	 * @param parent Parent symbol.
	 * @returns The identifier; otherwise undefined.
	 */
	#getIdentifier(parent: Type<ts.IntersectionType | ts.ObjectType>): string | undefined {
		const symbol = parent.getSymbol() ?? parent.getAliasSymbol();
		if (symbol === undefined) {
			return;
		}

		for (const declaration of symbol.getDeclarations()) {
			const indexSig = declaration.getDescendants().find((d) => d.getKind() === SyntaxKind.IndexSignature);
			if (indexSig) {
				return indexSig.getLocal("key")?.getName();
			}
		}
	}
}

/**
 * Provides a structure that represents a method within a class or type.
 */
export class MethodStructure extends Structure {
	/**
	 * Name of the method.
	 */
	public readonly name: string;

	/**
	 * Determines whether the method is optional.
	 */
	public readonly optional: boolean;

	/**
	 * Function signature declarations that make up this method.
	 */
	#declarations: (MethodDeclaration | MethodSignature)[];

	/**
	 * Private backing field for the signatures.
	 */
	#signatures: SignatureStructure[] | undefined;

	/**
	 * Structure builder responsible for building this structure, and it's descendants.
	 */
	#structureBuilder: StructureBuilder;

	/**
	 * Initializes a new instance of the {@link MethodStructure} class.
	 * @param symbol Symbol of the structure.
	 * @param structureBuilder Structure builder responsible for building this structure, and it's descendants.
	 */
	constructor(symbol: Symbol, structureBuilder: StructureBuilder) {
		super();

		this.#declarations = symbol
			.getDeclarations()
			.filter((d) => d instanceof MethodDeclaration || d instanceof MethodSignature) as (
			| MethodDeclaration
			| MethodSignature
		)[];

		this.#structureBuilder = structureBuilder;

		this.name = symbol.getName();
		this.optional = symbol.hasFlags(SymbolFlags.Optional);
	}

	/**
	 * Gets the declarations of the method.
	 * @returns The declarations.
	 */
	public get declarations(): (MethodDeclaration | MethodSignature)[] {
		return this.#declarations;
	}

	/**
	 * Gets the signatures that make up this method.
	 * @returns The signatures.
	 */
	public get signatures(): SignatureStructure[] {
		return (this.#signatures ??= this.#declarations.map(
			(d) => new SignatureStructure(d.getSignature(), this.#structureBuilder),
		));
	}

	/**
	 * @inheritdoc
	 */
	public serialize(): string {
		throw new Error("Serializing a method is not supported; prefer serializing the signatures.");
	}
}

/**
 * Structure that represents a property within an object.
 */
export class PropertyStructure extends Structure {
	/**
	 * JSDoc description.
	 */
	public readonly description?: string;

	/**
	 * Name of the property.
	 */
	public readonly name: string;

	/**
	 * Indicates whether the property is optional.
	 */
	public readonly optional: boolean;

	/**
	 * Indicates whether the property is readonly.
	 */
	public readonly readonly: boolean;

	/**
	 * Node of the property.
	 */
	#node: GetAccessorDeclaration | PropertyDeclaration | PropertySignature;

	/**
	 * @param structureBuilder Structure builder responsible for building this structure, and it's descendants.
	 */
	#structureBuilder: StructureBuilder;

	/**
	 * Symbol of the property.
	 */
	#symbol: Symbol;

	/**
	 * Private backing field for the type.
	 */
	#type: Structure | undefined;

	/**
	 * Initializes a new instance of the {@link PropertyStructure} class.
	 * @param node Node of the property.
	 * @param symbol Symbol of the property.
	 * @param structureBuilder Structure builder responsible for building this structure, and it's descendants.
	 */
	constructor(
		node: GetAccessorDeclaration | PropertyDeclaration | PropertySignature,
		symbol: Symbol,
		structureBuilder: StructureBuilder,
	) {
		super();

		this.#node = node;
		this.#structureBuilder = structureBuilder;
		this.#symbol = symbol;

		this.description = structureBuilder.getJSDocs(symbol)?.getDescription();
		this.name = symbol.getName();
		this.optional = symbol.hasFlags(SymbolFlags.Optional);
		this.readonly = Node.isReadonlyable(node) && node.isReadonly();
	}

	/**
	 * Type of the property.
	 */
	public get type(): Structure {
		if (this.#type === undefined) {
			const type = this.#symbol.getTypeAtLocation(this.#structureBuilder.node);
			this.#type = this.#structureBuilder.getStructure(type, this.#node);

			if (this.#type === undefined) {
				throw new Error(`Unable to determine type of property: ${this.name}`);
			}
		}

		return this.#type;
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		return ctx.serializeRef(this.type);
	}
}
