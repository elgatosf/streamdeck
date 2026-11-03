import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Project } from "ts-morph";
import { afterEach, describe, expect, test } from "vitest";

import { discoverTypes, discoverTypesFromFile } from "../discovery/discover-types.js";
import type { DocumentationModel, TypeDocumentation } from "../model.js";

/**
 * Discovers a type declared in in-memory source files.
 * @param files Source files, keyed by path; the first file must declare the type.
 * @param typeName Name of the type to discover.
 * @returns Documentation model.
 */
function discover(files: Record<string, string>, typeName: string): DocumentationModel {
	const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true } });
	const sources = Object.entries(files).map(([path, text]) => project.createSourceFile(path, text));
	const source = sources[0]!;
	const declaration = source.getTypeAlias(typeName) ?? source.getInterface(typeName) ?? source.getEnumOrThrow(typeName);

	return discoverTypes(declaration);
}

/**
 * Gets a type from the model.
 * @param model Documentation model.
 * @param name Name of the type.
 * @returns The type.
 */
function getType(model: DocumentationModel, name: string): TypeDocumentation {
	const type = model.types.find((t) => t.name === name);
	expect(type, `Type "${name}" was not discovered.`).toBeDefined();
	return type!;
}

/**
 * Gets the names of the types.
 * @param types Types.
 * @returns Names of the types.
 */
function names(types: readonly TypeDocumentation[]): string[] {
	return types.map((type) => type.name);
}

describe("discoverTypes", () => {
	/**
	 * Asserts referenced types are discovered transitively and breadth-first, with each type discovered once.
	 */
	test("discovers referenced types breadth-first, once", () => {
		const model = discover(
			{
				"/root.ts": `
					export type Root = { actions: Action[]; os: [OS, OS?]; nested?: Root };
					export type Action = { os?: OS; states: State[] };
					export type State = { image: string };
					export type OS = { platform: "mac" | "windows" };
				`,
			},
			"Root",
		);

		expect(model.root.name).toBe("Root");
		expect(names(model.types)).toEqual(["Root", "Action", "OS", "State"]);
		expect(getType(model, "Root").properties.map((p) => p.type)).toEqual(["Action[]", "[OS, OS?]", "Root"]);
	});

	/**
	 * Asserts properties are described with their type, optionality, readonliness, and filtered JSDoc tags.
	 */
	test("describes properties", () => {
		const model = discover(
			{
				"/root.ts": `
					export type Root = {
						/**
						 * Name of the thing.
						 * @default "foo"
						 * @filePath
						 * @example
						 * "bar"
						 */
						readonly name?: string;
						"text-overflow": "clip" | "ellipsis";
					};
				`,
			},
			"Root",
		);

		const [name, overflow] = model.root.properties;
		expect(name).toMatchObject({
			name: "name",
			type: "string",
			optional: true,
			readonly: true,
			description: { text: "Name of the thing.", tags: [{ name: "default", text: '"foo"' }] },
		});
		expect(overflow).toMatchObject({ name: "text-overflow", optional: false, readonly: false });
		expect(model.root.definition).toContain('"text-overflow": "clip" | "ellipsis";');
	});

	/**
	 * Asserts enums are documented with their members, including imported enums referenced by member, and computed types are resolved.
	 */
	test("documents enums, including imported enums accessed by member", () => {
		const model = discover(
			{
				"/root.ts": `
					import { DeviceType } from "./device";
					const Versions = ["7.0", "7.6"] as const;
					export type Root = { device: DeviceType; mini: DeviceType.StreamDeckMini; version: (typeof Versions)[number] };
				`,
				"/device.ts": `
					/** Device type. */
					export enum DeviceType {
						/** Stream Deck. */
						StreamDeck = 0,
						StreamDeckMini = 1,
					}
				`,
			},
			"Root",
		);

		expect(names(model.types)).toEqual(["Root", "DeviceType"]);
		expect(model.root.properties.map((p) => p.type)).toEqual([
			"DeviceType",
			"DeviceType.StreamDeckMini",
			'"7.0" | "7.6"',
		]);

		const device = getType(model, "DeviceType");
		expect(device.kind).toBe("enum");
		expect(device.members).toEqual([
			{ name: "StreamDeck", value: "0", description: { text: "Stream Deck.", tags: [] } },
			{ name: "StreamDeckMini", value: "1", description: { text: "", tags: [] } },
		]);
	});

	/**
	 * Asserts intersections are flattened into a single object, and inherited generic properties are instantiated.
	 */
	test("flattens intersections and resolves inherited generic properties", () => {
		const model = discover(
			{
				"/root.ts": `
					type Base<TType extends string> = { type: TType; opacity?: Opacity };
					type Opacity = 0 | 0.5 | 1;
					type Bar<TType extends string = "bar"> = Base<TType> & { value: number };
					type GBar = Bar<"gbar"> & { height: number };
					export type Root = { items: (Bar | GBar)[] };
				`,
			},
			"Root",
		);

		expect(names(model.types)).toEqual(["Root", "Bar", "GBar", "Opacity"]);

		const gbar = getType(model, "GBar");
		expect(gbar.kind).toBe("object");
		expect(gbar.properties.map((p) => `${p.name}: ${p.type}`)).toEqual([
			'type: "gbar"',
			"opacity: Opacity",
			"value: number",
			"height: number",
		]);
		expect(names(gbar.references)).toEqual(["Opacity"]);
	});

	/**
	 * Asserts type aliases erased by the type checker, e.g. within unions and type parameter defaults, are discovered.
	 */
	test("discovers aliases erased by the type checker", () => {
		const model = discover(
			{
				"/root.ts": `
					type X = number;
					type Rect = [x: X, width: number];
					type Item<TRect> = { rect: TRect };
					type Items<TRect> = Item<TRect> | Item<TRect>[];
					export type Root<TRect = Rect> = { items: Items<TRect> };
				`,
			},
			"Root",
		);

		expect(names(model.types)).toEqual(["Root", "Items", "Rect", "Item", "X"]);
		expect(getType(model, "Items").kind).toBe("other");
		expect(names(getType(model, "Rect").references)).toEqual(["X"]);
	});

	/**
	 * Asserts interfaces are documented with definitions that include their properties.
	 */
	test("documents interfaces", () => {
		const model = discover(
			{
				"/root.ts": `
					/** Root. */
					export interface Root { child: Child }
					interface Child { name: string }
				`,
			},
			"Root",
		);

		expect(model.root.definition).toBe("export interface Root {\n    child: Child;\n}");
		expect(getType(model, "Child").definition).toBe("interface Child {\n    name: string;\n}");
	});

	/**
	 * Asserts only the specified JSDoc tags are included in descriptions.
	 */
	test("filters tags", () => {
		const project = new Project({ useInMemoryFileSystem: true });
		const source = project.createSourceFile(
			"/root.ts",
			`/**
			  * Root.
			  * @deprecated Use something else.
			  * @custom Custom tag.
			  */
			export type Root = { name: string };`,
		);

		const model = discoverTypes(source.getTypeAliasOrThrow("Root"), { tags: ["custom"] });
		expect(model.root.description.tags).toEqual([{ name: "custom", text: "Custom tag." }]);
	});
});

