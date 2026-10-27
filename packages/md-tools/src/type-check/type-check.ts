import type { CodeBlockDiagnostic } from "./code-block-diagnostic.js";
import { findMarkdownFiles } from "./find-markdown-files.js";
import { readCodeBlocks } from "./read-code-blocks.js";
import { typeCheckCodeBlocks } from "./type-check-code-blocks.js";

/**
 * Type checks the TypeScript code blocks within the markdown files matching the source glob pattern.
 * @param options Options.
 * @returns The diagnostics, with positions relative to their markdown file.
 */
export async function typeCheck(options: TypeCheckOptions): Promise<CodeBlockDiagnostic[]> {
	const { src, cwd = process.cwd(), tsconfigFile = "tsconfig.json" } = options;

	const markdownFiles = await findMarkdownFiles(src, cwd);
	const codeBlocks = await Promise.all(markdownFiles.map((file) => readCodeBlocks(file)));

	return typeCheckCodeBlocks({
		codeBlocks: codeBlocks.flat(),
		cwd,
		tsconfigFile: tsconfigFile,
	});
}

/**
 * Options used to type check the TypeScript code blocks within markdown files.
 */
export interface TypeCheckOptions {
	/**
	 * Directory the code blocks are type checked from; each code block is treated as a module located within this
	 * directory, so imports (e.g. relative paths and `node_modules`) and the module format (e.g. the `type` in
	 * `package.json`) are resolved from here.
	 */
	cwd?: string;

	/**
	 * Glob pattern of the markdown files containing the code blocks, e.g. `README.md` or `docs/*.md`, matched using
	 * Node.js' built-in `glob`. Patterns are resolved from {@link TypeCheckOptions.cwd}, and `node_modules` directories
	 * are ignored.
	 */
	src: string;

	/**
	 * Path to the tsconfig file whose compiler options are used when type checking, relative to
	 * {@link TypeCheckOptions.cwd}.
	 */
	tsconfigFile?: string;
}
