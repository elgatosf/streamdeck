import { describe, expect, test } from "vitest";

import { discoverTypes } from "../discovery/discover-types.js";
import { formatOverview } from "../generators/overview.js";
import { referenceGenerator } from "../generators/reference.js";
import { tableGenerator } from "../generators/table.js";
import type { DocumentationModel } from "../model.js";
import { createTestProject } from "./test-project.js";

/**
 * Discovers the `Root` type declared in the in-memory source.
 * @param text Source.
 * @returns Documentation model.
 */
function discover(text: string): DocumentationModel {
	const project = createTestProject();
	const source = project.createSourceFile("/root.ts", text);
	return discoverTypes(source.getTypeAlias("Root") ?? source.getInterfaceOrThrow("Root"));
}

describe("formatOverview", () => {
	const model = discover(`
		enum Kind { A = "a", B = "b" }
		type State = { image: string; title?: string };
		type Action = { name: string; kind: Kind.A; states: State[]; parent?: Action };
		type Union = "x" | "y";
		export type Root = {
			actions: Action[];
			pair: [State, State?];
			"State": string;
			label: \`State \${string}\`;
			kind: Kind;
			union: Union;
			flag: boolean | State;
			empty: {};
		};
	`);

	/**
	 * Asserts the collapsed overview is the definition of the root type, and is the default.
	 */
	test("collapsed is the definition", () => {
		expect(formatOverview(model.root, "collapsed")).toBe(model.root.definition);
		expect(formatOverview(model.root)).toBe(model.root.definition);
	});

	/**
	 * Asserts referenced object types are expanded as nested structures, within arrays, tuples, and unions, while enums,
	 * enum members, unions of literals, string literals, property names, and recursive references are not.
	 */
	test("expanded inlines referenced object types", () => {
		expect(formatOverview(model.root, "expanded")).toBe(
			[
				"export type Root = {",
				"    actions: {",
				"        name: string;",
				"        kind: Kind.A;",
				"        states: {",
				"            image: string;",
				"            title?: string;",
				"        }[];",
				"        parent?: Action;",
				"    }[];",
				"    pair: [{",
				"        image: string;",
				"        title?: string;",
				"    }, {",
				"        image: string;",
				"        title?: string;",
				"    }?];",
				"    State: string;",
				"    label: `State ${string}`;",
				"    kind: Kind;",
				"    union: Union;",
				"    flag: boolean | {",
				"        image: string;",
				"        title?: string;",
				"    };",
				"    empty: {};",
				"};",
			].join("\n"),
		);
	});

	/**
	 * Asserts generic types, and unions of them, are expanded with their type arguments, including type parameters of
	 * the root type.
	 */
	test("expanded instantiates generic types", () => {
		const generic = discover(`
			type Rect = [x: number, y: number];
			type Base<T extends string, TRect> = { type: T; rect: TRect };
			type Bar<TRect = Rect> = Base<"bar", TRect> & { value: number };
			type Text<TRect = Rect> = Base<"text", TRect> & { text: string };
			type Item<TRect> = Bar<TRect> | Text<TRect>;
			type Wrapper<T> = { value: T };
			export type Root<TRect = Rect> = { items: Item<TRect>[]; wrapper: Wrapper<string> };
		`);

		expect(formatOverview(generic.root, "expanded")).toBe(
			[
				"export type Root<TRect = Rect> = {",
				"    items: ({",
				'        type: "bar";',
				"        rect: TRect;",
				"        value: number;",
				"    } | {",
				'        type: "text";',
				"        rect: TRect;",
				"        text: string;",
				"    })[];",
				"    wrapper: {",
				"        value: string;",
				"    };",
				"};",
			].join("\n"),
		);
	});

	/**
	 * Asserts single boolean literals are not widened to `boolean`, and optional tuple unions remain valid TypeScript.
	 */
	test("expanded preserves boolean literals and optional tuple unions", () => {
		const model = discover(`
			type Child = { name: string };
			export interface Root {
				enabled: true | Child;
				disabled: false | Child;
				pair: [("a" | "b")?, (Child | null)?];
			}
		`);

		expect(formatOverview(model.root, "expanded")).toContain(
			[
				"    enabled: true | {",
				"        name: string;",
				"    };",
				"    disabled: false | {",
				"        name: string;",
				"    };",
				'    pair: [("a" | "b")?, (null | {',
				"        name: string;",
				"    })?];",
			].join("\n"),
		);
		const project = createTestProject();
		const generated = project.createSourceFile("/generated.ts", formatOverview(model.root, "expanded"));
		const collapsed = project.createSourceFile("/collapsed.ts", model.root.definition);

		expect(generated.getPreEmitDiagnostics().map((diagnostic) => diagnostic.getCode())).not.toContain(17019);
		expect(collapsed.getPreEmitDiagnostics().map((diagnostic) => diagnostic.getCode())).not.toContain(17019);
	});

	/**
	 * Asserts variadic tuple elements, e.g. `...T`, are not rendered as rest elements, e.g. `...T[]`.
	 */
	test("expanded preserves generic variadic tuple elements", () => {
		const model = discover(`
			type Child = { name: string };
			export interface Root<T extends unknown[]> {
				pair: [Child, ...T];
				values: [Child, ...number[]];
			}
		`);

		const expanded = formatOverview(model.root, "expanded");
		expect(expanded).toContain("pair: [{\n        name: string;\n    }, ...T];");
		expect(expanded).toContain("values: [{\n        name: string;\n    }, ...number[]];");
	});

	/**
	 * Asserts expanded unions retain valid callable and constructable members in properties, arrays, and tuples.
	 */
	test("expanded preserves callable unions", async () => {
		const model = discover(`
			interface Child { name: string }
			export interface Root {
				value: Child | (() => string);
				create: Child | (new (name: string) => Child);
				array: (Child | (() => string))[];
				tuple: [(Child | (() => string))?];
				single: [Child, (() => string)?];
				singleConstructor: [Child, (new (name: string) => Child)?];
			}
		`);
		const expanded = formatOverview(model.root, "expanded");

		expect(expanded).toContain(" | (() => string)");
		expect(expanded).toContain(" | (new (name: string) => Child)");
		expect(expanded).toContain("}, (() => string)?];");
		expect(expanded).toContain("}, (new (name: string) => Child)?];");
		const source = createTestProject().createSourceFile(
			"/generated.ts",
			`interface Child { name: string }\n${expanded}`,
		);
		expect(source.getPreEmitDiagnostics().map((diagnostic) => diagnostic.getCode())).toEqual([]);

		for (const generator of [referenceGenerator, tableGenerator]) {
			expect(await generator.generate(model, { overview: "expanded" })).toContain(
				"```typescript\nexport interface Root",
			);
		}
	});

	/**
	 * Asserts interfaces are expanded without a trailing semicolon.
	 */
	test("expanded interfaces", () => {
		const model = discover(`
			interface Child { name: string }
			export interface Root { child: Child }
		`);

		expect(formatOverview(model.root, "expanded")).toBe(
			"export interface Root {\n    child: {\n        name: string;\n    };\n}",
		);
	});

	/**
	 * Asserts types that are not object-like, or have no properties, are unchanged.
	 */
	test("expanded leaves non-object types unchanged", () => {
		const union = discover(`type A = { a: string }; export type Root = A | string;`);
		const empty = discover(`export type Root = {};`);

		expect(formatOverview(union.root, "expanded")).toBe(union.root.definition);
		expect(formatOverview(empty.root, "expanded")).toBe(empty.root.definition);
	});
	/**
	 * Asserts referenced object types have their own expanded definition, while enums and other types are unchanged.
	 */
	test("expanded applies to referenced types", () => {
		const types = new Map(model.types.map((type) => [type.name, type]));

		expect(formatOverview(types.get("Action")!, "expanded")).toBe(
			[
				"type Action = {",
				"    name: string;",
				"    kind: Kind.A;",
				"    states: {",
				"        image: string;",
				"        title?: string;",
				"    }[];",
				"    parent?: Action;",
				"};",
			].join("\n"),
		);
		expect(formatOverview(types.get("Action")!)).toBe(types.get("Action")!.definition);

		for (const name of ["Kind", "Union", "State"]) {
			expect(formatOverview(types.get(name)!, "expanded")).toBe(types.get(name)!.definition);
		}
	});
});

