/**
 * Helpers for emitting GitHub Flavored Markdown.
 */

/**
 * Formats JSDoc links within the specified text. Links that reference internal components are converted
 * to inline code elements, and links that reference external links are converted to markdown links.
 * @param text Text to format.
 * @returns Formatted text with the JSDoc links replaced with markdown equivalent.
 */
export function formatJSDocLinks(text: string): string {
	// Matches `{@link target}` and `{@link target label}`.
	return text.replaceAll(/{@link\s(.*?)(\s.*?)?}/g, (_: string, ...[link, name]: string[]) => {
		if (link.startsWith("http://") || link.startsWith("https://")) {
			return `[${(name ?? link).trim()}](${link})`;
		}

		return `\`${link}\``;
	});
}

/**
 * Formats a JSDoc description as markdown; JSDoc links are converted, and lists are separated from the preceding
 * paragraph with a blank line so that they are recognized as lists.
 * @param text JSDoc description.
 * @returns The formatted description.
 */
export function formatDescription(text: string | undefined): string {
	if (!text) {
		return "";
	}

	return (
		formatJSDocLinks(text)
			// Remove a single leading space left over from the JSDoc comment.
			.replaceAll(/^ (?=\S)/gm, "")
			// Matches a non-blank, non-list line directly followed by a list item.
			.replaceAll(/^(?!\s*[-*] )(\S[^\n]*)\n(?=\s*[-*] )/gm, "$1\n\n")
	);
}

/**
 * Creates a markdown heading.
 * @param depth Depth of the heading, for example `2` for `##`.
 * @param text Text of the heading.
 * @param id Optional explicit identifier; written as a `{#id}` suffix on the heading.
 * @returns The heading.
 */
export function heading(depth: number, text: string, id?: string): string {
	const prefix = "#".repeat(Math.min(depth, 6));
	return id ? `${prefix} ${text} {#${id}}` : `${prefix} ${text}`;
}

/**
 * Creates a fenced code block.
 * @param code Contents of the code block.
 * @param lang Language of the code block.
 * @param meta Optional meta string, for example `title="..."`.
 * @returns The code block.
 */
export function codeBlock(code: string, lang = "", meta?: string): string {
	const fence = "```";
	const info = meta ? `${lang} ${meta}` : lang;
	return `${fence}${info}\n${code.trimEnd()}\n${fence}`;
}

/**
 * Normalizes a description for use within a table cell, i.e. a single line without pipes.
 * @param text Text to normalize.
 * @returns The normalized text.
 */
export function tableCell(text: string): string {
	return text
		.replaceAll(/\s*\n\s*/g, " ")
		.replaceAll("|", "\\|")
		.trim();
}

/**
 * Indents every line of the text.
 * @param text Text to indent.
 * @param indent Indentation to apply.
 * @returns The indented text.
 */
export function indent(text: string, indent = "  "): string {
	return text
		.split("\n")
		.map((line) => (line.trim() === "" ? "" : `${indent}${line}`))
		.join("\n");
}

/**
 * Joins non-empty blocks of markdown, separating them with a blank line.
 * @param blocks Blocks to join.
 * @returns The joined blocks.
 */
export function joinBlocks(...blocks: (string | undefined)[]): string {
	return blocks
		.filter((block): block is string => block !== undefined && block.trim() !== "")
		.map((block) => block.trim())
		.join("\n\n");
}

/**
 * Matches a highlight marker on a line of its own, for example `// [!code highlight:3]` or `<!-- [!code highlight] -->`.
 */
const ownLineMarker = /^\s*(?:\/\/|#|<!--)\s*\[!code highlight(?::(\d+))?\]\s*(?:-->)?\s*$/;

/**
 * Matches a highlight marker at the end of a line of code.
 */
const trailingMarker = /\s*(?:\/\/|#|<!--)\s*\[!code highlight(?::(\d+))?\]\s*(?:-->)?\s*$/;

/**
 * Extracts `[!code highlight]` markers from the code; a trailing marker highlights its own line, and a marker on a line
 * of its own is removed and highlights the lines that follow it. An optional `:N` count highlights N lines.
 * @param code Code that may contain highlight markers.
 * @returns The code without markers, and the (1-based) lines to highlight.
 */
export function extractHighlights(code: string): Highlights {
	const out: string[] = [];
	const lines = new Set<number>();

	for (const line of code.split("\n")) {
		const own = line.match(ownLineMarker);
		if (own) {
			const count = Number(own[1] ?? 1);
			for (let i = 0; i < count; i++) {
				lines.add(out.length + 1 + i);
			}

			continue;
		}

		const trailing = line.match(trailingMarker);
		if (trailing) {
			const count = Number(trailing[1] ?? 1);
			for (let i = 0; i < count; i++) {
				lines.add(out.length + 1 + i);
			}

			out.push(line.replace(trailingMarker, ""));
			continue;
		}

		out.push(line);
	}

	return { code: out.join("\n"), lines: [...lines].sort((a, b) => a - b) };
}

/**
 * Sets the highlighted lines of a fenced code block, as a `{1,3-5}` meta string; an existing one is replaced.
 * @param fence Opening fence line, including the language and meta.
 * @param lines Lines to highlight.
 * @returns The opening fence line.
 */
export function withHighlightMeta(fence: string, lines: number[]): string {
	const info = fence.trimEnd().replace(/\s*\{[\d,-]+\}/g, "");
	if (lines.length === 0) {
		return info;
	}

	const ranges: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const start = lines[i];
		while (i + 1 < lines.length && lines[i + 1] === lines[i] + 1) {
			i++;
		}

		ranges.push(start === lines[i] ? `${start}` : `${start}-${lines[i]}`);
	}

	return `${info} {${ranges.join(",")}}`;
}

/**
 * Code with its highlight markers extracted.
 */
export type Highlights = {
	/**
	 * Code without the highlight markers.
	 */
	code: string;

	/**
	 * Lines (1-based) to highlight.
	 */
	lines: number[];
};
