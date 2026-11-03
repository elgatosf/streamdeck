import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Pattern of a line that is a marker that starts or ends a section, e.g. `<!-- format:start id -->`.
 */
const MARKER = /^[ \t]*(<!--[ \t]*format:(start|end)[ \t]+(\S+)[ \t]*-->)[ \t]*$/gm;

/**
 * Options used to format a Markdown file.
 */
export interface FormatOptions {
	/**
	 * Path to the Markdown file to format.
	 */
	readonly target: string;

	/**
	 * Content of each section, keyed by the section's identifier.
	 */
	readonly data: Readonly<Record<string, string>> | ReadonlyMap<string, string>;
}

/**
 * Section of a Markdown file, between a start and end marker.
 */
interface Section {
	/**
	 * Identifier of the section.
	 */
	readonly id: string;

	/**
	 * Offset of the end of the start marker.
	 */
	readonly start: number;

	/**
	 * Offset of the start of the end marker.
	 */
	readonly end: number;
}

/**
 * Start marker of a section that has not ended.
 */
interface OpenSection {
	/**
	 * Identifier of the section.
	 */
	readonly id: string;

	/**
	 * Location of the start marker, used in errors, e.g. `README.md:3`.
	 */
	readonly location: string;

	/**
	 * Offset immediately after the start marker.
	 */
	readonly start: number;
}

/**
 * Formats a Markdown file by replacing the content of each section, between `<!-- format:start {id} -->` and
 * `<!-- format:end {id} -->` markers, with the data that has the section's identifier. Markers are kept so the file
 * can be formatted again; sections without data are left unchanged.
 * @param options Options used to format the file.
 * @returns Formatted Markdown.
 * @throws When the file cannot be read, markers are unmatched or nested, or data has no matching section.
 */
export function format(options: FormatOptions): string {
	const path = resolve(options.target);
	const markdown = readFileSync(path, { encoding: "utf8" });
	const data = options.data instanceof Map ? options.data : new Map(Object.entries(options.data));
	const sections = findSections(path, markdown);

	for (const id of data.keys()) {
		if (!sections.some((section) => section.id === id)) {
			throw new Error(`Unable to find section "${id}" in ${path}.`);
		}
	}

	// Content is separated from the markers by blank lines, using the line endings of the file.
	const eol = markdown.includes("\r\n") ? "\r\n" : "\n";
	let result = "";
	let offset = 0;

	for (const section of sections) {
		const content = data.get(section.id);
		if (content === undefined) {
			continue;
		}

		const lines = content.replace(/^(\r?\n)+|(\r?\n)+$/g, "").replaceAll(/\r?\n/g, eol);
		result += markdown.slice(offset, section.start) + eol + eol + (lines === "" ? "" : lines + eol + eol);
		offset = section.end;
	}

	return result + markdown.slice(offset);
}

/**
 * Finds the sections within the Markdown; only markers on their own line within top-level HTML are considered, so
 * markers within code blocks, lists, block quotes, etc. are ignored. Lines of each HTML node are searched, rather than
 * the node as a whole, because CommonMark groups a marker with an adjacent HTML block, e.g. `<div>…</div>`.
 * @param path Path to the Markdown file, used in errors.
 * @param markdown Markdown.
 * @returns Sections, in the order they appear.
 * @throws When markers are unmatched or nested.
 */
function findSections(path: string, markdown: string): Section[] {
	const tree = unified().use(remarkParse).parse(markdown);
	const sections: Section[] = [];
	let open: OpenSection | undefined;

	for (const node of tree.children) {
		const offset = node.position?.start.offset;
		const end = node.position?.end.offset;
		if (node.type !== "html" || offset === undefined || end === undefined) {
			continue;
		}

		const html = markdown.slice(offset, end);
		for (const match of html.matchAll(MARKER)) {
			const [line, marker = "", kind, id = ""] = match;
			const start = offset + match.index + line.indexOf(marker);
			const location = `${path}:${node.position!.start.line + countLines(html.slice(0, match.index))}`;

			if (kind === "start") {
				if (open !== undefined) {
					throw new Error(`Section "${id}" starts within section "${open.id}" at ${location}.`);
				}

				open = { id, location, start: start + marker.length };
			} else {
				if (open?.id !== id) {
					throw new Error(`Section "${id}" ends without starting at ${location}.`);
				}

				sections.push({ id, start: open.start, end: start });
				open = undefined;
			}
		}
	}

	if (open !== undefined) {
		throw new Error(`Section "${open.id}" does not end at ${open.location}.`);
	}

	return sections;
}

/**
 * Counts the line breaks within text, supporting `\r\n`, `\n`, and `\r`.
 * @param text Text.
 * @returns Number of line breaks.
 */
function countLines(text: string): number {
	return text.match(/\r\n|\r|\n/g)?.length ?? 0;
}
