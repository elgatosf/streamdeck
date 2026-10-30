import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import type { Code, Nodes, Root } from "mdast";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Position } from "unist";

/**
 * Reads all fenced code blocks within the markdown file; indented code blocks are ignored. Files with an `.mdx`
 * extension are parsed as MDX, so code blocks within JSX elements are found.
 * @param file Path to the markdown file.
 * @returns The fenced code blocks, in the order they appear within the file.
 * @throws When an MDX file cannot be parsed.
 */
export async function readCodeBlocks(file: string): Promise<CodeBlock[]> {
	const path = resolve(file);

	// Normalize line endings so code is consistent regardless of how the file was saved, or checked out.
	const markdown = (await readFile(path, { encoding: "utf8" })).replaceAll("\r\n", "\n");
	const lines = markdown.split("\n");
	const tree = parse(path, markdown);
	const entries: CodeBlock[] = [];

	const visit = (node: Nodes): void => {
		if (node.type === "code") {
			if (node.position !== undefined && isFenced(markdown, node.position)) {
				entries.push({
					...node,
					file: path,
					lineColumns: getLineColumns(lines, node.value, node.position),
					position: node.position,
				});
			}
		} else if ("children" in node) {
			node.children.forEach(visit);
		}
	};

	visit(tree);
	return entries;
}

/**
 * Parses the markdown; files with an `.mdx` extension are parsed as MDX.
 * @param path Path to the markdown file.
 * @param markdown Markdown to parse.
 * @returns The syntax tree.
 * @throws When an MDX file cannot be parsed.
 */
function parse(path: string, markdown: string): Root {
	if (extname(path).toLowerCase() !== ".mdx") {
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
 * Gets the 1-based column, within the markdown file, that each line of the code block's value starts at.
 * @param lines Lines of the markdown the code block was parsed from.
 * @param value Value of the code block.
 * @param position Position of the code block.
 * @returns The column of each line of the value.
 */
function getLineColumns(lines: string[], value: string, position: Position): number[] {
	return value.split("\n").map((code, i) => {
		// The line follows the opening fence; the parser only removes a prefix (indentation, blockquote markers,
		// etc.), so the code is the suffix of the markdown line.
		const line = lines[position.start.line + i];
		if (line === undefined || !line.endsWith(code)) {
			return position.start.column;
		}

		return line.length - code.length + 1;
	});
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
	 * 1-based column, within the markdown file, that each line of the value starts at; content lines are not
	 * necessarily aligned with the opening fence.
	 */
	lineColumns: number[];

	/**
	 * Position of the code block within the markdown file, including the fences.
	 */
	position: Position;
}
