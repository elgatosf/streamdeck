import { readMarkdown, unescapeHeadingIds } from "../read-markdown.js";
import { getLinks, type Link } from "./read-links.js";

/**
 * Rewrites the URLs of links within the markdown file; the file itself is not modified.
 * @param file Path to the markdown file.
 * @param rewrite Function that returns the new URL of a link, or `undefined` to leave the link unchanged.
 * @returns The markdown, with the links rewritten.
 * @throws When an MDX file cannot be parsed, or a link's URL cannot be located within the markdown.
 */
export async function rewriteLinks(file: string, rewrite: (link: Link) => string | undefined): Promise<string> {
	const { isMdx, markdown, path, tree } = await readMarkdown(file);
	let result = markdown;

	// Rewrite the links last to first, so the offsets of links yet to be rewritten remain valid.
	for (const link of getLinks(tree, path).reverse()) {
		const url = rewrite(link);
		if (url === undefined || url === link.url) {
			continue;
		}

		const index = result.indexOf(link.url, link.contentEnd ?? link.position.start.offset);
		if (index === -1) {
			throw new Error(`Unable to rewrite link "${link.url}" in ${path}:${link.position.start.line}`);
		}

		result = result.slice(0, index) + url + result.slice(index + link.url.length);
	}

	return isMdx ? unescapeHeadingIds(result) : result;
}
