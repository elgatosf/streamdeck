import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Code } from "mdast";
import { describe, expect, test } from "vitest";

import { findCode } from "../find-code.js";

/**
 * Finds the code blocks within the markdown fixture.
 * @param fileName Name of the markdown fixture.
 * @returns The code blocks.
 */
function find(fileName: string): Code[] {
	// Normalize line endings so values are consistent regardless of how the fixtures were checked out.
	const markdown = readFileSync(join(import.meta.dirname, "fixtures", fileName), { encoding: "utf8" });
	return findCode(markdown.replaceAll("\r\n", "\n"));
}

/**
 * Finds the code blocks within the markdown fixture, asserting there is exactly one.
 * @param fileName Name of the markdown fixture.
 * @returns The code block.
 */
function findSingle(fileName: string): Code {
	const nodes = find(fileName);
	expect(nodes).toHaveLength(1);
	return nodes[0] as Code;
}

describe("findCodeNodes", () => {
	/**
	 * Asserts an empty document has no code blocks.
	 */
	test("empty markdown", () => {
		expect(find("empty.md")).toEqual([]);
	});

	/**
	 * Asserts headings, paragraphs, and inline code are not treated as code blocks.
	 */
	test("markdown without code blocks", () => {
		expect(find("no-code-blocks.md")).toEqual([]);
	});

	/**
	 * Asserts a fenced code block is found, including its language, value, and position within the document.
	 */
	test("fenced code block", () => {
		// Arrange, act.
		const node = findSingle("semantic-error.md");

		// Assert.
		expect(node).toMatchObject({
			lang: "ts",
			meta: null,
			type: "code",
			value: 'const a: number = "x";',
		});
		expect(node.position?.start).toMatchObject({ column: 1, line: 3 });
		expect(node.position?.end).toMatchObject({ column: 4, line: 5 });
	});

	/**
	 * Asserts the info string following the language is parsed as the meta.
	 */
	test("meta", () => {
		const node = findSingle("meta.md");

		expect(node.lang).toBe("ts");
		expect(node.meta).toBe("title=example.ts");
	});

	/**
	 * Asserts the value of a multi-line code block, including blank lines, is preserved.
	 */
	test("multi-line value", () => {
		const [node] = find("imports.md");

		expect(node?.value).toBe('import { add } from "./math.js";\n\nadd(1, "2");');
	});

	/**
	 * Asserts a fence without a closing fence contains the remainder of the document.
	 */
	test("unclosed fence runs to the end of the document", () => {
		const node = findSingle("unclosed-fence.md");

		expect(node.value).toBe("const a = 1;\nconst b = 2;");
	});

	/**
	 * Provides assertions for code blocks nested within other markdown nodes, and alternative fences.
	 */
	describe("nested.md", () => {
		const nodes = find("nested.md");

		/**
		 * Asserts all code blocks are found, regardless of their parent node.
		 */
		test("three code blocks", () => {
			expect(nodes).toHaveLength(3);
		});

		/**
		 * Asserts a code block within a list item is found, with the list indentation removed from its value.
		 */
		test("nested within a list", () => {
			expect(nodes[0]?.value).toBe('const ok = 1;\nconst a: number = "x";');
			expect(nodes[0]?.position?.start).toMatchObject({ column: 3, line: 5 });
		});

		/**
		 * Asserts a code block within a blockquote is found, with the blockquote markers removed from its value.
		 */
		test("nested within a blockquote", () => {
			expect(nodes[1]?.value).toBe('const b: number = "x";');
			expect(nodes[1]?.position?.start).toMatchObject({ column: 3, line: 10 });
		});

		/**
		 * Asserts a code block fenced with tildes is found.
		 */
		test("tilde fence", () => {
			expect(nodes[2]).toMatchObject({ lang: "ts", value: 'const c: number = "x";' });
			expect(nodes[2]?.position?.start).toMatchObject({ column: 1, line: 14 });
		});
	});

	/**
	 * Asserts a code block within a list item, within a blockquote, is found.
	 */
	test("deeply nested", () => {
		const node = findSingle("deeply-nested.md");

		expect(node.value).toBe("const a = 1;");
		expect(node.position?.start).toMatchObject({ column: 5, line: 5 });
	});

	/**
	 * Provides assertions for a document containing many code blocks, with a variety of languages.
	 */
	describe("languages.md", () => {
		const nodes = find("languages.md");

		/**
		 * Asserts all code blocks are found, in the order they appear within the document, with their language as-is.
		 */
		test("code blocks are returned in document order", () => {
			expect(nodes.map((n) => [n.lang, n.position?.start.line])).toEqual([
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
				[null, 53],
			]);
		});

		/**
		 * Asserts a fenced code block without a language has a `null` language and meta.
		 */
		test("fenced code block without a language", () => {
			expect(nodes[11]).toMatchObject({ lang: null, meta: null, value: 'const a: number = "x";' });
		});

		/**
		 * Asserts an indented code block is found, without a language, and with the indentation removed from its value.
		 */
		test("indented code block", () => {
			expect(nodes[12]).toMatchObject({ lang: null, meta: null, value: 'const a: number = "x";' });
			expect(nodes[12]?.position?.start).toMatchObject({ column: 1, line: 53 });
		});
	});
});
