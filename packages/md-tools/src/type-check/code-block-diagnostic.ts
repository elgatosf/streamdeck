import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

import type { VirtualFile } from "./virtual-file.js";

/**
 * Diagnostic reported for a code block, with positions relative to the markdown file.
 */
export class CodeBlockDiagnostic {
	/**
	 * Category of the diagnostic, as reported by TypeScript.
	 */
	public readonly category: "error" | "message" | "suggestion" | "warning";

	/**
	 * TypeScript diagnostic code, e.g. `2322` for `TS2322`.
	 */
	public readonly code: number;

	/**
	 * 1-based column within the markdown file.
	 */
	public readonly column: number;

	/**
	 * Absolute path to the markdown file containing the code block the diagnostic was reported for.
	 */
	public readonly file: string;

	/**
	 * 1-based line within the markdown file.
	 */
	public readonly line: number;

	/**
	 * Link to the location within the markdown file, e.g. `docs/README.md:12:5`; the path is relative to the current
	 * working directory of the process.
	 */
	public readonly link: string;

	/**
	 * Diagnostic message; chained messages are flattened, and separated by new lines.
	 */
	public readonly message: string;

	/**
	 * Initializes a new instance of the {@link CodeBlockDiagnostic} class from the TypeScript diagnostic.
	 * @param diagnostic TypeScript diagnostic.
	 * @param source Virtual file of the code block the diagnostic was reported for.
	 */
	constructor(diagnostic: ts.Diagnostic, source: VirtualFile) {
		this.category = ts.DiagnosticCategory[diagnostic.category].toLowerCase() as CodeBlockDiagnostic["category"];
		this.code = diagnostic.code;
		this.message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

		const { start } = source.entry.position;
		this.file = source.entry.file;

		if (diagnostic.file !== undefined && diagnostic.start !== undefined) {
			// Code blocks are fenced, so the code starts on the line after the opening fence, aligned with the fence.
			const { character, line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			this.line = start.line + line + 1;
			this.column = start.column + character;
		} else {
			// Fallback to the start of the code block.
			this.line = start.line;
			this.column = start.column;
		}

		const linkPath = pathToFileURL(resolve(this.file));

		this.link = `${linkPath}:${this.line}:${this.column}`;
	}
}
