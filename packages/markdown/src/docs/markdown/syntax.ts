import MarkdownIt from "markdown-it";

/**
 * Parser used to render Markdown as HTML.
 */
const parser = new MarkdownIt();

// Wrapped lines are a single paragraph, so soft breaks are rendered as spaces rather than newlines.
parser.renderer.rules.softbreak = (): string => " ";

/**
 * Joins blocks into a Markdown document that is terminated by a single newline.
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
 * Renders a heading preceded by an explicit anchor, so links do not depend on renderer-specific slugs.
 * @param level Heading level.
 * @param text Heading text.
 * @param id Unique anchor id.
 * @returns Markdown heading.
 */
export function heading(level: number, text: string, id: string): string {
	return `${anchor(id)}\n\n${"#".repeat(level)} ${text}`;
}

/**
 * Renders an anchor that can be linked to.
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
 * Renders code as an inline code element, including code that contains backticks.
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
 * Parses Markdown, and renders it as HTML on a single line, e.g. for use within a table cell.
 * @param markdown Markdown to render.
 * @returns HTML without newlines; a single paragraph is unwrapped.
 */
export function inlineHtml(markdown: string): string {
	const html = parser.render(markdown).trim().replace(/\n/g, "");
	const content = /^<p>(.*)<\/p>$/.exec(html)?.[1];
	return content !== undefined && !content.includes("<p>") ? content : html;
}

/**
 * Renders a Markdown table; pipes within cells are escaped, and cells are collapsed onto a single line.
 * @param headers Column headers.
 * @param rows Cell contents of each row.
 * @returns Markdown table.
 */
export function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
	return [headers, headers.map(() => "---"), ...rows]
		.map((row) => `| ${row.map((cell) => cell.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|")).join(" | ")} |`)
		.join("\n");
}
