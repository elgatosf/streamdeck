import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
	type ClassDeclaration,
	ModuleKind,
	ModuleResolutionKind,
	type Node,
	Project,
	type ResolutionHostFactory,
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
				strictNullChecks: false, // Matches the legacy generator; optional members are not unioned with `undefined`.
			},
			resolutionHost,
		});

		this.project.addSourceFilesAtPaths(filePaths);
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
 * Provides a custom module resolution factory to resolve nested modules such as `@elgato/schemas/streamdeck/plugins`.
 * @param moduleResolutionHost The TypeScript module resolution host.
 * @param getCompilerOptions Delegate for getting the compiler options.
 * @returns The resolution host.
 */
const resolutionHost: ResolutionHostFactory = (moduleResolutionHost, getCompilerOptions) => {
	return {
		resolveModuleNames: (moduleNames, containingFile): (ts.ResolvedModule | undefined)[] => {
			const compilerOptions = getCompilerOptions();
			return moduleNames.map((name) => {
				name = transformName(name);

				const result = ts.resolveModuleName(name, containingFile, compilerOptions, moduleResolutionHost);
				return result.resolvedModule ? result.resolvedModule : undefined;
			});
		},
	};

	/**
	 * Transforms known module names so they can be resolved by ts-morph.
	 * @param moduleName Module name.
	 * @returns Transformed module name.
	 */
	function transformName(moduleName: string): string {
		if (moduleName === "@elgato/schemas/streamdeck/plugins") {
			return "@elgato/schemas/dist/streamdeck/plugins";
		}

		return moduleName;
	}
};

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
