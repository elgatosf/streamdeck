import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { extractHighlights, withHighlightMeta } from "./markdown.js";

/**
 * Matches a generated region, for example:
 *
 * <!-- generated: keys-commands -->
 * ...
 * <!-- /generated -->
 */
const generatedRegion = /<!-- generated: ([\w-]+) -->\n[\s\S]*?<!-- \/generated -->/g;

/**
 * Matches a snippet marker followed by a fenced code block, for example:
 *
 * <!-- snippet: node/guides/actions/set-title.ts -->
 * ```ts title="..."
 * ...
 * ```
 *
 * Groups: (1) snippet path, (2) opening fence line, (3) closing fence.
 */
const snippetBlock = /<!-- snippet: ([^\s]+) -->\n\n?(```[^\n]*)\n[\s\S]*?(\n```)/g;

/**
 * Reads a text file, normalizing line endings to LF so that patterns match on every platform.
 * @param path Path of the file.
 * @returns Contents of the file.
 */
async function readText(path: string): Promise<string> {
	return (await readFile(path, { encoding: "utf-8" })).replaceAll("\r\n", "\n");
}

/**
 * Options for synchronizing the documentation.
 */
export type SyncOptions = {
	/**
	 * Directory that contains the documentation.
	 */
	docsDir: string;

	/**
	 * Generators, indexed by region identifier.
	 */
	generators: Record<string, () => Promise<string>>;

	/**
	 * Directory that contains the snippets.
	 */
	snippetsDir: string;
};

/**
 * Result of synchronizing a single file.
 */
export type SyncResult = {
	/**
	 * Path of the file.
	 */
	path: string;

	/**
	 * Contents of the file, with regions and snippets up to date.
	 */
	contents: string;

	/**
	 * Determines whether the contents differ from the file on disk.
	 */
	changed: boolean;
};

/**
 * Synchronizes the generated regions, and snippets, within the documentation; the result is returned, not written.
 * @param opts Options.
 * @returns The synchronized files.
 */
export async function sync(opts: SyncOptions): Promise<SyncResult[]> {
	const generated = new Map<string, string>();
	const results: SyncResult[] = [];

	for (const path of await getMarkdownFiles(opts.docsDir)) {
		const original = await readText(path);
		let contents = original;

		// Generated regions.
		for (const [match, id = ""] of original.matchAll(generatedRegion)) {
			const generator = opts.generators[id];
			if (!generator) {
				throw new Error(`Unknown generator "${id}" in ${relative(opts.docsDir, path)}`);
			}

			let content = generated.get(id);
			if (content === undefined) {
				content = (await generator()).trim().replaceAll(/\n{3,}/g, "\n\n");
				generated.set(id, content);
			}

			// A function avoids `$` patterns in the content being interpreted by `replace`.
			const replacement = `<!-- generated: ${id} -->\n\n${content}\n\n<!-- /generated -->`;
			contents = contents.replace(match, () => replacement);
		}

		// Snippets.
		for (const [match, src = "", openingFence = "", closingFence = ""] of contents.matchAll(snippetBlock)) {
			const snippetPath = join(opts.snippetsDir, src);
			if (!existsSync(snippetPath)) {
				throw new Error(`Snippet "${src}" not found, referenced in ${relative(opts.docsDir, path)}`);
			}

			// Highlight markers within the snippet become the `{lines}` meta of the fence; otherwise the meta is kept as is.
			const { code, lines } = extractHighlights((await readText(snippetPath)).trimEnd());
			const fence = lines.length > 0 ? withHighlightMeta(openingFence, lines) : openingFence;
			const replacement = `<!-- snippet: ${src} -->\n\n${fence}\n${code}${closingFence}`;
			contents = contents.replace(match, () => replacement);
		}

		results.push({ path, contents, changed: contents !== original });
	}

	return results;
}

/**
 * Gets the markdown files within the directory, excluding historical versions (`v1`, `v2`, etc.) and
 * directories prefixed with an underscore.
 * @param dir Directory to search.
 * @returns Paths of the markdown files.
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
	const files: string[] = [];

	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!entry.name.startsWith("_") && !/^v\d+$/.test(entry.name)) {
				files.push(...(await getMarkdownFiles(path)));
			}
		} else if (entry.name.endsWith(".md")) {
			files.push(path);
		}
	}

	return files.sort();
}
