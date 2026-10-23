import {
	type Aliased,
	type EnumStructure,
	type ObjectStructure,
	SerializationContext,
	type Structure,
	type UnionStructure,
} from "../ast/index.js";
import { formatDescription, heading, joinBlocks } from "../markdown.js";

/**
 * A renderable structure.
 */
type RenderableStructure = EnumStructure | ObjectStructure | UnionStructure;

/**
 * A rendered structure, and the alias it was rendered for.
 */
type RenderedStructure = {
	/**
	 * Alias of the structure.
	 */
	alias: string;

	/**
	 * Rendered markdown.
	 */
	content: string;
};

/**
 * Renders the definitions of the structure, and all aliased structures it references, as markdown.
 * @param structure Structure to render.
 * @param firstHeading Depth of the first heading.
 * @returns Markdown definitions of the structure.
 */
export function renderDefinitions(structure: RenderableStructure, firstHeading = 3): string {
	const ctx = new DefinitionsContext(firstHeading);
	const content = renderStructure(structure, ctx);

	const referenced: RenderedStructure[] = [];
	for (const ref of ctx.aliasedStructures) {
		if (ref.alias === structure.alias) {
			continue;
		}

		referenced.push({ alias: ref.alias, content: renderStructure(ref, ctx) });
	}

	return [
		content,
		...referenced.sort(({ alias: a }, { alias: b }) => a.localeCompare(b, "en")).map(({ content }) => content),
	].join("\n\n");
}

/**
 * Recursively renders the structure, and the anonymous types it references.
 * @param structure Structure to render.
 * @param ctx Rendering context.
 * @returns Markdown that details this structure, and its anonymous child types.
 */
function renderStructure(structure: RenderableStructure, ctx: DefinitionsContext): string {
	return ctx.usingBreadcrumb(structure.alias, () => {
		if (isEnumOrObject(structure)) {
			return renderEnumOrObject(structure, ctx);
		}

		return structure.types
			.map((type) => {
				// Ignore inline types.
				if (!isEnumOrObject(type)) {
					return "";
				}

				// Render aliased structures via the context.
				if (type.isAliased()) {
					ctx.addAliasedStructure(type);
					return "";
				}

				return renderEnumOrObject(type, ctx);
			})
			.filter((content) => content !== "")
			.join("\n\n");
	});
}

/**
 * Renders the enum or object structure, and the anonymous types it references.
 * @param structure Structure to render.
 * @param ctx Rendering context.
 * @returns Markdown that details this structure, and its anonymous child types.
 */
function renderEnumOrObject(structure: EnumStructure | ObjectStructure, ctx: DefinitionsContext): string {
	const members = structure.members.map((member) => {
		if (member.isMethod()) {
			throw new Error("Methods are not currently supported");
		}

		let typeDetails: string | undefined;
		const serializationCtx = createSerializationContext((ref) => {
			if (ref.isAliased()) {
				ctx.addAliasedStructure(ref);
			} else {
				ctx.usingBreadcrumb(member.name, () => {
					ctx.usingDepth(() => (typeDetails = renderStructure(ref, ctx)));
				});
			}
		});

		const typeSummary = member.serialize(serializationCtx);
		const requirement = structure.isEnum()
			? ""
			: member.isProperty() && member.optional
				? " (optional)"
				: " (required)";
		const typeLabel = structure.isEnum() ? "Value" : "Type";

		return joinBlocks(
			heading(ctx.depth + 1, member.name, ctx.createAnchorId(member.name)),
			`${typeLabel}: ${typeSummary}${requirement}`,
			formatDescription(member.description),
			typeDetails,
		);
	});

	return joinBlocks(
		structure.alias ? heading(ctx.depth, structure.alias) : undefined,
		formatDescription(structure.description),
		`**${structure.isEnum() ? "Enumeration Members" : "Properties"}**`,
		...members,
	);
}

/**
 * Creates a serialization context that provides short form types for child elements.
 * @param renderRef Function responsible for rendering a referenced type.
 * @returns The serialization context.
 */
function createSerializationContext(renderRef: (structure: RenderableStructure) => void): SerializationContext {
	return new SerializationContext({
		serialize: (ctx, structure): string => {
			if (structure.isEnum() || structure.isObject() || structure.isUnion()) {
				renderRef(structure);
			}

			if (structure.isObject()) {
				return structure.alias ? linkTo(structure.alias) : "`object`";
			}

			if (structure.isEnum()) {
				return linkTo(structure.alias);
			}

			if (structure.isPrimitive()) {
				return `\`${structure.type}\``;
			}

			return structure.serialize(ctx);
		},
		preferAlias: () => false,
		unionSeparator: ", ",
	});
}

/**
 * Creates a markdown link to the definition of the alias.
 * @param alias Alias to link to.
 * @returns The link.
 */
function linkTo(alias: string): string {
	return `[${alias}](#${alias.toLowerCase()})`;
}

/**
 * Determines whether the specified structure is an {@link EnumStructure} or {@link ObjectStructure}.
 * @param structure The structure.
 * @returns `true` when the structure is an {@link EnumStructure} or {@link ObjectStructure}; otherwise `false`.
 */
function isEnumOrObject(structure: Structure): structure is EnumStructure | ObjectStructure {
	return structure.isEnum() || structure.isObject();
}

/**
 * Provides context for rendering definitions, tracking heading depth, anchors, and referenced aliases.
 */
class DefinitionsContext {
	/**
	 * Current heading depth.
	 */
	public depth: number;

	/**
	 * Set of aliased structures referenced in this rendering.
	 */
	readonly #aliasedStructures = new Set<Aliased<RenderableStructure>>();

	/**
	 * Trail of breadcrumbs, used to create unique anchors.
	 */
	readonly #breadcrumbs: string[] = [];

	/**
	 * Initializes a new instance of the {@link DefinitionsContext} class.
	 * @param firstHeading Depth of the first heading.
	 */
	constructor(firstHeading: number) {
		this.depth = firstHeading;
	}

	/**
	 * Gets all aliased structures referenced in this rendering.
	 * @returns The aliased structures.
	 */
	public get aliasedStructures(): IterableIterator<Aliased<RenderableStructure>> {
		return this.#aliasedStructures.values();
	}

	/**
	 * Adds an aliased structure to this instance.
	 * @param structure Structure to add.
	 */
	public addAliasedStructure(structure: Aliased<RenderableStructure>): void {
		this.#aliasedStructures.add(structure);
	}

	/**
	 * Creates an anchor identifier for the given name, prefixed with the breadcrumbs.
	 * @param name Name of the anchor.
	 * @returns The anchor identifier.
	 */
	public createAnchorId(name: string): string {
		return this.#breadcrumbs.concat(name).join("-").toLowerCase();
	}

	/**
	 * Pushes the name onto the breadcrumb stack, executes the function, and then pops the breadcrumb.
	 * @param value Value to push onto the stack.
	 * @param fn Function to run.
	 * @returns The result of the function.
	 */
	public usingBreadcrumb<T>(value: string | undefined, fn: () => T): T {
		if (!value) {
			return fn();
		}

		this.#breadcrumbs.push(value);
		try {
			return fn();
		} finally {
			this.#breadcrumbs.pop();
		}
	}

	/**
	 * Increases the heading depth, executes the function, and then restores the depth.
	 * @param fn Function to run.
	 * @returns The result of the function.
	 */
	public usingDepth<T>(fn: () => T): T {
		this.depth++;
		try {
			return fn();
		} finally {
			this.depth--;
		}
	}
}
