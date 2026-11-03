import type { EnumStructure, ObjectStructure, UnionStructure } from "../ast/index.js";
import type { Aliased } from "../ast/structures/structure.js";

/**
 * Provides context for building content, specifically from structure.
 */
export class ContentBuilderContext {
	/**
	 * The heading depth, for example h1, h2, etc.
	 */
	private readonly headingDepth: Options["firstHeading"] = 2;

	/**
	 * Set of alias structures included in this rendering.
	 */
	#aliasedStructures = new Set<Aliased<RenderableStructure>>();

	/**
	 * Trail of breadcrumbs.
	 */
	#breadcrumbs: string[] = [];

	/**
	 * Initializes a new instance of the {@link ContentBuilderContext} class.
	 * @param opts Rendering options.
	 */
	constructor(opts?: Options) {
		this.headingDepth = opts?.firstHeading ?? 2;
	}

	/**
	 * Gets the markdown heading prefix for the current heading depth, for example `##`, `###`.
	 */
	public get headingPrefix(): string {
		return "#".repeat(this.headingDepth);
	}

	/**
	 * Adds an aliased structure to this instance.
	 * @param structure Structure to add.
	 */
	public addAliasedStructure(structure: Aliased<RenderableStructure>): void {
		this.#aliasedStructures.add(structure);
	}

	/**
	 * Creates an anchor id for the given name, prefix with the breadcrumbs.
	 * @param name Name of the anchor.
	 * @returns The anchor identifier.
	 */
	public createAnchorId(name: string): string {
		return this.#breadcrumbs.concat(name).join("-").toLowerCase();
	}

	/**
	 * Gets all aliased structures, registered on this instance.
	 * @returns The aliased structures.
	 */
	public getAliasedStructures(): IterableIterator<Aliased<RenderableStructure>> {
		return this.#aliasedStructures.values();
	}

	/**
	 * Pushes the name onto the breadcrumb stack, executes the {@link fn}, and then pops the breadcrumb.
	 * @param value Value to push onto the stack.
	 * @param fn Function to run.
	 * @returns The result of {@link fn}.
	 */
	public usingBreadcrumb<T = void>(value: string | undefined, fn: () => T): T {
		if (!value) {
			return fn();
		}

		this.#breadcrumbs.push(value);
		const result = fn();
		this.#breadcrumbs.pop();

		return result;
	}
}

/**
 * Options that determine how the content should be rendered.
 */
type Options = {
	/**
	 * Initial heading depth.
	 */
	firstHeading: 2 | 3 | 4 | 5 | 6;
};

/**
 * A renderable structure.
 */
export type RenderableStructure = EnumStructure | ObjectStructure | UnionStructure;
