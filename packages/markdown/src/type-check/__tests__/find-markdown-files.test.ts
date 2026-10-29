import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { findMarkdownFiles } from "../find-markdown-files.js";

const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

/**
 * Gets the absolute paths of the fixtures.
 * @param fileNames Names of the fixtures.
 * @returns The absolute paths.
 */
function fixtures(...fileNames: string[]): string[] {
	return fileNames.map((fileName) => join(FIXTURES_DIR, fileName));
}

describe("findMarkdownFiles", () => {
	/**
	 * Provides assertions for matching the static markdown fixtures.
	 */
	describe("fixtures", () => {
		/**
		 * Asserts a pattern of a file name matches the file, returning its absolute path.
		 */
		test("file name", async () => {
			expect(await findMarkdownFiles("semantic-error.md", FIXTURES_DIR)).toEqual(fixtures("semantic-error.md"));
		});

		/**
		 * Asserts a wildcard matches all files with the extension, sorted by path.
		 */
		test("wildcard", async () => {
			expect(await findMarkdownFiles("*.md", FIXTURES_DIR)).toEqual(
				fixtures(
					"deeply-nested.md",
					"empty.md",
					"implicit-any.md",
					"imports.md",
					"javascript-only.md",
					"languages.md",
					"meta.md",
					"multiple-errors.md",
					"nested.md",
					"no-code-blocks.md",
					"semantic-error.md",
					"syntax-error.md",
					"unclosed-fence.md",
					"uneven-indentation.md",
					"valid.md",
				),
			);
		});

		/**
		 * Asserts braces match each of the alternatives, sorted by path regardless of the order within the pattern.
		 */
		test("braces", async () => {
			expect(await findMarkdownFiles("{valid,meta,empty}.md", FIXTURES_DIR)).toEqual(
				fixtures("empty.md", "meta.md", "valid.md"),
			);
		});

		/**
		 * Asserts files that are not markdown are not matched.
		 */
		test("non-markdown files are excluded", async () => {
			await expect(findMarkdownFiles("tsconfig*.json", FIXTURES_DIR)).rejects.toThrow(/^No markdown files found/);
		});

		/**
		 * Asserts only the markdown files are returned when a pattern matches files with other extensions.
		 */
		test("mixed extensions", async () => {
			expect(await findMarkdownFiles("{meta.md,math.ts,tsconfig.json}", FIXTURES_DIR)).toEqual(fixtures("meta.md"));
		});

		/**
		 * Asserts the pattern is resolved from the cwd, and not the current working directory of the process.
		 */
		test("pattern is relative to cwd", async () => {
			const fromParent = await findMarkdownFiles("fixtures/meta.md", import.meta.dirname);

			expect(fromParent).toEqual(fixtures("meta.md"));
		});

		/**
		 * Asserts a relative cwd is resolved from the current working directory of the process.
		 */
		test("relative cwd", async () => {
			expect(await findMarkdownFiles("meta.md", relative(process.cwd(), FIXTURES_DIR))).toEqual(fixtures("meta.md"));
		});

		/**
		 * Asserts an absolute pattern is matched, regardless of the cwd.
		 */
		test("absolute pattern", async () => {
			const pattern = join(FIXTURES_DIR, "meta.md").replaceAll("\\", "/");

			expect(await findMarkdownFiles(pattern, tmpdir())).toEqual(fixtures("meta.md"));
		});

		/**
		 * Asserts a pattern without any matching files throws, including the resolved cwd within the message.
		 */
		test("no matching files throws", async () => {
			await expect(findMarkdownFiles("does-not-exist/*.md", FIXTURES_DIR)).rejects.toThrow(
				`No markdown files found matching: does-not-exist/*.md (cwd: ${FIXTURES_DIR})`,
			);
		});
	});

	/**
	 * Provides assertions for directories, using a temporary directory as they cannot be represented as static
	 * fixtures (e.g. empty directories are not tracked by git).
	 */
	describe("directories", () => {
		let cwd: string;

		beforeAll(() => {
			cwd = mkdtempSync(join(tmpdir(), "md-tools-find-markdown-files-"));

			mkdirSync(join(cwd, "docs", "nested"), { recursive: true });
			mkdirSync(join(cwd, "folder.md"));
			mkdirSync(join(cwd, "node_modules", "pkg"), { recursive: true });

			writeFileSync(join(cwd, "README.md"), "# Root");
			writeFileSync(join(cwd, "docs", "guide.md"), "# Guide");
			writeFileSync(join(cwd, "docs", "nested", "deep.md"), "# Deep");
			writeFileSync(join(cwd, "node_modules", "pkg", "README.md"), "# Dependency");
		});

		afterAll(() => {
			rmSync(cwd, { force: true, recursive: true });
		});

		/**
		 * Asserts directories matching the pattern are not returned.
		 */
		test("only files are matched", async () => {
			expect(await findMarkdownFiles("*.md", cwd)).toEqual([join(cwd, "README.md")]);
		});

		/**
		 * Asserts a globstar matches files within nested directories.
		 */
		test("globstar", async () => {
			expect(await findMarkdownFiles("**/*.md", cwd)).toEqual([
				join(cwd, "README.md"),
				join(cwd, "docs", "guide.md"),
				join(cwd, "docs", "nested", "deep.md"),
				join(cwd, "node_modules", "pkg", "README.md"),
			]);
		});

		/**
		 * Asserts dependency markdown is included when the glob explicitly enters node_modules.
		 */
		test("node_modules is included when matched", async () => {
			const dependencyReadme = join(cwd, "node_modules", "pkg", "README.md");

			expect(await findMarkdownFiles("node_modules/**/*.md", cwd)).toEqual([dependencyReadme]);
			expect(await findMarkdownFiles("node_modules/pkg/README.md", cwd)).toEqual([dependencyReadme]);
		});

		/**
		 * Asserts only `.md` and `.mdx` files are matched, regardless of the casing of their extension.
		 */
		test("markdown and MDX files", async () => {
			// Arrange.
			const mixed = mkdtempSync(join(tmpdir(), "md-tools-find-markdown-files-mixed-"));
			for (const fileName of ["a.md", "b.mdx", "C.MD", "d.txt", "e.markdown", "f.md.bak"]) {
				writeFileSync(join(mixed, fileName), "# Mixed");
			}

			try {
				// Act, assert.
				expect(await findMarkdownFiles("*", mixed)).toEqual([
					join(mixed, "C.MD"),
					join(mixed, "a.md"),
					join(mixed, "b.mdx"),
				]);
			} finally {
				rmSync(mixed, { force: true, recursive: true });
			}
		});
	});
});
