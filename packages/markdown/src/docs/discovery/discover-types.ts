import { Node, Project, ts, type InterfaceDeclaration, type SourceFile, type TypeAliasDeclaration } from "ts-morph";

import { formatPropertySignature } from "../format.js";
import type {
	Description,
	DocumentationModel,
	EnumMemberDocumentation,
	PropertyDocumentation,
	TypeDocumentation,
} from "../model.js";
import type { DocumentableDeclaration } from "./declaration.js";
import { getDescription } from "./descriptions.js";
import { discoverProperty, isObjectLike, type DiscoveredProperty } from "./properties.js";
import { getNodeReferences, getReferences } from "./references.js";

/**
 * JSDoc tags included in descriptions by default; other tags, e.g. schema-specific tags such as `@filePath`, are
 * omitted.
 */
export const DEFAULT_TAGS: ReadonlySet<string> = new Set([
	"default",
	"defaultValue",
	"deprecated",
	"remarks",
	"see",
	"since",
]);

/**
 * Options used to discover types.
 */
export interface DiscoveryOptions {
	/**
	 * Names of the JSDoc tags, without the `@` prefix, to include in descriptions; default is {@link DEFAULT_TAGS}.
	 */
	readonly tags?: Iterable<string>;
}

/**
 * Options used to discover a type declared in a file.
 */
export interface FileDiscoveryOptions extends DiscoveryOptions {
	/**
	 * Path to the file that declares the type.
	 */
	readonly filePath: string;

	/**
	 * Name of the type, declared in `filePath`, to document; the type can be a type alias, interface, or enum.
	 */
	readonly typeName: string;

	/**
	 * Optional path to the `tsconfig.json` file used to resolve types; when `undefined`, strict compiler options are
	 * used.
	 */
	readonly tsConfigFilePath?: string;
}

/**
 * Type discovered from its declaration, with references to the declarations of other types.
 */
interface DiscoveredType {
	/**
	 * Kind of the type.
	 */
	readonly kind: TypeDocumentation["kind"];

	/**
	 * Description of the type.
	 */
	readonly description: Description;

	/**
	 * TypeScript definition of the type.
	 */
	readonly definition: string;

	/**
	 * Properties of the type, when it is object-like.
	 */
	readonly properties: readonly DiscoveredProperty[];

	/**
	 * Members of the type, when it is an enum.
	 */
	readonly members: readonly EnumMemberDocumentation[];

	/**
	 * Declarations of the types referenced by the type.
	 */
	readonly references: readonly DocumentableDeclaration[];
}

/**
 * Discovers the type declared in a file, and the types it references.
 * @param options Options that identify the type.
 * @returns Documentation model of the type.
 */
export function discoverTypesFromFile(options: FileDiscoveryOptions): DocumentationModel {
	const source = loadSourceFile(options.filePath, options.tsConfigFilePath);
	const declaration = findDeclaration(source, options.typeName);

	if (declaration === undefined) {
		throw new Error(`Unable to find type "${options.typeName}" in ${options.filePath}.`);
	}

	return discoverTypes(declaration, options);
}

/**
 * Loads a source file, within a project, from which types can be discovered.
 * @param filePath Path to the file.
 * @param tsConfigFilePath Optional path to the `tsconfig.json` file used to resolve types; when `undefined`, strict
 * compiler options are used.
 * @returns Source file.
 */
export function loadSourceFile(filePath: string, tsConfigFilePath?: string): SourceFile {
	const compilerOptions = {
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		strict: true,
	};

	const project =
		tsConfigFilePath === undefined
			? new Project({ compilerOptions })
			: new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: true });

	return project.addSourceFileAtPath(filePath);
}

/**
 * Finds the declaration of a type declared, or exported, by a source file.
 * @param source Source file.
 * @param typeName Name of the type; the type can be a type alias, interface, or enum.
 * @returns Declaration of the type; otherwise `undefined` when the type cannot be found.
 */
export function findDeclaration(source: SourceFile, typeName: string): DocumentableDeclaration | undefined {
	// Exported declarations include re-exports, e.g. `export * from "./manifest.js"` within an index file.
	return (
		source.getExportedDeclarations().get(typeName)?.find(isDocumentableDeclaration) ??
		source.getTypeAlias(typeName) ??
		source.getInterface(typeName) ??
		source.getEnum(typeName)
	);
}

/**
 * Discovers a type, and the types it references (directly or transitively), resolving computed types to their values.
 * @param root Declaration of the type to document.
 * @param options Options used to discover the types.
 * @returns Documentation model of the type.
 */
