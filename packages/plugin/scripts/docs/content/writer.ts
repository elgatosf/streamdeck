import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import ejs from "ejs";

import { type MethodStructure, type ObjectStructure, SerializationContext } from "../ast/index.js";
import { ContentBuilderContext } from "./context.js";

export { ContentBuilderContext };

/**
 * Formats JSDoc links within the specified text. Links that reference internal components are converted
 * to inline code elements, and links that reference external links are converted to markdown links.
 * @param text Text to format.
 * @returns Formatted text with the JSDoc links replaced with markdown equivalent.
 */
export function formatJSDocLinks(text: string): string {
	return text.replaceAll(/{@link\s(.*?)(\s.*?)?}/g, (_: string, link: string, name?: string) => {
		if (link.startsWith("http://") || link.startsWith("https://")) {
			return `[${(name ?? link).trim()}](${link})`;
		}

		return `\`${link}\``;
	});
}

/**
 * Provides a content writer, responsible for writing markdown content, and content to files.
 */
export class ContentWriter {
	/**
	 * Initializes a new instance of the {@link ContentWriter} class.
	 * @param id Identifier of the content file writher; this is usually the plugin responsible for generating the content.
	 */
	constructor(public readonly id: string) {}

	/**
	 * Formats the code into a code block.
	 * @param code Code block contents to write.
	 * @param opts Options that define the code block.
	 * @returns The markdown codeblock.
	 */
	public codeBlock(code: string, opts?: CodeBlockOptions): string {
		const { lang = "", title: maybeTitle, meta = "" } = opts || {};
		const title = maybeTitle ? `title="${maybeTitle}"` : "";

		const tag = "```";
		return `${tag}${lang} ${title} ${meta}\n${code}\n${tag}`;
	}

	/**
	 * Resolves the path, relative to the SDK documentation directory, `docs/sdk`.
	 * @param path Path.
	 * @returns Resolved path.
	 */
	public resolve(...path: string[]): string {
		return resolve(join(import.meta.dirname, "../../../../../docs/sdk", ...path));
	}

	/**
	 * Writes the code as a markdown code block to the path, relative to the documentation directory
	 * @param path Path of the file to write.
	 * @param code Code block contents to write.
	 * @param opts Options that define the code block.
	 * @returns Promise fulfilled when the file has been written.
	 */
	public writeCodeBlockFile(path: string, code: string, opts?: CodeBlockOptions): Promise<void> {
		return this.writeFile(path, this.codeBlock(code, opts) + "\n");
	}

	/**
	 * Writes the contents to the path, relative to the documentation directory.
	 * @param path Path of the file to write.
	 * @param contents Contents to write.
	 * @returns Promise fulfilled when the file has been written.
	 */
	public writeFile(path: string, contents: string): Promise<void> {
		console.log(`\x1b[2m[${this.id}] ${path}\x1b[0m`);
		return writeFile(this.resolve(path), contents, { encoding: "utf-8" });
	}

	/**
	 * Generates the documentation for the specified methods, and outputs them to the path.Writes the specified methods
	 * @param path Path where the contents should be written.
	 * @param source Structure that contains information about the methods.
	 * @param filter Optional filter to apply when determining which methods to write.
	 */
	public async writeMethods(
		path: string,
		source: ObjectStructure,
		filter?: (method: MethodStructure) => boolean,
	): Promise<void> {
		const format = ejs.compile(`
<details>
<summary>
	### <%- name %>
</summary>
	<%- description %>
	<%- snippet %>
	<% if (parameters.length) { %>
		**Parameters**
		<% for (const { name, type, description, optional } of parameters) { %>
			<ObjectMember name="<%- name %>" <% if (optional) { %>optional<% } %>>
				<ObjectMember.Type><%- type %></ObjectMember.Type>
				<p><%- description %></p>
			</ObjectMember>
		<% } %>
	<% } %>
</details>
`);

		let content = "";

		filter ??= (): boolean => true;
		const methods = source.methods.filter(filter).sort((a, b) => a.name.localeCompare(b.name));
		const paramSerializationCtx = new SerializationContext({ preferAlias: (): boolean => true });

		// Iterate over the methods.
		for (const method of methods) {
			// Assume each method has a single signature.
			const [signature, ...signatures] = method.signatures;
			if (!signature || signatures.length > 1) {
				throw new Error("Unsupported method structure: signature not found, or multiple defined");
			}

			// Format each method.
			const text = method.optional ? `${method.name}?` : method.name;
			content += format({
				name: method.name,
				snippet: this.codeBlock(`function ${text}${await signature.stringify({ rawOutput: true })}`, { lang: "ts" }),
				description: formatJSDocLinks(signature.description || ""),
				parameters: signature.parameters.map((p) => {
					return {
						name: p.name,
						type: p.type.serialize(paramSerializationCtx),
						optional: p.optional,
						description: formatJSDocLinks(p.description || ""),
					};
				}),
			});
		}

		await this.writeFile(path, content);
	}
}

/**
 * Options available to MD code blocks.
 */
type CodeBlockOptions = {
	/**
	 * Title of the code block.
	 */
	title?: string;

	/**
	 * Language the code block is for.
	 */
	lang?: string;

	/**
	 * Optional meta string, for example `showLineNumbers {2-5}`
	 */
	meta?: string;
};
