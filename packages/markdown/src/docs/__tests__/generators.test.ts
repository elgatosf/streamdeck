import { describe, expect, test } from "vitest";

import type { DocsGenerator } from "../generators/generator.js";
import { referenceGenerator } from "../generators/reference.js";
import { tableGenerator } from "../generators/table.js";
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
	});

	const os: TypeDocumentation = {
		name: "OS",
		kind: "enum",
		description: { text: "Operating system.", tags: [{ name: "since", text: "1.0" }] },
		definition: 'enum OS {\n    Mac = "mac"\n}',
		properties: [],
		members: [{ name: "Mac", value: '"mac"', description: { text: "macOS.", tags: [] } }],
		references: [],
	};
	const path: TypeDocumentation = {
		name: "Path",
		kind: "other",
		description: { text: "Path.", tags: [] },
		definition: "type Path = `${string}.html`;",
		properties: [],
		members: [],
		references: [],
	};
	const overview: TypeDocumentation = {
		name: "Root.overview",
		kind: "object",
		description: none,
		definition: "type Root.overview = {};",
		properties: [property("name", "string")],
		members: [],
		references: [],
	};

	const properties = [property("os", "OS", [os], true), property("path", "Path | Path[]", [path])];
	const root: TypeDocumentation = {
		name: "Root",
		kind: "object",
		description: { text: "The root.", tags: [] },
		definition: "export type Root = {\n    os?: OS;\n    path: Path | Path[];\n};",
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
	return [...markdown.matchAll(/<a id="([^"]+)"><\/a>/g)].map(([, id]) => id!);
}

describe.each<[string, DocsGenerator]>([
	["flat", referenceGenerator],
	["table", tableGenerator],
])("%s generator", (_, generator) => {
	const markdown = generator.generate(createModel());

	test("anchors are unique", () => {
		const ids = getIds(markdown);
		expect(ids).toContain("Root");
		expect(ids).toContain("OS");
		expect(new Set(ids).size).toBe(ids.length);
	});

	test("links target anchors", () => {
		const ids = new Set(getIds(markdown));
		const links = [...markdown.matchAll(/\]\(#([^)]+)\)/g)].map(([, id]) => id!);

		expect(links.length).toBeGreaterThan(0);
		links.forEach((link) => expect(ids).toContain(link));
	});

	test("headings use inline code", () => {
		expect(markdown).toContain("# `Root`");
		expect(markdown).toContain("## `OS`");
	});

	test("filtered tags are rendered", () => {
		expect(markdown).toContain("**@since**\n\n1.0");
	});

	test("root definition is rendered as an overview", () => {
		expect(markdown).toContain(
			'<a id="Root.overview"></a>\n\n## Overview\n\n```typescript\nexport type Root = {\n    os?: OS;\n    path: Path | Path[];\n};\n```',
		);
	});

	test("anchors colliding with property anchors are suffixed", () => {
		expect(markdown).toContain('<a id="Root.overview-2"></a>\n\n## `Root.overview`');
		expect(markdown).toContain('<a id="Root.overview-2.name"></a>');
	});

	test("non-object types render their definition", () => {
		expect(markdown).toContain("## `Path`\n\nPath.\n\n```typescript\ntype Path = `${string}.html`;\n```");
	});
});

describe("flat generator", () => {
	const markdown = referenceGenerator.generate(createModel());

	test("properties render their signature, requirement, description, and references", () => {
		expect(markdown).toContain(
			'<a id="Root.os"></a>\n\n### `os`\n\n```typescript\nos?: OS;\n```\n\n**Optional.**\n\nThe os | with a pipe,\nand a new line.\n\n**References:** [OS](#OS).',
		);
		expect(markdown).toContain(
			"### `path`\n\n```typescript\npath: Path | Path[];\n```\n\n**Required.**\n\nThe path | with a pipe,\nand a new line.\n\n**References:** [Path](#Path).",
		);
	});

	test("enum definitions and members are rendered", () => {
		expect(markdown).toContain('```typescript\nenum OS {\n    Mac = "mac"\n}\n```');
		expect(markdown).toContain('<a id="OS.Mac"></a>\n\n### `Mac`\n\n```typescript\nMac = "mac"\n```\n\nmacOS.');
	});
});

describe("table generator", () => {
	const markdown = tableGenerator.generate(createModel());

	test("properties are rendered as rows, escaping pipes and new lines", () => {
		expect(markdown).toContain(
			"| Property | Type | Required | Description |\n| --- | --- | --- | --- |\n" +
				'| <a id="Root.os"></a>`os` | `OS`<br>See [OS](#OS) | No | The os \\| with a pipe, and a new line. |\n' +
				'| <a id="Root.path"></a>`path` | `Path \\| Path[]`<br>See [Path](#Path) | Yes | The path \\| with a pipe, and a new line. |',
		);
	});

	test("enum members are rendered as rows", () => {
		expect(markdown).toContain(
			'| Member | Value | Description |\n| --- | --- | --- |\n| <a id="OS.Mac"></a>`Mac` | `"mac"` | macOS. |',
		);
	});

	test("table rows have consistent columns", () => {
		const rows = tableGenerator
			.generate(createModel())
			.split("\n")
			.filter((line) => line.startsWith("|"));

		expect(rows.length).toBeGreaterThan(0);
		for (const row of rows) {
			const columns = row.replace(/\\\|/g, "").split("|").length - 2;
			expect([3, 4]).toContain(columns);
		}
	});
});
