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
import { formatObjectDefinition, getExpandedDefinition } from "./definitions.js";
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
	 * Names of the JSDoc tags, without the `@` prefix, to include in descriptions. When omitted, {@link DEFAULT_TAGS}
	 * is used; when supplied, this replaces the defaults.
	 */
	readonly tags?: Iterable<string>;
}

/**
 * Options used to discover a type declared in a file.
 */
export interface FileDiscoveryOptions extends DiscoveryOptions {
	/**
	 * Path to the file that declares or exports the type.
	 */
	readonly filePath: string;

	/**
	 * Name of the type, declared or exported by `filePath`, to document; the type can be a type alias, interface, or
	 * enum.
	 */
	readonly typeName: string;

	/**
	 * Optional path to the `tsconfig.json` file used to resolve types; when `undefined`, strict compiler options are
	 * used.
	 */
	readonly tsConfigFilePath?: string;
}

/**
 * Type discovered from its declaration, with references to the declarations of other types. This intermediate form
 * keeps compiler declarations until the whole graph has been discovered; they are then linked to shared model objects.
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
 * Loads a source file, within a project, from which types can be discovered. A supplied tsconfig provides resolution
 * options without eagerly adding every configured file; dependencies are resolved from the requested source as needed.
 * Without a tsconfig, strict ESNext and bundler defaults support modern TypeScript imports.
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

	const project = tsConfigFilePath === undefined ? new Project({ compilerOptions }) : new Project({ tsConfigFilePath });

	return project.addSourceFileAtPath(filePath);
}

/**
 * Finds the declaration of a type declared, or exported, by a source file.
 * @param source Source file.
 * @param typeName Name of the type; the type can be a type alias, interface, or enum.
 * @returns Declaration of the type; otherwise `undefined` when the type cannot be found.
 */
export function findDeclaration(source: SourceFile, typeName: string): DocumentableDeclaration | undefined {
	// Prefer exports to resolve re-exports, then fall back to local declarations so unexported types can be documented.
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

	// Iterating a set includes newly added references, giving breadth-first order with the root first and each
	// declaration visited once, even when references repeat or form cycles.
	for (const declaration of declarations) {
		const type = discoverType(declaration, tags);
		discovered.set(declaration, type);
		type.references.forEach((reference) => declarations.add(reference));
	}

	// Create every model object before linking references, so cycles and repeated references share the same identities.
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
	const linkProperty = (property: DiscoveredProperty): PropertyDocumentation => {
		const references: TypeDocumentation[] = [];
		resolve(property.references, references);
		return { ...property, references, properties: property.properties.map(linkProperty) };
	};

	for (const [declaration, type] of discovered) {
		const references: TypeDocumentation[] = [];
		resolve(type.references, references);

		// Precompute both overview forms while the compiler is available; generators only receive the model.
		documentation.set(declaration, {
			name: declaration.getName(),
			kind: type.kind,
			description: type.description,
			definition: type.definition,
			expandedDefinition: getExpandedDefinition(declaration) ?? type.definition,
			members: type.members,
			properties: type.properties.map(linkProperty),
			references,
		});
	}

	resolvers.forEach((resolver) => resolver());

	const rootDocumentation = documentation.get(root);
	if (rootDocumentation === undefined) {
		throw new Error(`Unable to document type "${root.getName()}".`);
	}

	return {
		root: rootDocumentation,
		types: [...documentation.values()],
	};
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

	// Constraints and defaults can reference types absent from the properties, e.g. `Rect` in `Layout<TRect = Rect>`.
	const typeParameterReferences = declaration
		.getTypeParameters()
		.flatMap((parameter) => [parameter.getConstraint(), parameter.getDefault()])
		.filter((node) => node !== undefined)
		.flatMap((node) => [...getReferences([node.getType()], declaration), ...getNodeReferences(node, declaration)]);

	const type = declaration.getType();
	if (!isObjectLike(type)) {
		// Keep the declaration's syntax for non-objects instead of documenting container or callable members as properties.
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
		references: unique([...properties.flatMap(getPropertyReferences), ...typeParameterReferences]).filter(
			(reference) => reference !== declaration,
		),
	};
}

/**
 * Collects references from a property and its inline object properties.
 * @param property Property.
 * @returns References in declaration order.
 */
function getPropertyReferences(property: DiscoveredProperty): DocumentableDeclaration[] {
	return [...property.references, ...property.properties.flatMap(getPropertyReferences)];
}

/**
 * Renders the definition of an object type, with its resolved properties and without documentation. Rebuilding the
 * body makes inherited and intersection members visible even when they are not written directly in the declaration.
 * @param declaration Declaration of the type.
 * @param properties Resolved properties of the type.
 * @returns TypeScript definition.
 */
function getObjectDefinition(
	declaration: InterfaceDeclaration | TypeAliasDeclaration,
	properties: readonly DiscoveredProperty[],
): string {
	const body =
		properties.length > 0
			? `{\n${properties.map((property) => `    ${formatPropertySignature(property)}`).join("\n")}\n}`
			: "{}";

	return formatObjectDefinition(declaration, body);
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
