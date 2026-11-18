import type { MarkdownFile } from "../markdown-file.js";
import type { CodeBlockDiagnostic } from "./code-block-diagnostic.js";
import { readCodeBlocks } from "./read-code-blocks.js";
import { typeCheckCodeBlocks } from "./type-check-code-blocks.js";

/**
 * Type checks TypeScript code blocks from the files' shared syntax trees in a single TypeScript program.
 * @param files Markdown files held in memory.
 * @param options Options.
 * @returns The diagnostics, with positions relative to their markdown file.
 */
export function typeCheck(files: readonly MarkdownFile[], options: TypeCheckOptions = {}): CodeBlockDiagnostic[] {
	const { codeBlockDir = process.cwd(), tsconfigFile = "tsconfig.json" } = options;

	return typeCheckCodeBlocks({
		codeBlockDir,
		codeBlocks: files.flatMap((file) => readCodeBlocks(file)),
		tsconfigFile,
	});
}

/**
 * Options used to type check the TypeScript code blocks within markdown files.
 */
export interface TypeCheckOptions {
	/**
	 * Directory the code blocks are type checked from; each code block is treated as a module located within this
	 * directory, so imports (e.g. relative paths and `node_modules`) and the module format (e.g. the `type` in
	 * `package.json`) are resolved from here. Defaults to the current working directory.
	 */
	codeBlockDir?: string;

	/**
	 * Path to the tsconfig file whose compiler options are used when type checking, relative to
	 * {@link TypeCheckOptions.codeBlockDir}.
	 */
	tsconfigFile?: string;
}
