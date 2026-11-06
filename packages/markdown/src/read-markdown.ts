import { readFile } from "node:fs/promises";

import { MarkdownFile } from "./markdown-file.js";

/**
 * Reads and parses a markdown file into memory. Files with an `.mdx` extension are parsed as MDX, with Docusaurus
 * custom heading identifiers supported.
 * @param file Path to the markdown file.
 * @returns The file, ready for checking and editing without reading it again.
 * @throws When the file cannot be read, or an MDX file cannot be parsed.
 */
export async function readMarkdown(file: string): Promise<MarkdownFile> {
	return new MarkdownFile(file, await readFile(file, "utf8"));
}
