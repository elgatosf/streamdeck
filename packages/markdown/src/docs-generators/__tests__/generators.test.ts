import remarkParse from "remark-parse";
import { Project } from "ts-morph";
import { unified } from "unified";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { discoverTypes } from "../discovery/discover-types.js";
import type { DocsGenerator } from "../generators/generator.js";
import { referenceGenerator } from "../generators/reference.js";
import { tableGenerator } from "../generators/table.js";
import * as typescript from "../markdown/typescript.js";
import type { DocumentationModel, PropertyDocumentation, TypeDocumentation } from "../model.js";

/**
 * Creates a model, independent of discovery, where the root references an enum, an alias, and an object with a
 * property name that collides with a type name.
 * @returns Documentation model.
 */
function createModel(): DocumentationModel {
	const none = { text: "", tags: [] };
	const property = (
		name: string,
		type: string,
		references: TypeDocumentation[] = [],
		optional = false,
	): PropertyDocumentation => ({
		name,
		type,
		optional,
		readonly: false,
		description: { text: `The ${name} | with a pipe,\nand a new line.`, tags: [] },
		references,
		properties: [],
	});

	const os: TypeDocumentation = {
		name: "OS",
		kind: "enum",
		description: { text: "Operating system.", tags: [{ name: "since", text: "1.0" }] },
		definition: 'enum OS {\n    Mac = "mac"\n}',
		expandedDefinition: 'enum OS {\n    Mac = "mac"\n}',
		properties: [],
		members: [
			{ name: "Zulu", value: '"zulu"', description: none },
			{ name: "Mac", value: '"mac"', description: { text: "macOS.", tags: [] } },
			{ name: "Alpha", value: '"alpha"', description: none },
		],
		references: [],
	};
	const path: TypeDocumentation = {
		name: "Path",
		kind: "other",
		description: { text: "Path.", tags: [] },
		definition: "type Path = `${string}.html`;",
		expandedDefinition: "type Path = `${string}.html`;",
		properties: [],
		members: [],
		references: [],
	};
	const overview: TypeDocumentation = {
		name: "Root.overview",
		kind: "object",
		description: none,
		definition: "type Overview = {};",
		expandedDefinition: "type Overview = {};",
		properties: [property("name", "string")],
		members: [],
		references: [],
	};

	const properties = [property("path", "Path | Path[]", [path]), property("os", "OS", [os], true)];
	const root: TypeDocumentation = {
		name: "Root",
		kind: "object",
		description: { text: "The root.", tags: [] },
		definition: "export type Root = {\n    os?: OS;\n    path: Path | Path[];\n};",
		expandedDefinition: "export type Root = {\n    os?: OS;\n    path: Path | Path[];\n};",
		properties,
		members: [],
		references: [os, path],
	};

	return { root, types: [root, os, path, overview] };
}

/**
 * Gets the ids of the anchors in the Markdown.
 * @param markdown Markdown.
 * @returns Ids.
 */
function getIds(markdown: string): string[] {
	const headings = [...markdown.matchAll(/^#{1,6} .+ \{#([^}\s]+)\}$/gm)].map(([, id]) => id!);
	const rows = [...markdown.matchAll(/<a id="([^"]+)"><\/a>/g)].map(([, id]) => id!);
	return [...headings, ...rows];
}

/**
 * Discovers a type whose `font` property has an inline object type with a documented property.
 * @returns Documentation model.
 */
function discoverInlineFont(): DocumentationModel {
	const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true } });
	const source = project.createSourceFile(
		"/root.ts",
		`export interface Root {
			font?: {
				/** Font size in pixels. */
				size?: number;
			};
		}`,
	);
	return discoverTypes(source.getInterfaceOrThrow("Root"));
}

