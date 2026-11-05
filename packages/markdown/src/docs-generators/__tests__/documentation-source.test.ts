import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterAll, beforeAll, describe, expect, expectTypeOf, test, vi } from "vitest";

import * as markdown from "../../index.js";
import { createDocumentationSource, type DocumentationOptions, type DocumentationSource } from "../../index.js";
import * as discovery from "../discovery/discover-types.js";
import { referenceGenerator } from "../generators/reference.js";
import { tableGenerator } from "../generators/table.js";

describe("createDocumentationSource", () => {
	let directory = "";
	let src = "";
	let tsconfigFile = "";
	let source: DocumentationSource;

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
					lib: ["ESNext"],
					baseUrl: ".",
					paths: { "@docs/*": ["./*"] },
				},
			}),
		);

		// The root fixture is unchanged between tests, so formats can share the source and its cached discovery model.
		source = createDocumentationSource({ src, tsconfigFile });
	});

	afterAll(() => {
		if (directory !== "") {
			rmSync(directory, { recursive: true, force: true });
		}
	});

	/**
	 * Asserts the public API exposes the reusable source, not a one-off generation function.
	 */
	test("exposes the reusable source API", () => {
		expect(Object.keys(markdown).sort()).toEqual(["createDocumentationSource", "format", "typeCheck"]);
		expectTypeOf<DocumentationOptions["format"]>().toEqualTypeOf<"flat" | "table">();
		expectTypeOf<DocumentationSource["generate"]>().returns.toEqualTypeOf<Promise<string>>();
	});

	/**
	 * Asserts each format renders the type and its references without writing files.
	 */
	test.each([
		{
			format: "flat",
			generator: referenceGenerator,
			property: "### `detail`",
			link: "**References:** [Detail](#detail).",
		},
		{
			format: "table",
			generator: tableGenerator,
			property: "| Property | Type | Required | Description |",
			link: "See [Detail](#detail)",
		},
	] as const)("generates $format documentation", async ({ format, generator, property, link }) => {
		const generate = vi.spyOn(generator, "generate");

		try {
			const result = await source.generate({ typeName: "Root", format });

			expect(generate).toHaveBeenCalledOnce();
			expect(result).toBe(await generate.mock.results[0]!.value);
			expect(result).toContain("# `Root` {#root}");
			expect(result).toContain("## Overview {#root-overview}");
			expect(result).toContain("export interface Root {");
			expect(result).toContain(property);
			expect(result).toContain(link);
			expect(result).toContain("## `Detail` {#detail}");
			expect(result).toContain("**@deprecated**");
			expect(result).not.toContain("Custom documentation.");
			expect(result).not.toContain("Hidden file tag.");
			expect(result).not.toContain("Hidden example.");
		} finally {
			generate.mockRestore();
		}
	});

	/**
	 * Asserts relative source paths are resolved from the current working directory.
	 */
	test("resolves relative source paths from the current working directory", async () => {
		const source = createDocumentationSource({ src: relative(process.cwd(), src), tsconfigFile });
		expect(await source.generate({ typeName: "Root", format: "flat" })).toContain("# `Root` {#root}");
	});

	/**
	 * Asserts the supplied tsconfig is used to resolve types referenced by the source.
	 */
	test("uses the supplied tsconfig to resolve referenced types", async () => {
		const withoutConfig = createDocumentationSource({ src });

		expect(await withoutConfig.generate({ typeName: "Root", format: "flat" })).not.toContain("## `Detail`");
		expect(await source.generate({ typeName: "Root", format: "flat" })).toContain("## `Detail`");
	});

	/**
	 * Asserts custom JSDoc tags replace the default tags.
	 */
	test("passes custom JSDoc tags to discovery", async () => {
		const source = createDocumentationSource({ src, tsconfigFile, tags: ["custom"] });
		const result = await source.generate({ typeName: "Root", format: "flat" });

		expect(result).toContain("**@custom**");
		expect(result).toContain("Custom documentation.");
		expect(result).not.toContain("**@deprecated**");
		expect(result).not.toContain("Hidden example.");
	});

	/**
	 * Asserts one-shot tag iterables are read once, so they apply to every generated type.
	 */
	test("reuses one-shot tag iterables for every requested root", async () => {
		const sourceFile = join(directory, "multiple.ts");
		writeFileSync(
			sourceFile,
			"/** @custom alpha */\nexport interface Alpha { a: string }\n/** @custom beta */\nexport interface Beta { b: string }",
		);
		const source = createDocumentationSource({ src: sourceFile, tags: new Set(["custom"]).values() });

		for (const typeName of ["Alpha", "Beta"]) {
			expect(await source.generate({ typeName, format: "flat" })).toContain("**@custom**");
		}
	});

	/**
	 * Asserts overview and heading offset options are passed to the selected generator.
	 */
	test("passes generation options to the generator", async () => {
		const options = { overview: "expanded", headingOffset: 2 } as const;

		for (const [format, generator] of [
			["flat", referenceGenerator],
			["table", tableGenerator],
		] as const) {
			const generate = vi.spyOn(generator, "generate");

			try {
				const result = await source.generate({ ...options, typeName: "Root", format });

				expect(generate).toHaveBeenCalledOnce();
				expect(generate).toHaveBeenCalledWith(
					expect.objectContaining({ root: expect.objectContaining({ name: "Root" }) }),
					options,
				);
				expect(result).toBe(await generate.mock.results[0]!.value);
				expect(result).toContain("### `Root` {#root}");
				expect(result).toContain("detail: {\n        label: string;\n    };");
			} finally {
				generate.mockRestore();
			}
		}
	});

	/**
	 * Asserts unsupported formats throw, including names of properties inherited from `Object`.
	 */
	test.each(["html", "constructor", "__proto__"])("rejects unsupported format %s", async (format) => {
		await expect(
			// @ts-expect-error Deliberately test invalid input from an untyped caller.
			source.generate({ typeName: "Root", format }),
		).rejects.toThrow(`Unsupported documentation format "${format}".`);
	});

	/**
	 * Asserts missing types reject generation, while missing source and tsconfig files fail during source creation.
	 */
	test("reports missing types and files", async () => {
		await expect(source.generate({ typeName: "Missing", format: "flat" })).rejects.toThrow(
			`Unable to find type "Missing" in ${src}.`,
		);
		expect(() => createDocumentationSource({ src: join(directory, "missing.ts") })).toThrow("missing.ts");
		expect(() => createDocumentationSource({ src, tsconfigFile: join(directory, "missing.json") })).toThrow(
			"missing.json",
		);
	});

	let indexDirectory = "";
	let indexSrc = "";

	beforeAll(() => {
		indexDirectory = mkdtempSync(join(tmpdir(), "markdown-source-"));
		indexSrc = join(indexDirectory, "index.ts");

		writeFileSync(
			join(indexDirectory, "manifest.ts"),
			"/** The manifest. */\nexport interface Manifest { name: string }",
		);
		writeFileSync(join(indexDirectory, "layout.ts"), "/** The layout. */\nexport type Layout = { id: string };");
		writeFileSync(indexSrc, 'export * from "./manifest.js";\nexport type { Layout } from "./layout.js";');
	});

	afterAll(() => {
		if (indexDirectory !== "") {
			rmSync(indexDirectory, { recursive: true, force: true });
		}
	});

	/**
	 * Asserts multiple re-exported types and formats can be generated from one source.
	 */
	test("generates multiple types and formats from a single source", async () => {
		const source = createDocumentationSource({ src: indexSrc });

		for (const typeName of ["Manifest", "Layout"]) {
			for (const format of ["flat", "table"] as const) {
				const result = await source.generate({ typeName, format });
				expect(result).toContain(`# \`${typeName}\` {#${typeName.toLowerCase()}}`);
			}
		}
	});

	/**
	 * Asserts the source file is loaded once, and each type is discovered once regardless of the formats generated.
	 */
	test("discovers each type once", async () => {
		const loadSourceFile = vi.spyOn(discovery, "loadSourceFile");
		const discoverTypes = vi.spyOn(discovery, "discoverTypes");

		try {
			const source = createDocumentationSource({ src: indexSrc });
			await Promise.all([
				source.generate({ typeName: "Manifest", format: "flat" }),
				source.generate({ typeName: "Manifest", format: "table" }),
				source.generate({ typeName: "Layout", format: "flat" }),
			]);

			expect(loadSourceFile).toHaveBeenCalledOnce();
			expect(discoverTypes).toHaveBeenCalledTimes(2);
		} finally {
			vi.restoreAllMocks();
		}
	});

	/**
	 * Asserts missing types and unsupported formats throw.
	 */
	test("reports missing types and unsupported formats", async () => {
		const source = createDocumentationSource({ src: indexSrc });

		await expect(source.generate({ typeName: "Missing", format: "flat" })).rejects.toThrow(
			`Unable to find type "Missing" in ${indexSrc}.`,
		);
		await expect(
			// @ts-expect-error Deliberately test invalid input from an untyped caller.
			source.generate({ typeName: "Manifest", format: "html" }),
		).rejects.toThrow('Unsupported documentation format "html".');
	});
});
