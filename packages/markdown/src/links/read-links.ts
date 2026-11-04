import type { Nodes, Root } from "mdast";
import type { Position } from "unist";

import { readMarkdown } from "../read-markdown.js";

/**
 * Reads all links within the markdown file: inline links, images, and link reference definitions. Files with an
 * `.mdx` extension are parsed as MDX, so links within JSX elements are found; JSX attributes, e.g. `href`, are not.
 * @param file Path to the markdown file.
 * @returns The links, in the order they appear within the file.
 * @throws When an MDX file cannot be parsed.
 */
export async function readLinks(file: string): Promise<Link[]> {
	const { path, tree } = await readMarkdown(file);
	return getLinks(tree, path);
}

/**
 * Gets the links within the syntax tree.
 * @param tree Syntax tree of the markdown.
 * @param path Absolute path to the markdown file.
 * @returns The links, in the order they appear within the tree.
 */
export function getLinks(tree: Root, path: string): Link[] {
	const links: Link[] = [];

	const visit = (node: Nodes): void => {
		if ((node.type === "link" || node.type === "image" || node.type === "definition") && node.position) {
			links.push({
				contentEnd: node.type === "link" ? node.children.at(-1)?.position?.end.offset : undefined,
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
 * Link within a markdown file.
 */
export interface Link {
	/**
	 * Offset, within the markdown file, that the link's content ends at, i.e. where the URL follows; `undefined` for
	 * images and definitions, whose URLs follow the start of the node.
	 */
	contentEnd?: number;

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
	 * URL of the link, as written in the markdown.
	 */
	url: string;
}
