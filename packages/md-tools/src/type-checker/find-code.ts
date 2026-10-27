import type { Code, Nodes } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Finds all code blocks within the specified markdown.
 * @param markdown Markdown to parse.
 * @returns The code blocks.
 */
export function findCode(markdown: string): Code[] {
	const tree = unified().use(remarkParse).parse(markdown);
	const blocks: Code[] = [];

	const visit = (node: Nodes): void => {
		if (node.type === "code") {
			blocks.push(node);
		} else if ("children" in node) {
			node.children.forEach(visit);
		}
	};

	visit(tree);
	return blocks;
}
