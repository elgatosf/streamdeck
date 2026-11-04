import { readMarkdown, unescapeHeadingIds } from "../read-markdown.js";
import { getLinks, type Link } from "./read-links.js";

/**
 * Rewrites the URLs of links within the markdown file; the file itself is not modified.
 * @param file Path to the markdown file.
 * @param rewrite Function that returns the new URL of a link, or `undefined` to leave the link unchanged.
 * @returns The markdown, with the links rewritten.
 * @throws When an MDX file cannot be parsed, or a link's destination cannot be located within the markdown.
 */
export async function rewriteLinks(file: string, rewrite: (link: Link) => string | undefined): Promise<string> {
	const parsed = await readMarkdown(file);
	const { isMdx, path } = parsed;
	let result = parsed.markdown;

	// Rewrite the links last to first, so the spans of links yet to be rewritten remain valid.
	for (const link of getLinks(parsed).reverse()) {
		const url = rewrite(link);
		if (url === undefined || url === link.url) {
			continue;
		}

		if (link.destination === undefined) {
			throw new Error(`Unable to rewrite link "${link.url}" in ${path}:${link.position.start.line}`);
		}

		result = result.slice(0, link.destination.start) + url + result.slice(link.destination.end);
	}

	return isMdx ? unescapeHeadingIds(result) : result;
}
