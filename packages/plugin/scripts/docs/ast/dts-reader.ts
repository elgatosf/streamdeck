import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
	type ClassDeclaration,
	ModuleKind,
	ModuleResolutionKind,
	type Node,
	Project,
	type SourceFile,
	type TypeAliasDeclaration,
	type TypeChecker,
} from "ts-morph";
import { ts } from "ts-morph";

import {
	type Aliased,
	type EnumStructure,
	type ObjectStructure,
	type SignatureStructure,
	StructureBuilder,
	type UnionStructure,
} from "./structures/index.js";

/**
 * Provides methods for reading a TypeScript declaration file, and converting types to structures.
 */
export class DeclarationReader {
	/**
	 * Entry source files, whose exports are searched before their dependencies.
	 */
	private readonly entries: SourceFile[];

	/**
	 * Project generated from the source file.
	 */
	private readonly project: Project;

	/**
	 * Type checker associated with the declaration.
	 */
	private readonly typeChecker: TypeChecker;

	/**
	 * Initializes a new instance of the {@link DeclarationReader} class.
	 * @param filePaths Paths to the source files.
	 */
	constructor(filePaths: string[]) {
		this.project = new Project({
			compilerOptions: {
				customConditions: ["node"],
				module: ModuleKind.NodeNext,
				moduleResolution: ModuleResolutionKind.NodeNext,
				skipLibCheck: true,
				strictNullChecks: false, // Optional members are documented without `undefined`.
			},
		});

		this.entries = this.project.addSourceFilesAtPaths(filePaths);
		this.project.resolveSourceFileDependencies();

		this.typeChecker = this.project.getTypeChecker();
	}

	/**
	 * Gets the class declaration with the specified name.
	 * @param name Name of the class.
	 * @returns The class declaration.
	 */
	public getClass(name: string): ClassDeclaration {
		return this.find(name, (source) => source.getClass(name));
	}

	/**
	 * Gets the structure for the specified declaration.
	 * @param name Name of the declaration.
	 * @returns The structure.
	 */
	public getStructure(name: string): Aliased<EnumStructure | ObjectStructure | SignatureStructure | UnionStructure> {
		return this.structureFrom(
			this.find(name, (source) => source.getTypeAlias(name) ?? source.getClass(name) ?? source.getEnum(name)),
		);
	}

	/**
	 * Gets the type alias declaration with the specified name.
	 * @param name Name of the type alias.
	 * @returns The type alias declaration.
	 */
	public getTypeAlias(name: string): TypeAliasDeclaration {
		return this.find(name, (source) => source.getTypeAlias(name));
	}

	/**
	 * Finds a declaration within the source files.
	 * @param name Name of the declaration, used for error reporting.
	 * @param get Gets the declaration from a source file.
	 * @returns The declaration.
	 */
	private find<T>(name: string, get: (source: SourceFile) => T | undefined): T {
		// Prefer the declaration exported from the entry files, as dependencies may declare types with the same name.
		for (const entry of this.entries) {
			for (const exported of entry.getExportedDeclarations().get(name) ?? []) {
				const declaration = get(exported.getSourceFile());
				if (declaration) {
					return declaration;
				}
			}
		}

		for (const source of this.project.getSourceFiles()) {
			const declaration = get(source);
			if (declaration) {
				return declaration;
			}
		}

		throw new Error(`Declaration not found: ${name}`);
	}

	/**
	 * Gets the structure for the specified node.
	 * @param node The node.
	 * @returns The structure.
	 */
	private structureFrom(
		node: Node<ts.Node>,
	): Aliased<EnumStructure | ObjectStructure | SignatureStructure | UnionStructure> {
		const typeBuilder = new StructureBuilder(node, this.typeChecker);
		return typeBuilder.getStructure(node.getType());
	}
}

/**
 * !NOTE
 *
 * The files used to create a declaration reader define the "root" of the reader. This is important
 * as file paths upwards past the root cannot be resolved, for example "../../xyz" would fail. To fix
 * this, we add multiple required files that make up the file structure, ensuring a valid root.
 */

/**
 * Root directory of the package, i.e. `packages/plugin`.
 */
const packageDir = join(dirname(fileURLToPath(import.meta.url)), "../../../");

/**
 * Declaration reader for the Stream Deck SDK (Node.js).
 */
export const sdkDeclarations = new DeclarationReader([join(packageDir, "dist/plugin/index.d.ts")]);

/**
 * Declaration reader for the Stream Deck APIs.
 */
export const apiDeclarations = {
	plugin: new DeclarationReader([join(packageDir, "dist/api/index.d.ts")]),
};

/**
 * Declaration reader for the Stream Deck schemas.
 */
export const schemaDeclarations = new DeclarationReader([
	join(packageDir, "node_modules/@elgato/schemas/dist/streamdeck/plugins/index.d.ts"),
]);
