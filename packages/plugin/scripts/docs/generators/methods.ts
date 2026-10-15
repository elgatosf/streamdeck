import { type MethodStructure, type ObjectStructure, SerializationContext } from "../ast/index.js";
import { codeBlock, formatDescription, heading, joinBlocks, tableCell } from "../markdown.js";

/**
 * Generates the documentation for the methods of the specified structure.
 * @param source Structure that contains information about the methods.
 * @param filter Optional filter to apply when determining which methods to write.
 * @returns Markdown documentation of the methods.
 */
export async function renderMethods(
	source: ObjectStructure,
	filter: (method: MethodStructure) => boolean = (): boolean => true,
): Promise<string> {
	const methods = source.methods.filter(filter).sort((a, b) => a.name.localeCompare(b.name, "en"));
	const paramSerializationCtx = new SerializationContext({ preferAlias: (): boolean => true });
	const blocks: string[] = [];

	for (const method of methods) {
		// Assume each method has a single signature.
		const [signature, ...signatures] = method.signatures;
		if (!signature || signatures.length > 1) {
			throw new Error(`Unsupported method structure for ${method.name}: signature not found, or multiple defined`);
		}

		const name = method.optional ? `${method.name}?` : method.name;
		const declaration = codeBlock(`function ${name}${await signature.stringify({ rawOutput: true })}`, "ts");

		let parameters: string | undefined;
		if (signature.parameters.length > 0) {
			const rows = signature.parameters.map((p) => {
				const type = `\`${p.type.serialize(paramSerializationCtx)}\`${p.optional ? " (optional)" : ""}`;
				return `| \`${p.name}\` | ${type} | ${tableCell(formatDescription(p.description))} |`;
			});

			parameters = ["**Parameters**", "", "| Name | Type | Description |", "| --- | --- | --- |", ...rows].join("\n");
		}

		blocks.push(joinBlocks(heading(3, method.name), formatDescription(signature.description), declaration, parameters));
	}

	return blocks.join("\n\n");
}
