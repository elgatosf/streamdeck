import { sdkDeclarations } from "../ast/dts-reader.js";
import type { MethodStructure } from "../ast/index.js";
import { ContentWriter } from "../content/index.js";

const name = "stream-deck-plugin-action";

/**
 * Generates content from the `Action` class.
 */
export async function loadContent(): Promise<void> {
	const writer = new ContentWriter(name);

	/**
	 * Writes the methods of the SDK type to the path.
	 * @param path Path of the file to write, relative to the documentation directory.
	 * @param typeName Name of the type within the SDK.
	 * @param filter Optional filter to apply when determining which methods to write.
	 * @returns Promise fulfilled when the file has been written.
	 */
	function writeMethods(path: string, typeName: string, filter?: (method: MethodStructure) => boolean): Promise<void> {
		const type = sdkDeclarations.getStructure(typeName);
		if (!type.isObject()) {
			throw new Error(`Expected ${typeName} to be an object`);
		}

		return writer.writeMethods(path, type, filter);
	}

	const ignoreTypeAssertionMethods = (m: MethodStructure): boolean => !m.name.startsWith("is") && m.name !== "toJSON";

	await writeMethods("guides/_actions-commands.g.mdx", "ActionBase", (m: MethodStructure) => m.name !== "toJSON");
	await writeMethods("guides/_keys-commands.g.mdx", "KeyAction", ignoreTypeAssertionMethods);
	await writeMethods("guides/_dials-commands.g.mdx", "DialAction", ignoreTypeAssertionMethods);
	await writeMethods("guides/_neo-infobar-commands.g.mdx", "NeoInfobarAction", ignoreTypeAssertionMethods);
}
