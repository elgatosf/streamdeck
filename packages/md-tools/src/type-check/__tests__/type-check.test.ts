import { join, relative } from "node:path";

import { describe, expect, test } from "vitest";

import type { CodeBlockDiagnostic } from "../code-block-diagnostic.js";
import { typeCheck } from "../type-check.js";

const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

/**
 * Type checks the markdown files within the fixtures directory matching the glob pattern.
 * @param source Glob pattern, relative to the fixtures directory.
 * @returns The diagnostics.
 */
function check(source: string): Promise<CodeBlockDiagnostic[]> {
	return typeCheck({
		cwd: FIXTURES_DIR,
		src: source,
		tsconfigFile: "tsconfig.json",
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

describe("typeCheck", () => {
	/**
	 * Asserts a pattern matching a single file type checks that file.
	 */
	test("single file", async () => {
		expect((await check("semantic-error.md")).map((d) => d.link)).toEqual([linkTo("semantic-error.md", 4, 7)]);
	});

	/**
	 * Asserts a pattern matching multiple files type checks each file, with diagnostics ordered by file path.
	 */
	test("multiple files", async () => {
		expect((await check("{semantic-error,multiple-errors,valid}.md")).map((d) => d.link)).toEqual([
			linkTo("multiple-errors.md", 4, 7),
			linkTo("multiple-errors.md", 5, 7),
			linkTo("multiple-errors.md", 12, 7),
			linkTo("semantic-error.md", 4, 7),
		]);
	});

	/**
	 * Asserts a wildcard pattern only matches files, and diagnostics are reported for every matching file.
	 */
	test("wildcard", async () => {
		// Arrange.
		const expected = [
			"implicit-any.md",
			"imports.md",
			"languages.md",
			"multiple-errors.md",
			"nested.md",
			"semantic-error.md",
			"syntax-error.md",
		].map((fileName) => relative(process.cwd(), join(FIXTURES_DIR, fileName)).replaceAll("\\", "/"));

		// Act.
		const diagnostics = await check("*.md");

		// Assert.
		expect([...new Set(diagnostics.map((d) => d.link.replace(/:\d+:\d+$/, "")))]).toEqual(expected);
	});

	/**
	 * Asserts a pattern without any matching files throws.
	 */
	test("no matching files throws", async () => {
		await expect(check("does-not-exist/*.md")).rejects.toThrow(/^No markdown files found matching:/);
	});
});