const generatorOverviewModel = discover(`
	enum Kind { A = "a" }
	type Child = { name: string; kind: Kind };
	type Parent = { child: Child };
	export type Root = { parent: Parent };
`);

describe.each([
	["flat", referenceGenerator],
	["table", tableGenerator],
] as const)("%s generator overview", (_, generator) => {
	const parent = "```typescript\ntype Parent = {\n    child: Child;\n};\n```";
	const expandedParent =
		"```typescript\ntype Parent = {\n    child: {\n        name: string;\n        kind: Kind;\n    };\n};\n```";

	/**
	 * Asserts the root overview is collapsed by default, and expanded when requested.
	 */
	test("respects the overview option", async () => {
		const collapsed = await generator.generate(generatorOverviewModel);
		const expanded = await generator.generate(generatorOverviewModel, { overview: "expanded" });

		expect(collapsed).toBe(await generator.generate(generatorOverviewModel, { overview: "collapsed" }));
		expect(collapsed).toContain("```typescript\nexport type Root = {\n    parent: Parent;\n};\n```");
		expect(expanded).toContain(
			"```typescript\nexport type Root = {\n    parent: {\n        child: {\n            name: string;\n            kind: Kind;\n        };\n    };\n};\n```",
		);
	});

	/**
	 * Asserts referenced object types are rendered with an overview that respects the overview option, and only their
	 * overviews change between styles.
	 */
	test("referenced object types render an overview", async () => {
		const collapsed = await generator.generate(generatorOverviewModel);
		const expanded = await generator.generate(generatorOverviewModel, { overview: "expanded" });

		expect(collapsed).toContain(`## \`Parent\` {#parent}\n\n${parent}`);
		expect(expanded).toContain(`## \`Parent\` {#parent}\n\n${expandedParent}`);
		expect(expanded).toContain(
			"## `Child` {#child}\n\n```typescript\ntype Child = {\n    name: string;\n    kind: Kind;\n};\n```",
		);

		const restored = generatorOverviewModel.types.reduce(
			(markdown, type) => markdown.replace(type.expandedDefinition, type.definition),
			expanded,
		);
		expect(restored).toBe(collapsed);
	});
});