describe.each<[string, DocsGenerator]>([
	["flat", referenceGenerator],
	["table", tableGenerator],
])("%s generator", (_, generator) => {
	let markdown: string;

	beforeAll(async () => {
		markdown = await generator.generate(createModel());
	});

	/**
	 * Asserts every anchor is unique.
	 */
	test("anchors are unique", () => {
		const ids = getIds(markdown);
		expect(ids).toContain("root");
		expect(ids).toContain("os");
		expect(new Set(ids).size).toBe(ids.length);
		expect(ids.every((id) => /^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u.test(id))).toBe(true);
		expect(ids.every((id) => id === id.toLowerCase())).toBe(true);
	});

	/**
	 * Asserts every heading has a trailing custom ID that Markdown parsers expose as the last text node.
	 */
	test("headings have explicit ids", () => {
		const headings = unified()
			.use(remarkParse)
			.parse(markdown)
			.children.filter((node) => node.type === "heading");

		expect(headings.length).toBeGreaterThan(0);
		for (const heading of headings) {
			expect(heading.children.at(-1)).toMatchObject({
				type: "text",
				value: expect.stringMatching(/ \{#[\p{L}\p{M}\p{N}-]+\}$/u),
			});
		}
		expect(markdown).not.toMatch(/^<a id=/m);
	});

	/**
	 * Asserts every link targets an anchor within the documentation.
	 */
	test("links target anchors", () => {
		const ids = new Set(getIds(markdown));
		const links = [...markdown.matchAll(/\]\(#([^)]+)\)/g)].map(([, id]) => id!);

		expect(links.length).toBeGreaterThan(0);
		links.forEach((link) => expect(ids).toContain(link));
	});

	/**
	 * Asserts type headings are rendered as inline code.
	 */
	test("headings use inline code", () => {
		expect(markdown).toContain("# `Root` {#root}");
		expect(markdown).toContain("## `OS` {#os}");
	});

	/**
	 * Asserts filtered JSDoc tags are rendered with their text.
	 */
	test("filtered tags are rendered", () => {
		expect(markdown).toContain("**@since**\n\n1.0");
	});

	/**
	 * Asserts the definition of the root type is rendered within an overview.
	 */
	test("root definition is rendered as an overview", () => {
		expect(markdown).toContain(
			"## Overview {#root-overview}\n\n```typescript\nexport type Root = {\n    os?: OS;\n    path: Path | Path[];\n};\n```",
		);
	});

	/**
	 * Asserts anchors that collide with existing anchors, e.g. a type named after a property, are suffixed.
	 */
	test("anchors colliding with property anchors are suffixed", () => {
		expect(markdown).toContain("## `Root.overview` {#root-overview-2}");
		expect(getIds(markdown)).toContain("root-overview-2-name");
	});

	/**
	 * Asserts unusual property names produce safe IDs and collisions after normalization remain unique.
	 */
	test("normalizes property ids and resolves collisions", async () => {
		const model = createModel();
		const property = model.root.properties[0]!;
		const root = {
			...model.root,
			properties: ["Display.Name", "display name", '"><unsafe>'].map((name) => ({
				...property,
				name,
				type: "string",
				references: [],
			})),
		};
		const ids = getIds(await generator.generate({ root, types: [root] }));

		expect(ids).toEqual(expect.arrayContaining(["root-display-name", "root-display-name-2", "root-unsafe"]));
		expect(new Set(ids).size).toBe(ids.length);
	});

	/**
	 * Asserts types that are not object-like are rendered with their definition.
	 */
	test("non-object types render their definition", () => {
		expect(markdown).toContain("## `Path` {#path}\n\nPath.\n\n```typescript\ntype Path = `${string}.html`;\n```");
	});

	/**
	 * Asserts root and referenced type code blocks are formatted before being added to the documentation.
	 */
	test("formats type code blocks", async () => {
		const model = createModel();
		const root = { ...model.root, definition: "export type Root={\nos?:OS;\npath:Path|Path[];\n}" };
		const path = { ...model.types[2]!, definition: "type Path=`${string}.html`;" };
		const output = await generator.generate({ root, types: [root, path] });

		expect(output).toContain("```typescript\nexport type Root = {\n    os?: OS;\n    path: Path | Path[];\n};\n```");
		expect(output).toContain("```typescript\ntype Path = `${string}.html`;\n```");
	});

	/**
	 * Asserts headings are offset by the heading offset, and the content is otherwise unchanged.
	 */
	test("heading offset shifts headings", async () => {
		const offset = await generator.generate(createModel(), { headingOffset: 2 });
		const levels = (text: string): number[] => [...text.matchAll(/^(#+) /gm)].map(([, hashes]) => hashes!.length);

		expect(offset).toContain("### `Root` {#root}");
		expect(offset).toContain("#### `OS` {#os}");
		expect(levels(offset)).toEqual(levels(markdown).map((level) => level + 2));
		expect(offset.replace(/^#+ /gm, "")).toBe(markdown.replace(/^#+ /gm, ""));
		expect(await generator.generate(createModel(), { headingOffset: 0 })).toBe(markdown);
	});

	/**
	 * Asserts invalid heading offsets, and offsets that exceed the maximum heading level, throw.
	 */
	test("heading offset is validated", async () => {
		for (const headingOffset of [-1, 1.5, Number.NaN]) {
			await expect(generator.generate(createModel(), { headingOffset })).rejects.toThrow(
				`Heading offset must be a non-negative integer, but was ${headingOffset}.`,
			);
		}

		await expect(generator.generate(createModel(), { headingOffset: 6 })).rejects.toThrow(
			"Heading offset 6 exceeds the maximum heading level of 6",
		);
	});

	/**
	 * Asserts invalid generated TypeScript is reported rather than emitted unformatted.
	 */
	test("reports code formatting errors", async () => {
		const model = createModel();
		const root = { ...model.root, definition: "type Root = {" };

		await expect(generator.generate({ root, types: [root] })).rejects.toThrow("Unable to format TypeScript code block");
	});
});

describe("flat generator", () => {
	let markdown: string;

	beforeAll(async () => {
		markdown = await referenceGenerator.generate(createModel());
	});

	/**
	 * Asserts properties are rendered with their signature, requirement, description, and references.
	 */
	test("properties render their signature, requirement, description, and references", () => {
		expect(markdown).toContain(
			"### `os` {#root-os}\n\n```typescript\nos?: OS;\n```\n\n**Optional.**\n\nThe os | with a pipe,\nand a new line.\n\n**References:** [OS](#os).",
		);
		expect(markdown).toContain(
			"### `path` {#root-path}\n\n```typescript\npath: Path | Path[];\n```\n\n**Required.**\n\nThe path | with a pipe,\nand a new line.\n\n**References:** [Path](#path).",
		);
	});

	/**
	 * Asserts properties of inline object types are documented by their path, and each links to its parent.
	 */
	test("inline object properties are documented by their path, linking to their parent", async () => {
		const output = await referenceGenerator.generate(discoverInlineFont());

		expect(output).toContain(
			"### `font.size` {#root-font-size}\n\n```typescript\nsize?: number;\n```\n\n**Optional.**\n\n**Property of:** [`font`](#root-font).\n\nFont size in pixels.",
		);
		expect(output).not.toContain("type Property");
	});

	/**
	 * Asserts enums are rendered with their definition, and a heading for each member.
	 */
	test("enum definitions and members are rendered", () => {
		expect(markdown).toContain('```typescript\nenum OS {\n    Mac = "mac",\n}\n```');
		expect([...markdown.matchAll(/^### `(?:Alpha|Mac|Zulu)` \{#[^}]+\}$/gm)].map(([heading]) => heading)).toEqual([
			"### `Alpha` {#os-alpha}",
			"### `Mac` {#os-mac}",
			"### `Zulu` {#os-zulu}",
		]);
		expect(markdown).toContain('### `Mac` {#os-mac}\n\n```typescript\nMac = "mac",\n```\n\nmacOS.');
	});

	/**
	 * Asserts property and enum member code blocks are formatted in their TypeScript contexts.
	 */
	test("formats property and enum member code blocks", async () => {
		const model = createModel();
		const root = {
			...model.root,
			properties: [{ ...model.root.properties[0]!, type: "{name:string;id:number;}" }],
		};
		const os = {
			...model.types[1]!,
			members: [{ name: "Alpha", value: "1<<3", description: { text: "", tags: [] } }],
		};
		const output = await referenceGenerator.generate({ root, types: [root, os] });

		expect(output).toContain("```typescript\npath: { name: string; id: number };\n```");
		expect(output).toContain("```typescript\nAlpha = 1 << 3,\n```");
	});

	/**
	 * Asserts an invalid heading offset is rejected before any code block formatting starts.
	 */
	test("validates headings before formatting", async () => {
		const format = vi.spyOn(typescript, "typescriptCodeBlock");
		const model = createModel();
		const root = { ...model.root, definition: "type Root = {" };

		try {
			await expect(referenceGenerator.generate({ root, types: [root] }, { headingOffset: 4 })).rejects.toThrow(
				"Heading offset 4 exceeds the maximum heading level of 6",
			);
			expect(format).not.toHaveBeenCalled();
		} finally {
			format.mockRestore();
		}
	});
});

describe("table generator", () => {
	let markdown: string;

	beforeAll(async () => {
		markdown = await tableGenerator.generate(createModel());
	});

	/**
	 * Asserts properties are rendered as table rows, with pipes escaped and new lines collapsed.
	 */
	test("properties are rendered as rows, escaping pipes and new lines", () => {
		expect(markdown).toContain(
			"| Property | Type | Required | Description |\n| --- | --- | --- | --- |\n" +
				'| <a id="root-os"></a>`os` | `OS`<br>See [OS](#os) | No | The os \\| with a pipe, and a new line. |\n' +
				'| <a id="root-path"></a>`path` | `Path \\| Path[]`<br>See [Path](#path) | Yes | The path \\| with a pipe, and a new line. |',
		);
	});

	/**
	 * Asserts properties of inline object types are rendered as rows, identified by their path.
	 */
	test("inline object properties are rendered as rows by their path", async () => {
		const output = await tableGenerator.generate(discoverInlineFont());

		expect(output).toMatch(/\| <a id="root-font-size"><\/a>`font\.size` \| `number` \| No \| Font size in pixels\. \|/);
	});

	/**
	 * Asserts code blocks within descriptions keep their line breaks, as encoded newlines, within a table cell.
	 */
	test("multiline code examples retain their line boundaries in descriptions", async () => {
		const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true } });
		const source = project.createSourceFile(
			"/root.ts",
			`export interface Root {
				/**
				 * Example:
				 *
				 * \`\`\`ts
				 * // Keep the following statement separate.
				 * const first = 1;
				 * const second = 2;
				 * \`\`\`
				 */
				example: string;
			}`,
		);
		const output = await tableGenerator.generate(discoverTypes(source.getInterfaceOrThrow("Root")));

		expect(output).toContain("// Keep the following statement separate.&#10;const first = 1;&#10;const second = 2;");
	});

	/**
	 * Asserts enum members are rendered as table rows.
	 */
	test("enum members are rendered as rows", () => {
		expect(markdown).toContain(
			'| Member | Value | Description |\n| --- | --- | --- |\n| <a id="os-alpha"></a>`Alpha` | `"alpha"` |  |\n' +
				'| <a id="os-mac"></a>`Mac` | `"mac"` | macOS. |\n| <a id="os-zulu"></a>`Zulu` | `"zulu"` |  |',
		);
	});

	/**
	 * Asserts every table row has the number of columns of a property or member table.
	 */
	test("table rows have consistent columns", async () => {
		const rows = (await tableGenerator.generate(createModel())).split("\n").filter((line) => line.startsWith("|"));

		expect(rows.length).toBeGreaterThan(0);
		for (const row of rows) {
			const columns = row.replace(/\\\|/g, "").split("|").length - 2;
			expect([3, 4]).toContain(columns);
		}
	});
});
