import { join, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, test } from "vitest";

import { CodeBlockDiagnostic } from "../code-block-diagnostic.js";
import type { CodeBlock } from "../read-code-blocks.js";
import type { VirtualFile } from "../virtual-file.js";

/**
 * Creates a TypeScript diagnostic, without a file or position, for the specified overrides.
 * @param overrides Properties to override.
 * @returns The diagnostic.
 */
function createDiagnostic(overrides: Partial<ts.Diagnostic> = {}): ts.Diagnostic {
	return {
		category: ts.DiagnosticCategory.Error,
		code: 2322,
		file: undefined,
		length: undefined,
		messageText: "Type 'string' is not assignable to type 'number'.",
		start: undefined,
		...overrides,
	};
}

/**
 * Creates a TypeScript diagnostic reported at the position of the search text within the code.
 * @param code Code the diagnostic is reported for.
 * @param search Text within the code the diagnostic is reported at.
 * @returns The diagnostic.
 */
function createDiagnosticAt(code: string, search: string): ts.Diagnostic {
	const start = code.indexOf(search);
	expect(start).toBeGreaterThanOrEqual(0);

	return createDiagnostic({
		file: ts.createSourceFile("__md_code_block_0.ts", code, ts.ScriptTarget.ES2022, true),
		length: search.length,
		start,
	});
}

/**
 * Creates a virtual file for a code block within the markdown file.
 * @param options Options.
 * @param options.code Code within the code block.
 * @param options.column 1-based column of the opening fence within the markdown file.
 * @param options.file Path to the markdown file.
 * @param options.line 1-based line of the opening fence within the markdown file.
 * @returns The virtual file.
 */
function createVirtualFile({
	code = "",
	column = 1,
	file = resolve("README.md"),
	line = 1,
}: {
	code?: string;
	column?: number;
	file?: string;
	line?: number;
} = {}): VirtualFile {
	const entry: CodeBlock = {
		file,
		lang: "ts",
		meta: null,
		position: {
			end: { column: column + 3, line: line + code.split("\n").length + 1 },
			start: { column, line },
		},
		type: "code",
		value: code,
	};

	return {
		entry,
		fileName: resolve("__md_code_block_0.ts"),
	};
}

describe("CodeBlockDiagnostic", () => {
	/**
	 * Provides assertions for the properties copied from the TypeScript diagnostic.
	 */
	describe("properties", () => {
		/**
		 * Asserts the category is converted to its lowercase name.
		 */
		test.each([
			[ts.DiagnosticCategory.Error, "error"],
			[ts.DiagnosticCategory.Message, "message"],
			[ts.DiagnosticCategory.Suggestion, "suggestion"],
			[ts.DiagnosticCategory.Warning, "warning"],
		])("category %i is %s", (category, expected) => {
			const diagnostic = new CodeBlockDiagnostic(createDiagnostic({ category }), createVirtualFile());

			expect(diagnostic.category).toBe(expected);
		});

		/**
		 * Asserts the code is copied from the TypeScript diagnostic.
		 */
		test("code", () => {
			const diagnostic = new CodeBlockDiagnostic(createDiagnostic({ code: 7006 }), createVirtualFile());

			expect(diagnostic.code).toBe(7006);
		});

		/**
		 * Asserts a message string is used as-is.
		 */
		test("message", () => {
			const diagnostic = new CodeBlockDiagnostic(createDiagnostic({ messageText: "Hello world" }), createVirtualFile());

			expect(diagnostic.message).toBe("Hello world");
		});

		/**
		 * Asserts a message chain is flattened, with each chained message on a new line.
		 */
		test("message chain", () => {
			// Arrange.
			const messageText: ts.DiagnosticMessageChain = {
				category: ts.DiagnosticCategory.Error,
				code: 2322,
				messageText: "Outer",
				next: [{ category: ts.DiagnosticCategory.Error, code: 2322, messageText: "Inner", next: undefined }],
			};

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnostic({ messageText }), createVirtualFile());

			// Assert.
			expect(diagnostic.message).toBe("Outer\n  Inner");
		});

		/**
		 * Asserts the diagnostic is an instance of the class.
		 */
		test("instance", () => {
			expect(new CodeBlockDiagnostic(createDiagnostic(), createVirtualFile())).toBeInstanceOf(CodeBlockDiagnostic);
		});
	});

	/**
	 * Provides assertions for diagnostics reported for a code block.
	 */
	describe("virtual file source", () => {
		/**
		 * Asserts the position within the code is offset by the position of the code within the markdown file.
		 */
		test("position is relative to the markdown file", () => {
			// Arrange.
			const code = "const ok = 1;\nconst a: number = 'x';";
			const file = createVirtualFile({ code, column: 3, line: 4 });

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnosticAt(code, "a:"), file);

			// Assert.
			expect(diagnostic.line).toBe(6);
			expect(diagnostic.column).toBe(9);
		});

		/**
		 * Asserts a diagnostic at the start of the code is reported at the first line and column of the code.
		 */
		test("start of the code", () => {
			// Arrange.
			const code = "const a: number = 'x';";
			const file = createVirtualFile({ code, line: 3 });

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnosticAt(code, "const"), file);

			// Assert.
			expect(diagnostic.line).toBe(4);
			expect(diagnostic.column).toBe(1);
		});

		/**
		 * Asserts the file is the absolute path to the markdown file containing the code block.
		 */
		test("file is the markdown file", () => {
			// Arrange.
			const markdownFile = join(process.cwd(), "docs", "README.md");
			const file = createVirtualFile({ code: "const a = 1;", file: markdownFile });

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnostic(), file);

			// Assert.
			expect(diagnostic.file).toBe(markdownFile);
		});

		/**
		 * Asserts the link is the path to the markdown file, including the line and column.
		 */
		test("links to the markdown file, with a position", () => {
			// Arrange.
			const code = "const a: number = 'x';";
			const file = createVirtualFile({ code, file: join(process.cwd(), "docs", "README.md"), line: 3 });

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnosticAt(code, "a:"), file);

			// Assert.
			expect(diagnostic.link).toBe("docs/README.md:4:7");
		});

		/**
		 * Asserts a markdown file outside the current working directory of the process is linked using a relative path,
		 * with forward slashes.
		 */
		test("markdown file outside of the current working directory", () => {
			// Arrange.
			const code = "const a: number = 'x';";
			const file = createVirtualFile({ code, file: resolve("..", "other", "README.md"), line: 3 });

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnosticAt(code, "a:"), file);

			// Assert.
			expect(diagnostic.link).toBe("../other/README.md:4:7");
		});

		/**
		 * Asserts a diagnostic without a position falls back to the start of the code block.
		 */
		test("diagnostic without a position falls back to the start of the code block", () => {
			// Arrange.
			const file = createVirtualFile({ code: "const a = 1;", column: 3, line: 7 });

			// Act.
			const diagnostic = new CodeBlockDiagnostic(createDiagnostic(), file);

			// Assert.
			expect(diagnostic.line).toBe(7);
			expect(diagnostic.column).toBe(3);
			expect(diagnostic.link).toBe("README.md:7:3");
		});
	});
});
