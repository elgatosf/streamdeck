import { relative, resolve } from "node:path";

import ts from "typescript";

import type { VirtualFile } from "./virtual-file.js";

/**
 * Diagnostic reported for a code block, with positions relative to the markdown file.
 */
export class TypeScriptDiagnostic {
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
	public readonly column?: number;

	/**
	 * 1-based line within the markdown file.
	 */
	public readonly line?: number;

	/**
	 * Link to the location within the markdown file, e.g. `docs/README.md:12:5`; the path is relative to the current
	 * working directory of the process. Diagnostics that are not associated with a code block link to the tsconfig file.
	 */
	public readonly link: string;

	/**
	 * Diagnostic message; chained messages are flattened, and separated by new lines.
	 */
	public readonly message: string;

	/**
	 * Initializes a new instance of the {@link TypeScriptDiagnostic} class from the TypeScript diagnostic.
	 * @param diagnostic TypeScript diagnostic.
	 * @param source Virtual file of the code block the diagnostic was reported for, or the path to the file to link to
	 * when the diagnostic is not associated with a code block, e.g. the tsconfig file.
	 */
	constructor(diagnostic: ts.Diagnostic, source: VirtualFile | string) {
		this.category = ts.DiagnosticCategory[diagnostic.category].toLowerCase() as TypeScriptDiagnostic["category"];
		this.code = diagnostic.code;
		this.message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

		if (typeof source === "string") {
			this.link = toLinkPath(source);
			return;
		}

		const { start } = source.entry.position;
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

		this.link = `${toLinkPath(source.entry.file)}:${this.line}:${this.column}`;
	}
}

/**
 * Gets the path used within a diagnostic link, relative to the current working directory of the process.
 * @param file Path to the file.
 * @returns The path.
 */
function toLinkPath(file: string): string {
	return relative(process.cwd(), resolve(file)).replaceAll("\\", "/");
}
