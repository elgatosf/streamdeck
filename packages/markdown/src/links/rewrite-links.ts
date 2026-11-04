import { readMarkdown } from "../read-markdown.js";
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
	const edits: Edit[] = [];

	for (const link of getLinks(parsed)) {
		const url = rewrite(link);
		if (url === undefined || url === link.url) {
			continue;
		}

		if (link.destination === undefined) {
			throw new Error(`Unable to rewrite link "${link.url}" in ${parsed.path}:${link.position.start.line}`);
		}

		edits.push({ ...link.destination, text: url });
	}

	// Apply the edits last to first, so the offsets of edits yet to be applied remain valid.
	let result = parsed.markdown;
	for (const { end, start, text } of edits.sort((a, b) => b.start - a.start)) {
		result = result.slice(0, start) + text + result.slice(end);
	}

	return result;
}

/**
 * Replacement of a span within the markdown.
 */
interface Edit {
	/**
	 * Offset the span ends at, exclusive.
	 */
	end: number;

	/**
	 * Offset the span starts at, inclusive.
	 */
	start: number;

	/**
	 * Text that replaces the span.
	 */
	text: string;
}
