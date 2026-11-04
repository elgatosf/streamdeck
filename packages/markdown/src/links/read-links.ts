import type { Definition, Image, Link as LinkNode, Nodes } from "mdast";
import type { Position } from "unist";

import { type Markdown, readMarkdown } from "../read-markdown.js";

/**
 * Reads all links within the markdown file: inline links, images, and link reference definitions. Files with an
 * `.mdx` extension are parsed as MDX, so links within JSX elements are found; JSX attributes, e.g. `href`, are not.
 * @param file Path to the markdown file.
 * @returns The links, in the order they appear within the file.
 * @throws When an MDX file cannot be parsed.
 */
export async function readLinks(file: string): Promise<Link[]> {
	return getLinks(await readMarkdown(file));
}

/**
 * Gets the links within the parsed markdown.
 * @param parsed Parsed markdown.
 * @returns The links, in the order they appear within the markdown.
 */
export function getLinks(parsed: Markdown): Link[] {
	const { markdown, path, tree } = parsed;
	const links: Link[] = [];

	const visit = (node: Nodes): void => {
		if ((node.type === "link" || node.type === "image" || node.type === "definition") && node.position) {
			links.push({
				destination: getDestination(markdown, node, node.position),
				file: path,
				position: node.position,
				type: node.type,
				url: node.url,
			});
		}

		if ("children" in node) {
			node.children.forEach(visit);
		}
	};

	visit(tree);
	return links;
}

/**
 * Gets the span of the link's destination as written in the markdown, i.e. the raw URL, which may differ from the
 * parsed URL due to escapes and character references. The tree does not record where the destination is, so it is
 * located within the link's source.
 * @param markdown Markdown the link was parsed from.
 * @param node Link, image, or definition node.
 * @param position Position of the node within the markdown.
 * @returns The destination's span; otherwise `undefined` when the destination could not be located.
 */
function getDestination(markdown: string, node: Definition | Image | LinkNode, position: Position): Span | undefined {
	const { end, start } = position;
	if (start.offset === undefined || end.offset === undefined) {
		return undefined;
	}

	const source = markdown.slice(start.offset, end.offset);

	// Autolinks, e.g. `<https://example.com>`, are a link whose only child is the URL itself.
	if (node.type === "link" && source.startsWith("<") && source.endsWith(">")) {
		return { end: end.offset - 1, start: start.offset + 1 };
	}

	// Matches the unescaped bracket that closes the content of a link or image, e.g. `[text](url)`, or the label of a
	// definition, e.g. `[label]: url`; the destination follows, after any whitespace.
	const closing = node.type === "definition" ? /(?<!\\)\]:\s*/ : /(?<!\\)\]\(\s*/;
	const from = node.type === "link" ? (node.children.at(-1)?.position?.end.offset ?? start.offset) - start.offset : 0;
	const match = closing.exec(source.slice(from));
	if (match === null) {
		return undefined;
	}

	const index = from + match.index + match[0].length;

	// A destination wrapped in angle brackets, e.g. `<my file.md>`, may contain whitespace.
	if (source[index] === "<") {
		const bracket = source.indexOf(">", index);
		return bracket === -1 ? undefined : { end: start.offset + bracket, start: start.offset + index + 1 };
	}

	// Otherwise the destination ends at whitespace, or its closing parenthesis; parentheses within the destination are
	// balanced, e.g. `[text](https://example.com/a_(b))`, and a backslash escapes the character that follows.
	let depth = 0;
	let cursor = index;
	for (; cursor < source.length; cursor++) {
		const char = source[cursor] ?? "";
		if (char === "\\") {
			cursor++;
		} else if (char === "(") {
			depth++;
		} else if ((char === ")" && depth-- === 0) || /\s/.test(char)) {
			break;
		}
	}

	return cursor === index ? undefined : { end: start.offset + cursor, start: start.offset + index };
}

/**
 * Link within a markdown file.
 */
export interface Link {
	/**
	 * Span of the destination as written in the markdown, e.g. for `[text](./a&amp;b.md)` the span of `./a&amp;b.md`;
	 * `undefined` when the destination could not be located.
	 */
	destination?: Span;

	/**
	 * Absolute path to the markdown file containing the link.
	 */
	file: string;

	/**
	 * Position of the link within the markdown file.
	 */
	position: Position;

	/**
	 * Type of the link.
	 */
	type: "definition" | "image" | "link";

	/**
	 * URL of the link, as parsed from the markdown, i.e. with escapes and character references decoded.
	 */
	url: string;
}

/**
 * Span within the markdown file.
 */
export interface Span {
	/**
	 * Offset the span ends at, exclusive.
	 */
	end: number;

	/**
	 * Offset the span starts at, inclusive.
	 */
	start: number;
}