describe("discoverTypesFromFile", () => {
	let dir: string | undefined;

	afterEach(() => {
		if (dir !== undefined) {
			rmSync(dir, { recursive: true, force: true });
			dir = undefined;
		}
	});

	/**
	 * Asserts the type declared within the file is discovered, and a missing type throws.
	 */
	test("discovers the type within the file", () => {
		dir = mkdtempSync(join(tmpdir(), "docs-"));
		const filePath = join(dir, "root.ts");
		writeFileSync(filePath, "export interface Root { name: string }");

		const model = discoverTypesFromFile({ filePath, typeName: "Root" });
		expect(model.root.name).toBe("Root");
		expect(() => discoverTypesFromFile({ filePath, typeName: "Missing" })).toThrow(
			`Unable to find type "Missing" in ${filePath}.`,
		);
	});

	/**
	 * Asserts types re-exported by the file, directly or transitively, are discovered.
	 */
	test("discovers types re-exported by the file", () => {
		dir = mkdtempSync(join(tmpdir(), "docs-"));
		writeFileSync(join(dir, "manifest.ts"), "export interface Manifest { name: string }");
		writeFileSync(join(dir, "layout.ts"), "export type Layout = { items: string[] };");
		writeFileSync(join(dir, "nested.ts"), 'export * from "./manifest.js";');

		const filePath = join(dir, "index.ts");
		writeFileSync(filePath, 'export * from "./nested.js";\nexport type { Layout } from "./layout.js";');

		expect(discoverTypesFromFile({ filePath, typeName: "Manifest" }).root.name).toBe("Manifest");
		expect(discoverTypesFromFile({ filePath, typeName: "Layout" }).root.name).toBe("Layout");
	});
});
