import { DisposableStack } from "../utils/disposable.js";
import type { Aliased, ObjectStructure, Structure, UnionStructure } from "./structures/index.js";

/**
 * Provides context to the serialization of a structure.
 */
export class SerializationContext {
	/**
	 * Stack of aliases to prevent circular references.
	 */
	public readonly aliasStack = new AliasStack();

	/**
	 * Initializes a new instance of the {@link SerializationContext} class.
	 * @param options Serialization options.
	 */
	constructor(private readonly options?: SerializationOptions) {
		if (this.options?.alias) {
			this.aliasStack.push(this.options.alias);
		}
	}

	/**
	 * Determines whether type parameters should be represented by their default type.
	 */
	public get expandTypeParameterDefaults(): boolean {
		return this.options?.expandTypeParameterDefaults ?? true;
	}

	/**
	 * Preferred separator to use when joining unions.
	 */
	public get unionSeparator(): string {
		return this.options?.unionSeparator ?? " | ";
	}

	/**
	 * Clones the serialization context, applying the new options.
	 * @param options The new options.
	 * @returns The cloned context.
	 */
	public clone(options?: SerializationOptions): SerializationContext {
		return new SerializationContext({
			...this.options,
			...options,
		});
	}

	/**
	 * Determines whether the structure should be represented by its alias, or full type.
	 * @param structure The structure.
	 * @returns `true` indicates to use the alias; otherwise `false` to use the full type.
	 */
	public preferAlias(structure: ObjectStructure | UnionStructure): boolean {
		if (!structure.isAliased()) {
			return false;
		}

		if (structure.alias && this.aliasStack.isCircularRef(structure.alias)) {
			return true;
		}

		if (this.options?.preferAlias) {
			return this.options.preferAlias(structure);
		}

		return false;
	}

	/**
	 * Serializes the given structure.
	 * @param structure Structure.
	 * @returns Serialized representation of the structure.
	 */
	public serializeRef(structure: Structure): string {
		const cleanup = new DisposableStack();

		try {
			if (structure.isAliased()) {
				this.aliasStack.push(structure.alias);
				cleanup.defer(() => this.aliasStack.pop(structure.alias));
			}

			if (this.options?.serialize) {
				return this.options.serialize(this, structure);
			}

			return structure.serialize(this);
		} finally {
			cleanup.dispose(); // Explicitly call dispose as Docusaurus babel config customization is broken.
		}
	}
}

/**
 * Stack that tracks serialized aliases, preventing a stack overflow error for circular references.
 */
class AliasStack {
	/**
	 * The stack of aliases, and their counts.
	 */
	#stack = new Map<string, number>();

	/**
	 * Determines whether the specified alias has already been referenced in the serialization stack.
	 * @param alias Alias to check.
	 * @returns `true` when the alias has already been referenced in the serialization stack; otherwise `false`
	 */
	public isCircularRef(alias: string): boolean {
		const count = this.#stack.get(alias) || 0;
		return count > 1;
	}

	/**
	 * Removes the alias from the serialization stack.
	 * @param alias Alias to remove.
	 */
	public pop(alias: string): void {
		const count = this.#stack.get(alias) || 1;
		this.#stack.set(alias, count - 1);
	}

	/**
	 * Adds the alias to the serialization stack.
	 * @param alias Alias to add.
	 */
	public push(alias: string): void {
		const count = this.#stack.get(alias) || 0;
		this.#stack.set(alias, count + 1);
	}
}

/**
 * Serialization options that determine how a structure should be serialized.
 */
export type SerializationOptions = {
	/**
	 * The alias of the structure being serialized.
	 */
	alias?: string | undefined;

	/**
	 * Determines whether type parameters should be represented by their default type.
	 */
	expandTypeParameterDefaults?: boolean;

	/**
	 * Determines whether the structure should be represented by its alias, or full type.
	 * @param structure The structure.
	 * @returns `true` indicates to use the alias; otherwise `false` to use the full type.
	 */
	preferAlias?(structure: Aliased<ObjectStructure | UnionStructure>): boolean;

	/**
	 * Determines whether to output the raw type; when `false`, the result will be prettified first.
	 */
	rawOutput?: boolean;

	/**
	 * Serializes the given structure.
	 * @param context The serialization context.
	 * @param structure Structure to serialize.
	 * @returns The serialized representation of the structure.
	 */
	serialize?(context: SerializationContext, structure: Structure): string;

	/**
	 * Preferred separator to use when joining unions.
	 */
	unionSeparator?: string;
};

/**
 * Serialization options that prefers short form types, for example `object`, `string`, or the alias.
 */
export const shortFormOptions: SerializationOptions = {
	serialize: (ctx, structure) => {
		if (!structure.isObject()) {
			return structure.serialize(ctx);
		}

		if (structure.isAliased()) {
			return structure.alias;
		}

		return "object";
	},
};
