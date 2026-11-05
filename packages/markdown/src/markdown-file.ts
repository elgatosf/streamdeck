import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

import type { Root } from "mdast";

import { checkLinks, type CheckLinksOptions, type LinkProblem } from "./links/check-links.js";
import type { Link } from "./links/read-links.js";
import { rewriteLinks } from "./links/rewrite-links.js";
import { parseMarkdown } from "./parse-markdown.js";
import type { CodeBlockDiagnostic } from "./type-check/code-block-diagnostic.js";
import { typeCheck, type TypeCheckOptions } from "./type-check/type-check.js";

/**
 * A markdown file held in memory. Checks share its syntax tree; editing the content invalidates the tree, which is
 * parsed again only when needed. Changes are not written to disk until {@link MarkdownFile.write} is called.
 */
export class MarkdownFile {
	/** Whether the file is parsed as MDX. */
	public readonly isMdx: boolean;

	/** Absolute source path, used to resolve links and report diagnostics even when writing elsewhere. */
	public readonly path: string;

	/** Markdown with normalized line endings. */
	#markdown: string;

	/** Syntax tree of the current content, if already parsed. */
	#tree: Root | undefined;

	/**
	 * Creates and parses a markdown file from content already in memory.
	 * @param path Source path of the file.
	 * @param markdown Markdown content.
	 */
	constructor(path: string, markdown: string) {
		this.path = resolve(path);
		this.isMdx = extname(this.path).toLowerCase() === ".mdx";
		this.#markdown = markdown.replaceAll("\r\n", "\n");
		this.#tree = parseMarkdown(this.path, this.#markdown, this.isMdx);
	}

	/** Gets the current markdown content. */
	public get markdown(): string {
		return this.#markdown;
	}

	/** Gets the syntax tree of the current content, parsing it only when needed. Treat the tree as read-only. */
	public get tree(): Root {
		return (this.#tree ??= parseMarkdown(this.path, this.#markdown, this.isMdx));
	}

	/**
	 * Checks this file's links. Use the batch function to share loaded targets and HTTP responses across files.
	 * @param options Link checking options.
	 * @returns The link problems.
	 */
	public checkLinks(options: CheckLinksOptions = {}): Promise<LinkProblem[]> {
		return checkLinks([this], options);
	}

	/**
	 * Formats the current content in memory using the caller's formatter and configuration.
	 * @param formatter Formats the markdown, with the source path available to select the parser.
	 */
	public async format(formatter: (markdown: string, path: string) => Promise<string> | string): Promise<void> {
		this.update(await formatter(this.#markdown, this.path));
	}

	/**
	 * Rewrites links in memory without changing the source file on disk.
	 * @param rewrite Returns the new URL, or `undefined` to leave the link unchanged.
	 */
	public rewriteLinks(rewrite: (link: Link) => string | undefined): void {
		this.update(rewriteLinks(this, rewrite));
	}

	/**
	 * Type checks this file's TypeScript code blocks. Use the batch function to check files in one TypeScript program.
	 * @param options Type checking options.
	 * @returns The diagnostics.
	 */
	public typeCheck(options: TypeCheckOptions = {}): CodeBlockDiagnostic[] {
		return typeCheck([this], options);
	}

	/**
	 * Writes the current content, creating parent directories as needed. The source path remains unchanged.
	 * @param destination Output path; defaults to the source path.
	 */
	public async write(destination = this.path): Promise<void> {
		await mkdir(dirname(destination), { recursive: true });
		await writeFile(destination, this.#markdown, "utf8");
	}

	/**
	 * Replaces the content, invalidating positions in the syntax tree only when the content changes.
	 * @param markdown New markdown content.
	 */
	private update(markdown: string): void {
		const normalized = markdown.replaceAll("\r\n", "\n");
		if (normalized !== this.#markdown) {
			this.#markdown = normalized;
			this.#tree = undefined;
		}
	}
}