export function discoverTypes(root: DocumentableDeclaration, options: DiscoveryOptions = {}): DocumentationModel {
	const tags = new Set(options.tags ?? DEFAULT_TAGS);
	const discovered = new Map<DocumentableDeclaration, DiscoveredType>();
	const declarations = new Set<DocumentableDeclaration>([root]);

	// Iterating a set includes items added during iteration, discovering transitive references breadth-first.
	for (const declaration of declarations) {
		const type = discoverType(declaration, tags);
		discovered.set(declaration, type);
		type.references.forEach((reference) => declarations.add(reference));
	}

	// Documentation references each other, so all documentation is created before references are resolved.
	const documentation = new Map<DocumentableDeclaration, TypeDocumentation>();
	const resolvers: (() => void)[] = [];
	const resolve = (references: readonly DocumentableDeclaration[], target: TypeDocumentation[]): void => {
		resolvers.push(() => {
			for (const reference of references) {
				const type = documentation.get(reference);
				if (type !== undefined) {
					target.push(type);
				}
			}
		});
	};

	for (const [declaration, type] of discovered) {
		const references: TypeDocumentation[] = [];
		resolve(type.references, references);

		documentation.set(declaration, {
			name: declaration.getName(),
			kind: type.kind,
			description: type.description,
			definition: type.definition,
			members: type.members,
			properties: type.properties.map((property): PropertyDocumentation => {
				const propertyReferences: TypeDocumentation[] = [];
				resolve(property.references, propertyReferences);
				return { ...property, references: propertyReferences };
			}),
			references,
		});
	}

	resolvers.forEach((resolver) => resolver());

	const rootDocumentation = documentation.get(root);
	if (rootDocumentation === undefined) {
		throw new Error(`Unable to document type "${root.getName()}".`);
	}

	return { root: rootDocumentation, types: [...documentation.values()] };
}

/**
 * Discovers a type from its declaration.
 * @param declaration Declaration of the type.
 * @param tags Names of the JSDoc tags to include.
 * @returns Discovered type.
 */
function discoverType(declaration: DocumentableDeclaration, tags: ReadonlySet<string>): DiscoveredType {
	const description = getDescription(declaration, tags);

	if (Node.isEnumDeclaration(declaration)) {
		return {
			kind: "enum",
			description,
			definition: declaration.print({ removeComments: true }),
			properties: [],
			members: declaration.getMembers().map((member) => ({
				name: member.getName(),
				value: member.getInitializer()?.getText() ?? JSON.stringify(member.getValue()),
				description: getDescription(member, tags),
			})),
			references: [],
		};
	}

	// Type parameter constraints and defaults are referenced, e.g. `Rect` in `Layout<TRect = Rect>`.
	const typeParameterReferences = declaration
		.getTypeParameters()
		.flatMap((parameter) => [parameter.getConstraint(), parameter.getDefault()])
		.filter((node) => node !== undefined)
		.flatMap((node) => [...getReferences([node.getType()], declaration), ...getNodeReferences(node, declaration)]);

	const type = declaration.getType();
	if (!isObjectLike(type)) {
		return {
			kind: "other",
			description,
			definition: declaration.print({ removeComments: true }),
			properties: [],
			members: [],
			references: unique([
				...getReferences([type], declaration),
				...(Node.isTypeAliasDeclaration(declaration) ? getNodeReferences(declaration.getTypeNode(), declaration) : []),
				...typeParameterReferences,
			]),
		};
	}

	const properties = type.getProperties().map((symbol) => discoverProperty(symbol, declaration, tags));
	return {
		kind: "object",
		description,
		definition: getObjectDefinition(declaration, properties),
		properties,
		members: [],
		references: unique([...properties.flatMap((property) => property.references), ...typeParameterReferences]).filter(
			(reference) => reference !== declaration,
		),
	};
}

/**
 * Renders the definition of an object type, with its resolved properties and without documentation.
 * @param declaration Declaration of the type.
 * @param properties Resolved properties of the type.
 * @returns TypeScript definition.
 */
function getObjectDefinition(
	declaration: InterfaceDeclaration | TypeAliasDeclaration,
	properties: readonly DiscoveredProperty[],
): string {
	const exported = declaration.isExported() ? "export " : "";
	const parameters = declaration.getTypeParameters();
	const typeParameters =
		parameters.length > 0 ? `<${parameters.map((parameter) => parameter.getText()).join(", ")}>` : "";
	const body =
		properties.length > 0
			? `{\n${properties.map((property) => `    ${formatPropertySignature(property)}`).join("\n")}\n}`
			: "{}";

	return Node.isInterfaceDeclaration(declaration)
		? `${exported}interface ${declaration.getName()}${typeParameters} ${body}`
		: `${exported}type ${declaration.getName()}${typeParameters} = ${body};`;
}

/**
 * Determines whether the node is a declaration of a type that can be documented.
 * @param node Node to check.
 * @returns `true` when the node is a type alias, interface, or enum declaration; otherwise `false`.
 */
function isDocumentableDeclaration(node: Node): node is DocumentableDeclaration {
	return Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node) || Node.isEnumDeclaration(node);
}

/**
 * Removes duplicate items, preserving the order in which they first occur.
 * @param items Items.
 * @returns Unique items.
 */
function unique<T>(items: readonly T[]): T[] {
	return [...new Set(items)];
}
