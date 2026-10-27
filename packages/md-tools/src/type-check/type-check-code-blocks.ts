import { dirname, resolve } from "node:path";

import ts from "typescript";

import { CodeBlockDiagnostic } from "./code-block-diagnostic.js";
import type { CodeBlock } from "./read-code-blocks.js";
import type { VirtualFile } from "./virtual-file.js";

/**
 * Code block languages that are type checked (case-insensitive), mapped to their virtual file extension; the extension
 * determines how TypeScript parses the code, e.g. `.tsx` enables JSX.
 */
const EXTENSIONS: Readonly<Record<string, string>> = {
	cts: ".cts",
	mts: ".mts",
	ts: ".ts",
	tsx: ".tsx",
	typescript: ".ts",
};

/**
 * Type checks the TypeScript code blocks using the specified tsconfig. Each code block is treated as its own module,
 * resolved as if it were a file within `cwd`, and all code blocks are type checked together within a single program.
 * @param options Options.
 * @returns The diagnostics, in the order of the code blocks.
 * @throws When the tsconfig file cannot be read, or is invalid.
 */
export function typeCheckCodeBlocks(options: TypeCheckCodeBlocksOptions): CodeBlockDiagnostic[] {
	const cwd = resolve(options.cwd);

	// Map each TypeScript code block to a virtual file, keyed by its normalized path so the compiler host can look it
	// up regardless of how TypeScript formats the path.
	const virtualFiles = new Map<string, VirtualFile>();

	options.codeBlocks.forEach((entry, i) => {
		const ext = EXTENSIONS[entry.lang?.toLowerCase() ?? ""];
		if (ext === undefined) {
			return;
		}

		// The index guarantees a unique file name per code block, and the extension determines how the code is parsed.
		const fileName = resolve(cwd, `__md_code_block_${i}${ext}`);
		virtualFiles.set(getKey(fileName), { entry, fileName });
	});

	// Nothing to type check; return early to avoid reading the tsconfig file, or creating a program, unnecessarily.
	if (virtualFiles.size === 0) {
		return [];
	}

	// Create a program whose root files are only the virtual files; any files they import are resolved, and loaded, from
	// the file system by the compiler host.
	const compilerOptions = getCompilerOptions(resolve(cwd, options.tsconfigFile));
	const host = createCompilerHost(compilerOptions, virtualFiles);
	const program = ts.createProgram({
		host,
		options: compilerOptions,
		rootNames: Array.from(virtualFiles.values(), (f) => f.fileName),
	});

	// Collect the diagnostics for each virtual file only; global diagnostics (e.g. a missing library), and diagnostics
	// within imported files (e.g. dependencies), are not associated with a code block, and are therefore ignored.
	const diagnostics: CodeBlockDiagnostic[] = [];
	for (const file of virtualFiles.values()) {
		const sourceFile = program.getSourceFile(file.fileName);
		if (sourceFile === undefined) {
			continue;
		}

		// Syntactic diagnostics (e.g. a missing bracket) are reported before semantic diagnostics (e.g. type errors).
		for (const d of [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)]) {
			diagnostics.push(new CodeBlockDiagnostic(d, file));
		}
	}

	return diagnostics;
}

/**
 * Options used to type check code blocks.
 */
export interface TypeCheckCodeBlocksOptions {
	/**
	 * Code blocks to type check; only code blocks whose language is TypeScript (e.g. `ts` or `tsx`) are type checked.
	 */
	codeBlocks: CodeBlock[];

	/**
	 * Directory the code blocks are type checked from; each code block is treated as a module located within this
	 * directory, so imports (e.g. relative paths and `node_modules`) and the module format (e.g. the `type` in
	 * `package.json`) are resolved from here.
	 */
	cwd: string;

	/**
	 * Path to the tsconfig file whose compiler options are used when type checking, relative to
	 * {@link TypeCheckCodeBlocksOptions.cwd}.
	 */
	tsconfigFile: string;
}

