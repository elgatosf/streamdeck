import { join, relative } from "node:path";

import { describe, expect, test } from "vitest";

import { readCodeBlocks } from "../read-code-blocks.js";
import type { TypeScriptDiagnostic } from "../ts-diagnostic.js";
import { typeCheckCodeBlocks } from "../type-check-code-blocks.js";

const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

/**
 * Type checks the code blocks within the markdown fixture.
 * @param fileName Name of the markdown fixture.
 * @param tsconfigFile tsconfig file, relative to the fixtures directory.
 * @returns The diagnostics.
 */
async function check(fileName: string, tsconfigFile = "tsconfig.json"): Promise<TypeScriptDiagnostic[]> {
	return typeCheckCodeBlocks({
		codeBlocks: await readCodeBlocks(join(FIXTURES_DIR, fileName)),
		cwd: FIXTURES_DIR,
		tsconfigFile,
	});
}

/**
 * Gets the expected link to the location within the markdown fixture.
 * @param fileName Name of the markdown fixture.
 * @param line 1-based line.
 * @param column 1-based column.
 * @returns The link.
 */
function linkTo(fileName: string, line: number, column: number): string {
	return `${relative(process.cwd(), join(FIXTURES_DIR, fileName)).replaceAll("\\", "/")}:${line}:${column}`;
}

describe("typeCheckCodeBlocks", () => {
	describe("valid code", () => {
		test("no code blocks", async () => {
			expect(await check("no-code-blocks.md")).toEqual([]);
		});

		test("no TypeScript code blocks does not read the tsconfig", async () => {
			expect(await check("javascript-only.md", "missing.json")).toEqual([]);
		});

		test("valid code blocks, imports resolved relative to cwd, and each code block is its own module", async () => {
			expect(await check("valid.md")).toEqual([]);
		});
	});

	describe("diagnostics", () => {
		test("semantic error", async () => {
			expect(await check("semantic-error.md")).toEqual<TypeScriptDiagnostic[]>([
				{
					category: "error",
					code: 2322,
					column: 7,
					line: 4,
					link: linkTo("semantic-error.md", 4, 7),
					message: "Type 'string' is not assignable to type 'number'.",
				},
			]);
		});

		test("syntax error", async () => {
			const [diagnostic] = await check("syntax-error.md");

			expect(diagnostic).toMatchObject({ category: "error", line: 4 });
		});

		test("imports", async () => {
			expect(await check("imports.md")).toMatchObject([
				{ code: 2345, link: linkTo("imports.md", 6, 8) },
				{ code: 2307, link: linkTo("imports.md", 10, 21) },
			]);
		});

		test("multiple errors within, and across, code blocks", async () => {
			expect((await check("multiple-errors.md")).map((d) => d.link)).toEqual([
				linkTo("multiple-errors.md", 4, 7),
				linkTo("multiple-errors.md", 5, 7),
				linkTo("multiple-errors.md", 12, 7),
			]);
		});

		test("code blocks from multiple files are linked to their own file", async () => {
			// Arrange.
			const entries = [
				...(await readCodeBlocks(join(FIXTURES_DIR, "semantic-error.md"))),
				...(await readCodeBlocks(join(FIXTURES_DIR, "multiple-errors.md"))),
			];

			// Act.
			const diagnostics = typeCheckCodeBlocks({
				codeBlocks: entries,
				cwd: FIXTURES_DIR,
				tsconfigFile: "tsconfig.json",
			});

			// Assert.
			expect(diagnostics.map((d) => d.link)).toEqual([
				linkTo("semantic-error.md", 4, 7),
				linkTo("multiple-errors.md", 4, 7),
				linkTo("multiple-errors.md", 5, 7),
				linkTo("multiple-errors.md", 12, 7),
			]);
		});
	});

	describe("positions", () => {
		test("code blocks within a list, a blockquote, and at the top-level", async () => {
			expect((await check("nested.md")).map((d) => d.link)).toEqual([
				linkTo("nested.md", 7, 11),
				linkTo("nested.md", 11, 9),
				linkTo("nested.md", 15, 7),
			]);
		});
	});

	describe("languages", () => {
		test("only TypeScript code blocks are type checked", async () => {
			// ts, typescript, tsx, mts, cts, TS, TypeScript; js, javascript, json, sh, unlabelled, and indented are not.
			expect((await check("languages.md")).map((d) => d.line)).toEqual([4, 8, 12, 16, 20, 24, 28]);
		});
	});

	describe("tsconfig", () => {
		test("compiler options are respected", async () => {
			expect(await check("implicit-any.md", "tsconfig.json")).toMatchObject([{ code: 7006 }]);
			expect(await check("implicit-any.md", "tsconfig.loose.json")).toEqual([]);
		});

		test("missing tsconfig throws", async () => {
			await expect(check("semantic-error.md", "missing.json")).rejects.toThrow(/^Failed to read tsconfig file:/);
		});

		test("invalid tsconfig throws", async () => {
			await expect(check("semantic-error.md", "tsconfig.invalid.json")).rejects.toThrow(/^Invalid tsconfig file:/);
		});
	});
});
