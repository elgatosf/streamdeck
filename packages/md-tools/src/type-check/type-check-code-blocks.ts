import { dirname, resolve } from "node:path";

import ts from "typescript";

import type { CodeBlock } from "./read-code-blocks.js";
import { TypeScriptDiagnostic } from "./ts-diagnostic.js";
import type { VirtualFile } from "./virtual-file.js";

/**
 * Code block languages that are type checked, mapped to their virtual file extension.
 */
const EXTENSIONS: Readonly<Record<string, string>> = {
	cts: ".cts",
	mts: ".mts",
	ts: ".ts",
	tsx: ".tsx",
	typescript: ".ts",
};

/**
 * Type checks the TypeScript code blocks using the specified tsconfig; each code block is treated as its own module,
 * and is resolved as if it were located within `cwd`. Code blocks from multiple markdown files are type checked
 * together.
 * @param options Options.
 * @returns The diagnostics, in the order of the code blocks.
 */
export function typeCheckCodeBlocks(options: TypeCheckCodeBlocksOptions): TypeScriptDiagnostic[] {
	const cwd = resolve(options.cwd);
	const virtualFiles = new Map<string, VirtualFile>();

	options.codeBlocks.forEach((entry, i) => {
		const ext = EXTENSIONS[entry.lang?.toLowerCase() ?? ""];
		if (ext === undefined) {
			return;
		}

		const fileName = resolve(cwd, `__md_code_block_${i}${ext}`);
		virtualFiles.set(getKey(fileName), { entry, fileName });
	});

	if (virtualFiles.size === 0) {
		return [];
	}

	const tsconfigFile = resolve(cwd, options.tsconfigFile);
	const compilerOptions = getCompilerOptions(tsconfigFile);
	const host = createCompilerHost(compilerOptions, virtualFiles);
	const program = ts.createProgram({
		host,
		options: compilerOptions,
		rootNames: Array.from(virtualFiles.values(), (f) => f.fileName),
	});

	const diagnostics = program.getGlobalDiagnostics().map((d) => new TypeScriptDiagnostic(d, tsconfigFile));

	for (const file of virtualFiles.values()) {
		const sourceFile = program.getSourceFile(file.fileName);
		if (sourceFile === undefined) {
			continue;
		}

		for (const d of [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)]) {
			diagnostics.push(new TypeScriptDiagnostic(d, file));
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
 * Creates a compiler host that serves the virtual files, falling back to the file system.
 * @param compilerOptions Compiler options.
 * @param virtualFiles Virtual files.
 * @returns The compiler host.
 */
function createCompilerHost(
	compilerOptions: ts.CompilerOptions,
	virtualFiles: Map<string, VirtualFile>,
): ts.CompilerHost {
	const host = ts.createCompilerHost(compilerOptions, true);
	const { fileExists, getSourceFile, readFile } = host;

	host.fileExists = (fileName): boolean => virtualFiles.has(getKey(fileName)) || fileExists.call(host, fileName);
	host.readFile = (fileName): string | undefined =>
		virtualFiles.get(getKey(fileName))?.entry.value ?? readFile.call(host, fileName);
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
 */
function getCompilerOptions(tsconfigFile: string): ts.CompilerOptions {
	const { config, error } = ts.readConfigFile(tsconfigFile, ts.sys.readFile);
	if (error !== undefined) {
		throw new Error(`Failed to read tsconfig file: ${flatten(error.messageText)}`);
	}

	const parsed = ts.parseJsonConfigFileContent(config, ts.sys, dirname(tsconfigFile), undefined, tsconfigFile);
	const errors = parsed.errors.filter((e) => e.code !== 18003); // No inputs found; root files are provided explicitly.
	if (errors.length > 0) {
		throw new Error(`Invalid tsconfig file: ${errors.map((e) => flatten(e.messageText)).join("\n")}`);
	}

	return {
		...parsed.options,
		composite: false,
		declaration: false,
		declarationMap: false,
		emitDeclarationOnly: false,
		incremental: false,
		moduleDetection: ts.ModuleDetectionKind.Force,
		noEmit: true,
		tsBuildInfoFile: undefined,
	};
}

/**
 * Gets the lookup key for the file name.
 * @param fileName File name.
 * @returns The key.
 */
function getKey(fileName: string): string {
	const key = resolve(fileName);
	return ts.sys.useCaseSensitiveFileNames ? key : key.toLowerCase();
}

/**
 * Flattens the diagnostic message.
 * @param messageText Message text.
 * @returns The message.
 */
function flatten(messageText: string | ts.DiagnosticMessageChain): string {
	return ts.flattenDiagnosticMessageText(messageText, "\n");
}
