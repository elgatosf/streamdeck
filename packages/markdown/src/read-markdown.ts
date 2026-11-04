import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import type { Root } from "mdast";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Reads and parses the markdown file; files with an `.mdx` extension are parsed as MDX, with custom heading
 * identifiers, e.g. `## Title {#custom-id}`, supported as they are by Docusaurus.
 * @param file Path to the markdown file.
 * @returns The markdown, and its syntax tree.
 * @throws When an MDX file cannot be parsed.
 */
export async function readMarkdown(file: string): Promise<Markdown> {
	const path = resolve(file);

	// Normalize line endings so content is consistent regardless of how the file was saved, or checked out.
	const isMdx = extname(path).toLowerCase() === ".mdx";
	const markdown = (await readFile(path, { encoding: "utf8" })).replaceAll("\r\n", "\n");

	return {
		isMdx,
		markdown,
		path,
		tree: parse(path, isMdx ? maskHeadingIds(markdown) : markdown, isMdx),
	};
}

/**
 * Parses the markdown.
 * @param path Path to the markdown file, used for error reporting.
 * @param markdown Markdown to parse.
 * @param isMdx Whether the markdown should be parsed as MDX.
 * @returns The syntax tree.
 * @throws When an MDX file cannot be parsed.
 */
function parse(path: string, markdown: string, isMdx: boolean): Root {
	if (!isMdx) {
		return unified().use(remarkParse).parse(markdown);
	}

	try {
		return unified().use(remarkParse).use(remarkMdx).parse(markdown);
	} catch (error) {
		throw new Error(`Failed to parse MDX file: ${path}: ${error instanceof Error ? error.message : String(error)}`, {
			cause: error,
		});
	}
}

/**
 * Masks custom heading identifiers, e.g. `## Title {#custom-id}`, with whitespace so they are not parsed as MDX
 * expressions; the length is unchanged, so positions within the tree match the markdown. Fenced code blocks are left
 * as is, so their content is unchanged within the tree.
 * @param markdown Markdown to mask.
 * @returns The masked markdown.
 */
function maskHeadingIds(markdown: string): string {
	let fence: string | undefined;

	return markdown
		.split("\n")
		.map((line) => {
			// Matches a code fence, e.g. ` ``` ` or `~~~`; a fence closes when a matching fence of the same character follows.
			const opening = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
			if (fence === undefined) {
				fence = opening;
			} else if (opening !== undefined && opening[0] === fence[0] && opening.length >= fence.length) {
				fence = undefined;
				return line;
			}

			// Matches a custom identifier at the end of a heading line, e.g. `{#custom-id}`.
			return fence === undefined
				? line.replace(/^(#{1,6}(?!#).*)\{#[^}]+\}(?=[ \t]*$)/, (heading, text: string) => text.padEnd(heading.length))
				: line;
		})
		.join("\n");
}

/**
 * Parsed markdown file.
 */
export interface Markdown {
	/**
	 * Whether the file was parsed as MDX.
	 */
	isMdx: boolean;

	/**
	 * Markdown, with normalized line endings; positions within the tree refer to this.
	 */
	markdown: string;

	/**
	 * Absolute path to the markdown file.
	 */
	path: string;

	/**
	 * Syntax tree of the markdown.
	 */
	tree: Root;
}
