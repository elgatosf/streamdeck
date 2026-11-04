import { dirname, resolve } from "node:path";

import type { Nodes } from "mdast";

import { readMarkdown } from "../read-markdown.js";

/**
 * Reads the anchors within the markdown file that a link can target: headings, identified by their slug or a custom
 * identifier (`## Title {#custom-id}`), `id` attributes of JSX elements, and the anchors of markdown files imported
 * into MDX, which Docusaurus renders inline as partials.
 * @param file Path to the markdown file.
 * @param visited Files already read, to prevent circular imports being read again.
 * @returns The anchors.
 * @throws When an MDX file cannot be parsed.
 */
export async function readAnchors(file: string, visited = new Set<string>()): Promise<Set<string>> {
	const { isMdx, path, tree } = await readMarkdown(file);
	visited.add(path);

	const anchors = new Set<string>();
	const partials: string[] = [];
	const slugCounts = new Map<string, number>();

	const visit = (node: Nodes): void => {
		if (node.type === "heading") {
			anchors.add(getHeadingId(getText(node), slugCounts));
		} else if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
			const id = node.attributes.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === "id");
			if (typeof id?.value === "string") {
				anchors.add(id.value);
			}
		} else if (node.type === "mdxjsEsm") {
			// Matches the path of a default import of a markdown file, e.g. `import Partial from "./_partial.mdx"`.
			for (const [, partial = ""] of node.value.matchAll(/from\s+["'](\.[^"']+\.mdx?)["']/g)) {
				partials.push(resolve(dirname(path), partial));
			}
		}

		if ("children" in node) {
			node.children.forEach(visit);
		}
	};

	visit(tree);

	if (isMdx) {
		for (const partial of partials.filter((partial) => !visited.has(partial))) {
			for (const anchor of await readAnchors(partial, visited)) {
				anchors.add(anchor);
			}
		}
	}

	return anchors;
}

/**
 * Gets the identifier of the heading; either the custom identifier, or the slug of the text.
 * @param text Text of the heading.
 * @param slugCounts Number of times each slug has been used, so duplicate headings are suffixed, e.g. `title-1`.
 * @returns The identifier.
 */
function getHeadingId(text: string, slugCounts: Map<string, number>): string {
	// Matches a custom identifier at the end of the heading, e.g. `{#custom-id}`.
	const custom = /\{#([^}]+)\}\s*$/.exec(text);
	if (custom?.[1] !== undefined) {
		return custom[1];
	}

	// Approximates GitHub's slugs, as used by Docusaurus: lower case, punctuation removed, and spaces hyphenated.
	const slug = text
		.toLowerCase()
		.trim()
		.replaceAll(/[^\p{L}\p{N}\s_-]/gu, "")
		.replaceAll(/\s+/g, "-");

	const count = slugCounts.get(slug) ?? 0;
	slugCounts.set(slug, count + 1);

	return count === 0 ? slug : `${slug}-${count}`;
}

/**
 * Gets the text content of the node, e.g. the text of a heading including its inline code and emphasis.
 * @param node Node to get the text of.
 * @returns The text.
 */
function getText(node: Nodes): string {
	if ("value" in node) {
		return node.value;
	}

	if ("children" in node) {
		return node.children.map(getText).join("");
	}

	return "";
}
