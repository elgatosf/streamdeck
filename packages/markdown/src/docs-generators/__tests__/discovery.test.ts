import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { discoverTypes, discoverTypesFromFile } from "../discovery/discover-types.js";
import { referenceGenerator } from "../generators/reference.js";
import { tableGenerator } from "../generators/table.js";
import type { DocumentationModel, TypeDocumentation } from "../model.js";
import { createTestProject } from "./test-project.js";

/**
 * Discovers a type declared in in-memory source files.
 * @param files Source files, keyed by path; the first file must declare the type.
 * @param typeName Name of the type to discover.
 * @returns Documentation model.
 */
function discover(files: Record<string, string>, typeName: string): DocumentationModel {
	const project = createTestProject();
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
	 * Asserts properties redeclared within an intersection use the checker-resolved type, e.g. `"special"` rather than
	 * the `string` declared by the base type.
	 */
	test("uses checker-resolved property types for intersections", () => {
		const model = discover(
			{
				"/root.ts": `
					type Base = { kind: string; value: string | number; active?: boolean };
					export type Root = Base & { kind: "special"; value: number; active: true };
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, property.type, property.optional])).toEqual([
			["kind", '"special"', false],
			["value", "number", false],
			["active", "true", false],
		]);
	});

	/**
	 * Asserts intersection properties use the resolved type even when the first declaration is within the root.
	 */
	test("resolves locally declared intersection properties", async () => {
		const model = discover(
			{
				"/root.ts": `
					type Base = { kind: "special"; value: number; active: true };
					export type Root = { kind: string; value: string | number; active?: boolean } & Base;
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, property.type, property.optional])).toEqual([
			["kind", '"special"', false],
			["value", "number", false],
			["active", "true", false],
		]);

		for (const generator of [referenceGenerator, tableGenerator]) {
			const output = await generator.generate(model);
			expect(output).toContain('kind: "special";');
			expect(output).not.toContain("kind: string;");
		}
	});

	/**
	 * Asserts properties of inline object types are discovered with their descriptions.
	 */
	test("discovers descriptions on inline object properties", () => {
		const model = discover(
			{
				"/root.ts": `
					export interface Root {
						font?: {
							/** Font size in pixels. */
							size?: number;
							/** Font weight. */
							weight?: number;
						};
					}
				`,
			},
			"Root",
		);

		expect(model.root.properties[0]?.properties.map((property) => [property.name, property.description.text])).toEqual([
			["size", "Font size in pixels."],
			["weight", "Font weight."],
		]);
	});

	/**
	 * Asserts inline object types within arrays and unions are discovered, with each property discovered once, and
	 * named types are not, as they are documented separately.
	 */
	test("discovers inline object properties within arrays and unions", () => {
		const model = discover(
			{
				"/root.ts": `
					interface Named { hidden: string }
					export interface Root {
						items: { id: string }[];
						choice?: { a: string } | { a: string; b: number } | Named | string;
					}
				`,
			},
			"Root",
		);

		expect(
			model.root.properties.map((property) => [property.name, property.properties.map(({ name }) => name)]),
		).toEqual([
			["items", ["id"]],
			["choice", ["a", "b"]],
		]);
	});

	/**
	 * Asserts recursive inline properties terminate on each branch without suppressing sibling properties.
	 */
	test("terminates recursive inline properties", async () => {
		const model = discover(
			{
				"/root.ts": `
					export interface Root {
						first: {
							/** Node label. */
							label: string;
							next?: Root["first"];
							children?: Root["first"][];
						};
						second: Root["first"];
					}
				`,
			},
			"Root",
		);

		for (const property of model.root.properties) {
			expect(property.properties.map(({ name }) => name)).toEqual(["label", "next", "children"]);
			expect(property.properties[0]?.description.text).toBe("Node label.");
			expect(property.properties[1]?.properties).toEqual([]);
			expect(property.properties[2]?.properties).toEqual([]);
		}

		for (const generator of [referenceGenerator, tableGenerator]) {
			const output = await generator.generate(model);
			expect(output).toContain("first.label");
			expect(output).toContain("second.label");
			expect(output).not.toContain("first.next.label");
		}
	});

	/**
	 * Asserts generic type arguments of referenced types are discovered, e.g. `Detail` in `Wrapper<Detail>`.
	 */
	test("discovers references in instantiated inherited generic properties", () => {
		const model = discover(
			{
				"/root.ts": `
					interface Wrapper<T> { item: T }
					interface Detail { name: string }
					interface Base<T> { options: Wrapper<T> }
					export interface Root extends Base<Detail> {}
				`,
			},
			"Root",
		);

		expect(names(model.root.references)).toEqual(["Wrapper", "Detail"]);
		expect(names(model.root.properties[0]!.references)).toEqual(["Wrapper", "Detail"]);
	});

	/**
	 * Asserts instantiated library types expose their user-defined generic arguments as references and links.
	 */
	test("discovers references within library generic types", async () => {
		const model = discover(
			{
				"/root.ts": `
					interface Detail { label: string }
					interface Wrapper<T> { item: T }
					interface Base<T> {
						promise: Promise<T>;
						mapping: Map<string, T>;
						nested: Promise<Wrapper<T>>;
					}
					export interface Root extends Base<Detail> {}
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, names(property.references)])).toEqual([
			["promise", ["Detail"]],
			["mapping", ["Detail"]],
			["nested", ["Wrapper", "Detail"]],
		]);
		expect(names(model.types)).toEqual(expect.arrayContaining(["Root", "Detail", "Wrapper"]));

		const flat = await referenceGenerator.generate(model);
		const table = await tableGenerator.generate(model);
		expect(flat).toContain("**References:** [Detail](#detail).");
		expect(table).toContain("See [Detail](#detail)");
	});

	/**
	 * Asserts `null` is retained when removing the `undefined` implied by an optional property.
	 */
	test("preserves null in optional inherited generic properties", () => {
		const model = discover(
			{
				"/root.ts": `
					interface Base<T> { value?: T }
					export interface Root extends Base<string | null> {}
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, property.type, property.optional])).toEqual([
			["value", "null | string", true],
		]);
	});

	/**
	 * Asserts callable and constructable members remain parenthesized in optional inherited unions.
	 */
	test("parenthesizes optional inherited callable unions", async () => {
		const model = discover(
			{
				"/root.ts": `
					interface Child { name: string }
					interface Base<T, C> { value?: T | Child | null; create?: C | Child }
					export interface Root extends Base<() => string, new (name: string) => Child> {}
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, property.type])).toEqual([
			["value", "null | (() => string) | Child"],
			["create", "(new (name: string) => Child) | Child"],
		]);
		const source = createTestProject().createSourceFile(
			"/generated.ts",
			`interface Child { name: string }\n${model.root.definition}`,
		);
		expect(source.getPreEmitDiagnostics().map((diagnostic) => diagnostic.getCode())).toEqual([]);

		for (const generator of [referenceGenerator, tableGenerator]) {
			const output = await generator.generate(model);
			expect(output).toContain("value?: null | (() => string) | Child;");
			expect(output).toContain("create?: (new (name: string) => Child) | Child;");
		}
	});

	/**
	 * Asserts tuple aliases are referenced by name, and optional tuple unions remain parenthesized.
	 */
	test("preserves tuple aliases and parenthesizes optional tuple unions", () => {
		const model = discover(
			{
				"/root.ts": `
					type Rect = [x: number, y: number];
					export interface Root {
						rect: Rect;
						pair: [string, ("a" | "b")?];
					}
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, property.type])).toEqual([
			["rect", "Rect"],
			["pair", '[string, ("a" | "b")?]'],
		]);
		expect(names(model.root.references)).toEqual(["Rect"]);
	});

	/**
	 * Asserts optional tuple formatting does not rewrite string or template literal contents.
	 */
	test("preserves literal contents when formatting optional tuples", async () => {
		const model = discover(
			{
				"/root.ts": `
					export interface Root<T> {
						value: "(x | undefined)?";
						template: \`prefix (x | undefined)? \${string}\`;
						tuple: ["(x | undefined)?"?, string?];
						nested: [[string?]?];
						keys: [(keyof T)?];
						callback: [(() => string)?];
					}
				`,
			},
			"Root",
		);

		expect(model.root.properties.map((property) => [property.name, property.type])).toEqual([
			["value", '"(x | undefined)?"'],
			["template", "`prefix (x | undefined)? ${string}`"],
			["tuple", '["(x | undefined)?"?, string?]'],
			["nested", "[[string?]?]"],
			["keys", "[(keyof T)?]"],
			["callback", "[(() => string)?]"],
		]);
		const source = createTestProject().createSourceFile("/generated.ts", model.root.definition);
		expect(source.getPreEmitDiagnostics().map((diagnostic) => diagnostic.getCode())).toEqual([]);

		for (const generator of [referenceGenerator, tableGenerator]) {
			const output = await generator.generate(model);
			expect(output).toContain('"(x | undefined)?"');
			expect(output).toContain("`prefix (x | undefined)? ${string}`");
		}
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
		const project = createTestProject();
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

	/**
	 * Asserts ambient declarations included by the tsconfig are loaded, so types referencing them are resolved.
	 */
	test("loads ambient declarations included by the tsconfig", () => {
		dir = mkdtempSync(join(tmpdir(), "docs-"));
		const filePath = join(dir, "root.ts");
		const tsConfigFilePath = join(dir, "tsconfig.json");
		writeFileSync(filePath, 'export interface Root { kind: GlobalType["kind"] }');
		writeFileSync(join(dir, "globals.d.ts"), 'interface GlobalType { kind: "internal" | "public" }');
		writeFileSync(
			tsConfigFilePath,
			JSON.stringify({ compilerOptions: { strict: true, lib: ["ESNext"] }, files: ["root.ts", "globals.d.ts"] }),
		);

		expect(discoverTypesFromFile({ filePath, typeName: "Root", tsConfigFilePath }).root.properties[0]?.type).toBe(
			'"internal" | "public"',
		);
	});
});
