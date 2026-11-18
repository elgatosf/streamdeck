import { glob } from "node:fs/promises";
import { extname, resolve } from "node:path";

/**
 * File extensions considered markdown.
 */
const MARKDOWN_EXTENSIONS: ReadonlySet<string> = new Set([".md", ".mdx"]);

/**
 * Finds the markdown files (`.md` and `.mdx`) matching the glob pattern, sorted to ensure diagnostics are reported in a
 * consistent order.
 * @param pattern Glob pattern.
 * @param baseDir Directory the glob pattern is resolved from.
 * @returns The absolute paths of the markdown files.
 */
export async function findMarkdownFiles(pattern: string, baseDir: string): Promise<string[]> {
	const entries = await Array.fromAsync(glob(pattern, { cwd: baseDir, withFileTypes: true }));

	const files = entries
		.filter((entry) => entry.isFile() && MARKDOWN_EXTENSIONS.has(extname(entry.name).toLowerCase()))
		.map((entry) => resolve(baseDir, entry.parentPath, entry.name));

	if (files.length === 0) {
		throw new Error(`No markdown files found matching: ${pattern} (baseDir: ${resolve(baseDir)})`);
	}

	return files.sort();
}
