import { type JSDoc, Node, type Signature, type Symbol, SymbolFlags, type Type } from "ts-morph";
import { ts } from "ts-morph";

import type { SerializationContext } from "../index.js";
import type { StructureBuilder } from "./builder.js";
import { Structure } from "./structure.js";

/**
 * Structure that represents a function signature.
 */
export class SignatureStructure extends Structure {
	/**
	 * JSDoc description.
	 */
	public readonly description: string | undefined;

	/**
	 * Determines whether the signature represents a function type. An example of a function type is
	 * `fn: () => void`, versus a method structure which is `fn(): void`.
	 */
	public readonly isFunctionType: boolean;

	/**
	 * The JSDocs information for the signature.
	 */
	readonly #docs: JSDoc | undefined;

	/**
	 * Private backing field for the parameters
	 */
	#parameters?: ParameterStructure[];

	/**
	 * Private backing field for the return type
	 */
	#returnType: ReturnTypeInfo | undefined;

	/**
	 * Underlying signature.
	 */
	readonly #signature: Signature;

	/**
	 * Structure builder responsible for building this structure, and it's descendants.
	 */
	readonly #structureBuilder: StructureBuilder;

	/**
	 * Initializes a new instance of the {@link SignatureStructure} class.
	 * @param signature Signature of the structure.
	 * @param structureBuilder Structure builder responsible for building this structure, and it's descendants.
	 */
	constructor(signature: Signature, structureBuilder: StructureBuilder) {
		super();

		this.#signature = signature;
		this.#structureBuilder = structureBuilder;

		const declaration = signature.getDeclaration();
		this.isFunctionType = Node.isFunctionTypeNode(declaration);

		this.#docs = this.isFunctionType
			? structureBuilder.getJSDocs(declaration.getType())
			: structureBuilder.getJSDocs(declaration);

		this.description = this.#docs?.getDescription();
	}

	/**
	 * Parameters within the function signature.
	 * @returns The parameters.
	 */
	public get parameters(): ParameterStructure[] {
		if (!this.#parameters) {
			const docs = this.getParameterJSDocs();
			this.#parameters = this.#signature.getParameters().map((p, i) => {
				// const structure = this.#structureBuilder.getStructure(p.getDeclarations().at(0)?.getType()!);

				const structure = this.#structureBuilder.getStructure(p.compilerSymbol.valueDeclaration!);
				return new ParameterStructure(p, structure, docs.at(i));
			});
		}

		return this.#parameters;
	}

	/**
	 * Return type of the signature.
	 */
	public get returnType(): ReturnTypeInfo {
		if (this.#returnType === undefined) {
			const docs = this.#docs?.getTags()?.find((t) => Node.isJSDocReturnTag(t));
			return {
				description: docs?.getCommentText(),
				type: this.#structureBuilder.getStructure(this.#signature.getReturnType()),
			};
		}

		return this.#returnType;
	}

	/**
	 * Determines whether the specified type is considered a function, and has a single signature.
	 * @param type The type to check.
	 * @returns `true` when the type is a function signature; otherwise `false`.
	 */
	public static isFunction(type: Type<ts.Type>): boolean {
		return (
			type.isObject() &&
			type.getCallSignatures().length === 1 &&
			type.getProperties().length === 0 &&
			type.getNumberIndexType() === undefined &&
			type.getStringIndexType() === undefined
		);
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		ctx = ctx.clone({
			expandTypeParameterDefaults: false,
			preferAlias: () => true,
		});

		const typeParams = this.#signature.getTypeParameters();
		const returnKeyword = this.isFunctionType ? " => " : ": ";

		const signature = `(${this.parameters.map((p) => p.serialize(ctx)).join(", ")})${returnKeyword}${ctx.serializeRef(this.returnType.type)}`;

		// Check for type parameter, for example `<T extends JsonObject>(value: T): void`.
		if (typeParams.length > 0) {
			return `<${typeParams
				.map((t) => {
					const constraint = t.getConstraint();
					if (constraint) {
						return `${t.getText()} extends ${ctx.serializeRef(this.#structureBuilder.getStructure(constraint))}`;
					}

					return t.getText();
				})
				.join(", ")}>${signature}`;
		}

		// Otherwise return the basic signature.
		return signature;
	}

	/**
	 * Gets the JSDocs for the parameters of this signature.
	 * @returns An array of JSDocs that represent the parameters.
	 */
	private getParameterJSDocs(): (string | undefined)[] {
		return (
			this.#docs?.getTags().reduce(
				(tags, tag) => {
					// We only care about @param
					if (!Node.isJSDocParameterTag(tag)) {
						return tags;
					}

					// Determine whether the JSDoc references a destructure, for example `param0.name`.
					// If it does, ignore it, and continue looking for the next param docs.
					const name = tag.getName();
					if (name.includes(".")) {
						return tags;
					}

					// Add the tag
					tags.push(tag.getCommentText());
					return tags;
				},
				[] as (string | undefined)[],
			) ?? []
		);
	}
}

/**
 * Structure that represents a parameter within a function signature.
 */
export class ParameterStructure extends Structure {
	/**
	 * Determines whether the parameter has a DotDotDotToken, for example `...args: string[]`.
	 */
	public readonly dotDotDot: boolean = false;

	/**
	 * Name of the parameter; this may also be the destructured representation, for example `{ name }: Person`, would have a name of `{ name }`.
	 */
	public readonly name: string;

	/**
	 * Indicates whether the member is optional.
	 */
	public readonly optional: boolean;

	/**
	 * Initializes a new instance of the {@link ParameterStructure} class.
	 * @param symbol Symbol of the structure.
	 * @param type Type of the structure.
	 * @param description JSDoc description.
	 */
	constructor(
		symbol: Symbol,
		public readonly type: Structure,
		public readonly description: string | undefined,
	) {
		super();

		const node = symbol.compilerSymbol.declarations?.at(0);
		if (node && ts.isParameter(node)) {
			this.name = node.name.getText();
			this.dotDotDot = node.dotDotDotToken !== undefined;
			this.optional = node.questionToken !== undefined;
		} else {
			this.name = symbol.getName();
			this.optional = symbol.hasFlags(SymbolFlags.Optional);
		}
	}

	/**
	 * @inheritdoc
	 */
	public serialize(ctx: SerializationContext): string {
		const when = (check: boolean, value: string): string => (check ? value : "");

		const type = ctx.clone({ preferAlias: () => true }).serializeRef(this.type);
		return `${when(this.dotDotDot, "...")}${this.name}${when(this.optional, "?")}: ${type}`;
	}
}

/**
 * Information about a return structure.
 */
export type ReturnTypeInfo = {
	/**
	 * JSDoc description of the return value.
	 */
	description: string | undefined;

	/**
	 * The return type.
	 */
	type: Structure;
};
