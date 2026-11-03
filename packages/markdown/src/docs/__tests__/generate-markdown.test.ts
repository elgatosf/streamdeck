import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterAll, beforeAll, describe, expect, expectTypeOf, test, vi } from "vitest";

import * as markdown from "../../index.js";
import { createDocumentationSource, generateMarkdown, type GenerateMarkdownOptions } from "../../index.js";
import * as discovery from "../discovery/discover-types.js";
import { discoverTypesFromFile } from "../discovery/discover-types.js";
import { referenceGenerator } from "../generators/reference.js";
import { tableGenerator } from "../generators/table.js";

describe("generateMarkdown", () => {
	let directory = "";
	let src = "";
	let tsconfigFile = "";

	beforeAll(() => {
		directory = mkdtempSync(join(tmpdir(), "markdown-docs-"));
		src = join(directory, "root.ts");
		tsconfigFile = join(directory, "tsconfig.json");

		writeFileSync(
			src,
			`import type { Detail } from "@docs/detail";

/**
 * Root documentation.
 * @deprecated Use NewRoot.
 * @custom Custom documentation.
 * @filePath Hidden file tag.
 * @example Hidden example.
 */
export interface Root {
	/** The detail. */
	detail: Detail;
	name?: string;
}`,
		);
		writeFileSync(
			join(directory, "detail.ts"),
			`/** A referenced detail. */
export interface Detail {
	label: string;
}`,
		);
		writeFileSync(
			tsconfigFile,
			JSON.stringify({
				compilerOptions: {
					module: "ESNext",
					moduleResolution: "Bundler",
					strict: true,
					baseUrl: ".",
					paths: { "@docs/*": ["./*"] },
				},
			}),
		);
	});

	afterAll(() => {
		if (directory !== "") {
			rmSync(directory, { recursive: true, force: true });
		}
	});

	test("exposes the simplified public API", () => {
		expect(Object.keys(markdown).sort()).toEqual(["createDocumentationSource", "generateMarkdown", "typeCheck"]);
		expectTypeOf<GenerateMarkdownOptions["format"]>().toEqualTypeOf<"flat" | "table">();
		expectTypeOf(generateMarkdown).returns.toEqualTypeOf<string>();
	});

	test.each([
		{
			format: "flat",
			generator: referenceGenerator,
			property: "### `detail`",
			link: "**References:** [Detail](#Detail).",
		},
		{
			format: "table",
			generator: tableGenerator,
			property: "| Property | Type | Required | Description |",
			link: "See [Detail](#Detail)",
		},
	] as const)("returns $format documentation", ({ format, generator, property, link }) => {
		const before = readdirSync(directory).sort();
		const result = generateMarkdown({ src, typeName: "Root", format, tsconfigFile });
		const model = discoverTypesFromFile({ filePath: src, typeName: "Root", tsConfigFilePath: tsconfigFile });

		expect(result).toBe(generator.generate(model));
		expect(result).toContain("# `Root`");
		expect(result).toContain("## Overview");
		expect(result).toContain("export interface Root {");
		expect(result).toContain(property);
		expect(result).toContain(link);
		expect(result).toContain("## `Detail`");
		expect(result).toContain("**@deprecated**");
		expect(result).not.toContain("Custom documentation.");
		expect(result).not.toContain("Hidden file tag.");
		expect(result).not.toContain("Hidden example.");
		expect(readdirSync(directory).sort()).toEqual(before);
	});

	test("resolves relative source paths from the current working directory", () => {
		const options = { typeName: "Root", format: "flat", tsconfigFile } as const;
		expect(generateMarkdown({ ...options, src: relative(process.cwd(), src) })).toBe(
			generateMarkdown({ ...options, src }),
		);
	});

	test("uses the supplied tsconfig to resolve referenced types", () => {
		const options = { src, typeName: "Root", format: "flat" } as const;
		expect(generateMarkdown(options)).not.toContain("## `Detail`");
		expect(generateMarkdown({ ...options, tsconfigFile })).toContain("## `Detail`");
	});

	test("passes custom JSDoc tags to discovery", () => {
		const result = generateMarkdown({ src, typeName: "Root", format: "flat", tsconfigFile, tags: ["custom"] });

		expect(result).toContain("**@custom**");
		expect(result).toContain("Custom documentation.");
		expect(result).not.toContain("**@deprecated**");
		expect(result).not.toContain("Hidden example.");
	});

	test.each(["html", "constructor", "__proto__"])("rejects unsupported format %s", (format) => {
		expect(() =>
			// @ts-expect-error Deliberately test invalid input from an untyped caller.
			generateMarkdown({ src, typeName: "Root", format }),
		).toThrow(`Unsupported documentation format "${format}".`);
	});

	test("reports missing types and files", () => {
		expect(() => generateMarkdown({ src, typeName: "Missing", format: "flat" })).toThrow(
			`Unable to find type "Missing" in ${src}.`,
		);
		expect(() => generateMarkdown({ src: join(directory, "missing.ts"), typeName: "Root", format: "table" })).toThrow(
			"missing.ts",
		);
		expect(() =>
			generateMarkdown({ src, typeName: "Root", format: "table", tsconfigFile: join(directory, "missing.json") }),
		).toThrow("missing.json");
	});
});

describe("createDocumentationSource", () => {
	let directory = "";
	let src = "";

	beforeAll(() => {
		directory = mkdtempSync(join(tmpdir(), "markdown-source-"));
		src = join(directory, "index.ts");

		writeFileSync(join(directory, "manifest.ts"), "/** The manifest. */\nexport interface Manifest { name: string }");
		writeFileSync(join(directory, "layout.ts"), "/** The layout. */\nexport type Layout = { id: string };");
		writeFileSync(src, 'export * from "./manifest.js";\nexport type { Layout } from "./layout.js";');
	});

	afterAll(() => {
		if (directory !== "") {
			rmSync(directory, { recursive: true, force: true });
		}
	});

	test("generates multiple types and formats from a single source", () => {
		const source = createDocumentationSource({ src });

		for (const typeName of ["Manifest", "Layout"]) {
			for (const format of ["flat", "table"] as const) {
				expect(source.generate(typeName, format)).toBe(generateMarkdown({ src, typeName, format }));
			}
		}
	});

	test("discovers each type once", () => {
		const loadSourceFile = vi.spyOn(discovery, "loadSourceFile");
		const discoverTypes = vi.spyOn(discovery, "discoverTypes");

		try {
			const source = createDocumentationSource({ src });
			source.generate("Manifest", "flat");
			source.generate("Manifest", "table");
			source.generate("Layout", "flat");

			expect(loadSourceFile).toHaveBeenCalledOnce();
			expect(discoverTypes).toHaveBeenCalledTimes(2);
		} finally {
			vi.restoreAllMocks();
		}
	});

	test("reports missing types and unsupported formats", () => {
		const source = createDocumentationSource({ src });

		expect(() => source.generate("Missing", "flat")).toThrow(`Unable to find type "Missing" in ${src}.`);
		expect(() =>
			// @ts-expect-error Deliberately test invalid input from an untyped caller.
			source.generate("Manifest", "html"),
		).toThrow('Unsupported documentation format "html".');
	});
});
