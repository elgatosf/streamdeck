import { findMarkdownFiles } from "./find-markdown-files.js";
import type { MarkdownFile } from "./markdown-file.js";
import { readMarkdown } from "./read-markdown.js";

/**
 * Reads and parses the markdown files matching a glob, sorted by path. Keep the returned files to share their content
 * and syntax trees across checks and edits.
 * @param pattern Glob pattern, matched using Node.js' built-in `glob`.
 * @param cwd Directory the glob is resolved from; defaults to the current working directory.
 * @returns The files held in memory.
 * @throws When no files match, a file cannot be read, or an MDX file cannot be parsed.
 */
export async function readMarkdownFiles(pattern: string, cwd = process.cwd()): Promise<MarkdownFile[]> {
	const files = await findMarkdownFiles(pattern, cwd);
	return Promise.all(files.map((file) => readMarkdown(file)));
}
