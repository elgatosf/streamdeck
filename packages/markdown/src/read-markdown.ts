import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import type { Root } from "mdast";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Reads and parses the markdown file; files with an `.mdx` extension are parsed as MDX.
 * @param file Path to the markdown file.
 * @returns The markdown, and its syntax tree.
 * @throws When an MDX file cannot be parsed.
 */
export async function readMarkdown(file: string): Promise<Markdown> {
	const path = resolve(file);

	// Normalize line endings so content is consistent regardless of how the file was saved, or checked out; MDX files
	// have custom heading identifiers escaped so positions within the tree match the markdown.
	const isMdx = extname(path).toLowerCase() === ".mdx";
	const markdown = normalize(await readFile(path, { encoding: "utf8" }), isMdx);

	return {
		isMdx,
		markdown,
		path,
		tree: parse(path, markdown, isMdx),
	};
}

/**
 * Reverses the escaping of custom heading identifiers applied by {@link readMarkdown}, e.g. `## Title \{#custom-id}`
 * becomes `## Title {#custom-id}`.
 * @param markdown Markdown to unescape.
 * @returns The markdown, with custom heading identifiers unescaped.
 */
export function unescapeHeadingIds(markdown: string): string {
	// Matches a heading line containing the escaped `\{#`, so the escape can be removed.
	return markdown.replaceAll(/^#{1,6}(?!#).*\\\{#/gm, (heading) => heading.replace("\\{#", "{#"));
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
 * Normalizes the markdown: line endings become `\n`, and within MDX, custom heading identifiers, e.g.
 * `## Title {#custom-id}`, are escaped so they are not parsed as MDX expressions, mirroring Docusaurus.
 * @param markdown Markdown to normalize.
 * @param isMdx Whether the markdown is MDX.
 * @returns The normalized markdown.
 */
function normalize(markdown: string, isMdx: boolean): string {
	markdown = markdown.replaceAll("\r\n", "\n");
	if (!isMdx) {
		return markdown;
	}

	// Matches a heading line containing `{#`, e.g. `## Title {#custom-id}`, so the brace can be escaped.
	return markdown.replaceAll(/^#{1,6}(?!#).*\{#/gm, (heading) => heading.replace("{#", "\\{#"));
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
	 * Normalized markdown the syntax tree was parsed from; positions within the tree refer to this.
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
