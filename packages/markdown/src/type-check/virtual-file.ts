import type { CodeBlock } from "./read-code-blocks.js";

/**
 * Code block mapped to a virtual source file.
 */
export interface VirtualFile {
	/**
	 * Code block the virtual file represents.
	 */
	entry: CodeBlock;

	/**
	 * Absolute path of the virtual file, located within the `cwd` so imports are resolved from there.
	 */
	fileName: string;
}
