import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Code, Nodes } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Position } from "unist";

/**
 * Reads all fenced code blocks within the markdown file; indented code blocks are ignored.
 * @param file Path to the markdown file.
 * @returns The fenced code blocks, in the order they appear within the file.
 */
export async function readCodeBlocks(file: string): Promise<CodeBlock[]> {
	const path = resolve(file);

	// Normalize line endings so code is consistent regardless of how the file was saved, or checked out.
	const markdown = (await readFile(path, { encoding: "utf8" })).replaceAll("\r\n", "\n");
	const tree = unified().use(remarkParse).parse(markdown);
	const entries: CodeBlock[] = [];

	const visit = (node: Nodes): void => {
		if (node.type === "code") {
			if (node.position !== undefined && isFenced(markdown, node.position)) {
				entries.push({ ...node, file: path, position: node.position });
			}
		} else if ("children" in node) {
			node.children.forEach(visit);
		}
	};

	visit(tree);
	return entries;
}

/**
 * Determines whether the code block at the position is fenced, i.e. it starts with a fence rather than indentation.
 * @param markdown Markdown the code block was parsed from.
 * @param position Position of the code block.
 * @returns `true` when the code block is fenced; otherwise `false`.
 */
function isFenced(markdown: string, position: Position): boolean {
	const { offset } = position.start;
	return offset !== undefined && /^(```|~~~)/.test(markdown.slice(offset));
}

/**
 * Fenced code block within a markdown file.
 */
export interface CodeBlock extends Code {
	/**
	 * Absolute path to the markdown file containing the code block.
	 */
	file: string;

	/**
	 * Position of the code block within the markdown file, including the fences.
	 */
	position: Position;
}
