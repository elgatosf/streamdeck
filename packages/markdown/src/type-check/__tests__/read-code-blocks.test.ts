import { join, relative } from "node:path";

import { beforeAll, describe, expect, test } from "vitest";

import { type CodeBlock, readCodeBlocks } from "../read-code-blocks.js";

const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

/**
 * Reads the code blocks within the markdown fixture.
 * @param fileName Name of the markdown fixture.
 * @returns The code blocks.
 */
function read(fileName: string): Promise<CodeBlock[]> {
	return readCodeBlocks(join(FIXTURES_DIR, fileName));
}

/**
 * Reads the code blocks within the markdown fixture, asserting there is exactly one.
 * @param fileName Name of the markdown fixture.
 * @returns The code block.
 */
async function readSingle(fileName: string): Promise<CodeBlock> {
	const entries = await read(fileName);
	expect(entries).toHaveLength(1);
	return entries[0] as CodeBlock;
}

describe("readCodeBlocks", () => {
	/**
	 * Asserts an empty document has no code blocks.
	 */
	test("empty markdown", async () => {
		expect(await read("empty.md")).toEqual([]);
	});

	/**
	 * Asserts headings, paragraphs, and inline code are not treated as code blocks.
	 */
	test("markdown without code blocks", async () => {
		expect(await read("no-code-blocks.md")).toEqual([]);
	});

	/**
	 * Asserts a fenced code block is found, including its file, language, code, and position within the document.
	 */
	test("fenced code block", async () => {
		// Arrange, act.
		const entry = await readSingle("semantic-error.md");

		// Assert.
		expect(entry).toMatchObject<Partial<CodeBlock>>({
			file: join(FIXTURES_DIR, "semantic-error.md"),
			lang: "ts",
			meta: null,
			type: "code",
			value: 'const a: number = "x";',
		});
		expect(entry.position.start).toMatchObject({ column: 1, line: 3 });
		expect(entry.position.end).toMatchObject({ column: 4, line: 5 });
	});

	/**
	 * Asserts a relative file path is resolved from the current working directory of the process.
	 */
	test("relative file path", async () => {
		const [entry] = await readCodeBlocks(relative(process.cwd(), join(FIXTURES_DIR, "semantic-error.md")));

		expect(entry?.file).toBe(join(FIXTURES_DIR, "semantic-error.md"));
	});

	/**
	 * Asserts a file that does not exist throws.
	 */
	test("missing file throws", async () => {
		await expect(read("does-not-exist.md")).rejects.toThrow(/ENOENT/);
	});

	/**
	 * Asserts the info string following the language is parsed as the meta.
	 */
	test("meta", async () => {
		const entry = await readSingle("meta.md");

		expect(entry.lang).toBe("ts");
		expect(entry.meta).toBe("title=example.ts");
	});

	/**
	 * Asserts the value of a multi-line code block, including blank lines, is preserved.
	 */
	test("multi-line value", async () => {
		const [entry] = await read("imports.md");

		expect(entry?.value).toBe('import { add } from "./math.js";\n\nadd(1, "2");');
	});

	/**
	 * Asserts a fence without a closing fence contains the remainder of the document.
	 */
	test("unclosed fence runs to the end of the document", async () => {
		const entry = await readSingle("unclosed-fence.md");

		expect(entry.value).toBe("const a = 1;\nconst b = 2;");
	});

	/**
	 * Asserts the column each line starts at is relative to the markdown file, including lines that are indented less,
	 * or more, than the opening fence.
	 */
	test("line columns", async () => {
		const entry = await readSingle("uneven-indentation.md");

		expect(entry.value).toBe('const a: number = "x";\n  const b: number = "x";');
		expect(entry.position.start).toMatchObject({ column: 3, line: 3 });
		expect(entry.lineColumns).toEqual([1, 3]);
	});

	/**
	 * Provides assertions for MDX files, which are parsed as MDX rather than markdown.
	 */
	describe("mdx.mdx", () => {
		let entries: CodeBlock[];

		beforeAll(async () => {
			entries = await read("mdx.mdx");
		});

		/**
		 * Asserts code blocks within JSX elements are found, including those without surrounding blank lines, and those
		 * indented within the element; ESM imports and exports are not treated as content.
		 */
		test("code blocks within JSX elements", () => {
			expect(entries.map((e) => [e.value, e.position.start.line, e.position.start.column])).toEqual([
				['const a: number = "x";', 14, 1],
				['const b: number = "x";', 20, 5],
				['const c: number = "x";', 27, 1],
			]);
		});

		/**
		 * Asserts the column each line starts at accounts for the indentation within the JSX element.
		 */
		test("line columns", () => {
			expect(entries.map((e) => e.lineColumns)).toEqual([[1], [5], [1]]);
		});
	});

	/**
	 * Asserts an MDX file that cannot be parsed throws, including the path of the file within the message.
	 */
	test("invalid MDX throws", async () => {
		await expect(read("invalid.mdx")).rejects.toThrow(
			`Failed to parse MDX file: ${join(FIXTURES_DIR, "invalid.mdx")}: Expected a closing tag for \`<Tabs>\``,
		);
	});

	/**
	 * Provides assertions for code blocks nested within other markdown nodes.
	 */
	describe("nested.md", () => {
		let entries: CodeBlock[];

		beforeAll(async () => {
			entries = await read("nested.md");
		});

		/**
		 * Asserts all code blocks are found, regardless of their parent node.
		 */
		test("three code blocks", () => {
			expect(entries).toHaveLength(3);
		});

		/**
		 * Asserts a code block within a list item is found, with the list indentation removed from its value.
		 */
		test("nested within a list", () => {
			expect(entries[0]?.value).toBe('const ok = 1;\nconst a: number = "x";');
			expect(entries[0]?.position.start).toMatchObject({ column: 5, line: 5 });
			expect(entries[0]?.lineColumns).toEqual([5, 5]);
		});

		/**
		 * Asserts a code block within a blockquote is found, with the blockquote markers removed from its value.
		 */
		test("nested within a blockquote", () => {
			expect(entries[1]?.value).toBe('const b: number = "x";');
			expect(entries[1]?.position.start).toMatchObject({ column: 3, line: 10 });
			expect(entries[1]?.lineColumns).toEqual([3]);
		});

		/**
		 * Asserts a top-level code block following nested code blocks is found.
		 */
		test("top-level code block", () => {
			expect(entries[2]).toMatchObject({ lang: "ts", value: 'const c: number = "x";' });
			expect(entries[2]?.position.start).toMatchObject({ column: 1, line: 14 });
		});
	});

	/**
	 * Asserts a code block within a list item, within a blockquote, is found.
	 */
	test("deeply nested", async () => {
		const entry = await readSingle("deeply-nested.md");

		expect(entry.value).toBe("const a = 1;");
		expect(entry.position.start).toMatchObject({ column: 7, line: 5 });
	});

	/**
	 * Provides assertions for a document containing many code blocks, with a variety of languages.
	 */
	describe("languages.md", () => {
		let entries: CodeBlock[];

		beforeAll(async () => {
			entries = await read("languages.md");
		});

		/**
		 * Asserts all fenced code blocks are found, in the order they appear within the document, with their language
		 * as-is; the indented code block is ignored.
		 */
		test("code blocks are returned in document order", () => {
			expect(entries.map((e) => [e.lang, e.position.start.line])).toEqual([
				["ts", 3],
				["typescript", 7],
				["tsx", 11],
				["mts", 15],
				["cts", 19],
				["TS", 23],
				["TypeScript", 27],
				["js", 31],
				["javascript", 35],
				["json", 39],
				["sh", 43],
				[null, 47],
			]);
		});

		/**
		 * Asserts a fenced code block without a language has a `null` language and meta.
		 */
		test("fenced code block without a language", () => {
			expect(entries[11]).toMatchObject({ lang: null, meta: null, value: 'const a: number = "x";' });
		});

		/**
		 * Asserts an indented code block is ignored, as it is not fenced.
		 */
		test("indented code block is ignored", () => {
			expect(entries.some((e) => e.position.start.line === 53)).toBe(false);
		});
	});
});
