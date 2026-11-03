import MarkdownIt from "markdown-it";

/**
 * Parser used to render Markdown as HTML, allowing descriptions with paragraphs or lists to fit within table cells.
 */
const parser = new MarkdownIt();

// Wrapped lines are a single paragraph, so soft breaks are rendered as spaces rather than newlines.
parser.renderer.rules.softbreak = (): string => " ";

/**
 * Joins blocks into a Markdown document terminated by a newline. Normalizing CRLF at assembly keeps
 * output stable when source descriptions use different line endings.
 * @param blocks Blocks of the document; empty blocks are omitted.
 * @returns Markdown document.
 */
export function document(blocks: readonly string[]): string {
	return `${joinBlocks(blocks).replace(/\r\n/g, "\n")}\n`;
}

/**
 * Joins blocks of Markdown, separated by blank lines.
 * @param blocks Blocks to join; empty blocks are omitted.
 * @returns Markdown.
 */
export function joinBlocks(blocks: readonly string[]): string {
	return blocks.filter((block) => block.length > 0).join("\n\n");
}

/**
 * Markdown block that is either ready to render or requires asynchronous generation.
 */
export type DeferredBlock = string | (() => Promise<string>);

/**
 * Resolves asynchronous blocks and joins them in their original order. Thunks defer formatter work until generators
 * have allocated anchors and validated headings; `Promise.all` then formats concurrently without reordering blocks.
 * @param blocks Blocks to resolve and join.
 * @returns Joined Markdown.
 */
export async function joinDeferredBlocks(blocks: readonly DeferredBlock[]): Promise<string> {
	return joinBlocks(
		await Promise.all(blocks.map((block) => (typeof block === "string" ? block : Promise.resolve().then(block)))),
	);
}

/**
 * Renders a heading with an explicit id, so links do not depend on renderer-specific slugs. The `{#id}` syntax
 * requires a renderer that supports explicit heading IDs.
 * @param level Heading level.
 * @param text Heading text.
 * @param id Unique anchor id.
 * @returns Markdown heading.
 */
export function heading(level: number, text: string, id: string): string {
	return `${"#".repeat(level)} ${text} {#${id}}`;
}

/**
 * Maximum heading level supported by Markdown.
 */
const MAX_HEADING_LEVEL = 6;

/**
 * Creates a function that renders headings, offset by a number of levels, e.g. an offset of `2` renders a level 1
 * heading as `###`.
 * @param offset Number of levels headings are offset by; default is `0`.
 * @returns Function that renders a heading.
 * @throws When the offset is not a non-negative integer; the returned function throws when a heading exceeds level 6.
 */
export function createHeading(offset = 0): typeof heading {
	if (!Number.isInteger(offset) || offset < 0) {
		throw new Error(`Heading offset must be a non-negative integer, but was ${offset}.`);
	}

	return (level, text, id) => {
		if (level + offset > MAX_HEADING_LEVEL) {
			throw new Error(
				`Heading offset ${offset} exceeds the maximum heading level of ${MAX_HEADING_LEVEL} (level ${level + offset}).`,
			);
		}

		return heading(level + offset, text, id);
	};
}

/**
 * Renders an anchor that can be linked to, for content such as table rows that cannot carry a heading ID.
 * @param id Unique anchor id.
 * @returns HTML anchor.
 */
export function anchor(id: string): string {
	return `<a id="${id}"></a>`;
}

/**
 * Wraps code in a fenced code block.
 * @param code Code.
 * @param language Language of the code.
 * @returns Fenced Markdown code.
 */
export function codeBlock(code: string, language = "typescript"): string {
	return `\`\`\`${language}\n${code}\n\`\`\``;
}

/**
 * Renders code as an inline code element, including code that contains backticks. The fence is longer than any
 * backtick run in the content, and padding prevents boundary backticks from merging with the fence.
 * @param code Code to render.
 * @returns Inline code.
 */
export function inlineCode(code: string): string {
	const longestRun = Math.max(0, ...(code.match(/`+/g) ?? []).map((run) => run.length));
	const fence = "`".repeat(longestRun + 1);
	const padding = code.startsWith("`") || code.endsWith("`") ? " " : "";
	return `${fence}${padding}${code.replace(/\s*\n\s*/g, " ")}${padding}${fence}`;
}

/**
 * Parses Markdown, and renders it as HTML on a single line, e.g. for use within a table cell. HTML retains paragraph
 * and list structure without introducing Markdown table rows; a lone paragraph is unwrapped to avoid redundant markup.
 * @param markdown Markdown to render.
 * @returns HTML without newlines; a single paragraph is unwrapped.
 */
export function inlineHtml(markdown: string): string {
	const html = parser.render(markdown).trim().replace(/\n/g, "");
	const content = /^<p>(.*)<\/p>$/.exec(html)?.[1];
	return content !== undefined && !content.includes("<p>") ? content : html;
}

/**
 * Renders a Markdown table; pipes within cells are escaped, and cells are collapsed onto a single line so their
 * contents cannot be parsed as additional columns or rows.
 * @param headers Column headers.
 * @param rows Cell contents of each row.
 * @returns Markdown table.
 */
export function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
	return [headers, headers.map(() => "---"), ...rows]
		.map((row) => `| ${row.map((cell) => cell.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|")).join(" | ")} |`)
		.join("\n");
}
