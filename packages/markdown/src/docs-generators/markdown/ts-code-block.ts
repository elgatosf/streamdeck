import config from "@elgato/oxfmt-config";
import { format } from "oxfmt";
import { ts } from "ts-morph";

import { codeBlock } from "./syntax.js";

/**
 * Kind of TypeScript code to format.
 */
export type TypeScriptCodeKind = "declaration" | "member" | "property";

// Oxfmt sees a synthetic TypeScript file, but the snippets belong in Markdown. Apply the shared Markdown overrides
// explicitly and force LF so wrapper extraction does not depend on the host's line endings.
const markdownOptions = config.overrides
	?.filter((override) => override.files.includes("*.md"))
	.reduce((options, override) => ({ ...options, ...override.options }), {});
const formatOptions = { ...config, ...markdownOptions, endOfLine: "lf" } as const;

/**
 * Formats TypeScript with oxfmt and wraps it in a Markdown code block. Property signatures and enum members are
 * formatted inside synthetic declarations so the formatter parses them in their intended TypeScript context; the
 * declarations are removed before the snippets are emitted.
 * @param code TypeScript code.
 * @param kind Whether the code is a declaration, enum member, or property signature.
 * @returns Formatted fenced code block.
 * @throws When oxfmt cannot format the code.
 */
export async function tsCodeBlock(code: string, kind: TypeScriptCodeKind = "declaration"): Promise<string> {
	const wrapper = kind === "property" ? "interface __Documentation" : kind === "member" ? "enum __Documentation" : "";
	const source = wrapper.length > 0 ? `${wrapper} {\n${code}\n}` : code;
	const result = await format("documentation.ts", source, formatOptions);

	// Oxfmt can return diagnostics alongside unchanged text instead of rejecting the formatting promise.
	if (result.errors.length > 0) {
		throw new Error(
			`Unable to format TypeScript code block:\n${result.errors
				.map((error) => `${error.message}${error.codeframe ? `\n${error.codeframe}` : ""}`)
				.join("\n")}`,
		);
	}

	const formatted = wrapper.length > 0 ? unwrap(result.code, wrapper) : result.code.replace(/\n$/, "");
	return codeBlock(formatted);
}

/**
 * Removes the surrounding declaration and its indentation from a formatted property or enum member. Literal-token
 * ranges distinguish wrapper indentation from whitespace that is part of a multiline string or template literal.
 * @param source Formatted declaration.
 * @param wrapper Declaration used to wrap the snippet.
 * @returns Formatted snippet.
 * @throws When the formatted output does not contain the expected wrapper or indentation.
 */
function unwrap(source: string, wrapper: string): string {
	const prefix = `${wrapper} {\n`;
	const suffix = "\n}\n";
	if (!source.startsWith(prefix) || !source.endsWith(suffix)) {
		throw new Error(`Unable to extract formatted TypeScript code block from ${wrapper}.`);
	}

	const body = source.slice(prefix.length, -suffix.length);
	const indent = /^[ \t]+/.exec(body)?.[0];
	if (indent === undefined) {
		throw new Error(`Unable to determine indentation of formatted TypeScript code block in ${wrapper}.`);
	}

	const file = ts.createSourceFile("documentation.ts", source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
	const literalRanges: [number, number][] = [];
	// Track template tokens separately from their expressions, whose TypeScript indentation can still be removed.
	const visit = (node: ts.Node): void => {
		if (
			ts.isStringLiteral(node) ||
			ts.isNoSubstitutionTemplateLiteral(node) ||
			ts.isTemplateHead(node) ||
			ts.isTemplateMiddle(node) ||
			ts.isTemplateTail(node)
		) {
			literalRanges.push([node.getStart(file), node.getEnd()]);
		}
		ts.forEachChild(node, visit);
	};
	visit(file);

	let offset = prefix.length;
	return body
		.split("\n")
		.map((line) => {
			// Indentation inside a multiline literal is part of its value, not the wrapper's indentation.
			const inLiteral = literalRanges.some(([start, end]) => start < offset && offset < end);
			const unindented = !inLiteral && line.startsWith(indent) ? line.slice(indent.length) : line;
			offset += line.length + 1;
			return unindented;
		})
		.join("\n");
}