/**
 * Creates a compiler host that serves the virtual files from memory, falling back to the file system.
 * @param compilerOptions Compiler options.
 * @param virtualFiles Virtual files, keyed by {@link getKey}.
 * @returns The compiler host.
 */
function createCompilerHost(
	compilerOptions: ts.CompilerOptions,
	virtualFiles: Map<string, VirtualFile>,
): ts.CompilerHost {
	const host = ts.createCompilerHost(compilerOptions, true);

	// Capture the default implementations so the overrides can delegate to them for files that are not virtual.
	const { fileExists, getSourceFile, readFile } = host;

	// Module resolution checks whether files exist before reading them, so virtual files must be reported as existing.
	host.fileExists = (fileName): boolean => virtualFiles.has(getKey(fileName)) || fileExists.call(host, fileName);

	host.readFile = (fileName): string | undefined =>
		virtualFiles.get(getKey(fileName))?.entry.value ?? readFile.call(host, fileName);

	// Virtual files are parsed from the code block's value; parent nodes are set so diagnostics can be positioned.
	host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile): ts.SourceFile | undefined => {
		const file = virtualFiles.get(getKey(fileName));
		return file !== undefined
			? ts.createSourceFile(fileName, file.entry.value, languageVersion, true)
			: getSourceFile.call(host, fileName, languageVersion, onError, shouldCreateNewSourceFile);
	};

	return host;
}

/**
 * Reads the compiler options from the tsconfig file, adjusted for type checking code blocks.
 * @param tsconfigFile Absolute path to the tsconfig file.
 * @returns The compiler options.
 * @throws When the tsconfig file cannot be read, or is invalid.
 */
function getCompilerOptions(tsconfigFile: string): ts.CompilerOptions {
	const { config, error } = ts.readConfigFile(tsconfigFile, ts.sys.readFile);
	if (error !== undefined) {
		throw new Error(`Failed to read tsconfig file: ${flatten(error.messageText)}`);
	}

	// Parse the raw JSON into compiler options, resolving relative paths (e.g. `extends` and `typeRoots`) from the
	// directory of the tsconfig file.
	const parsed = ts.parseJsonConfigFileContent(config, ts.sys, dirname(tsconfigFile), undefined, tsconfigFile);

	// TS18003 "No inputs were found" is ignored; the tsconfig's `include` is irrelevant as the root files are the
	// virtual files, which are provided to the program explicitly.
	const errors = parsed.errors.filter((e) => e.code !== 18003);
	if (errors.length > 0) {
		throw new Error(`Invalid tsconfig file: ${errors.map((e) => flatten(e.messageText)).join("\n")}`);
	}

	return {
		...parsed.options,

		// Disable output-related options, as only type checking is required; leaving these enabled can result in
		// diagnostics unrelated to the code blocks, e.g. composite projects requiring all files to be listed.
		composite: false,
		declaration: false,
		declarationMap: false,
		emitDeclarationOnly: false,
		incremental: false,
		noEmit: true,
		tsBuildInfoFile: undefined,

		// Treat every code block as a module, even without imports or exports, so that top-level declarations are scoped
		// to the code block rather than shared globally (which would cause "Cannot redeclare" errors between code blocks).
		moduleDetection: ts.ModuleDetectionKind.Force,
	};
}

/**
 * Gets the key used to look up a virtual file; paths are normalized, and lowercased on case-insensitive file systems,
 * as TypeScript may refer to the same file using different formats.
 * @param fileName File name.
 * @returns The key.
 */
function getKey(fileName: string): string {
	const key = resolve(fileName);
	return ts.sys.useCaseSensitiveFileNames ? key : key.toLowerCase();
}

/**
 * Flattens the diagnostic message, joining chained messages with new lines.
 * @param messageText Message text.
 * @returns The message.
 */
function flatten(messageText: string | ts.DiagnosticMessageChain): string {
	return ts.flattenDiagnosticMessageText(messageText, "\n");
}
