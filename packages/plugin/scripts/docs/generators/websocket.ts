import {
	type ObjectStructure,
	type PropertyStructure,
	SerializationContext,
	type SerializationOptions,
	shortFormOptions,
	type Structure,
	type UnionStructure,
} from "../ast/index.js";
import { codeBlock, formatDescription, heading, indent, joinBlocks } from "../markdown.js";

/**
 * Aliases that should always be referenced by name, rather than expanded.
 */
const forcedAliases = ["JsonObject", "JsonValue"];

/**
 * Default serialization options.
 */
const serializationOptions: SerializationOptions = {
	preferAlias: ({ alias }) => forcedAliases.includes(alias),
};

/**
 * Renders the documentation for all types within the specified structure, for example the plugin events or commands.
 * @param structure Structure to document; either an object, or a union of objects.
 * @returns Markdown documentation of the structure.
 */
export async function renderProtocolTypes(structure: Structure): Promise<string> {
	const types: ObjectStructure[] = [];

	if (structure.isObject()) {
		types.push(structure);
	} else if (structure.isUnion()) {
		for (const type of structure.types) {
			if (!type.isObject()) {
				throw new Error("Expected type to be an object");
			}

			types.push(type);
		}
	} else {
		throw new Error("Expected structure to be an object or union");
	}

	const docs = await Promise.all(types.map((type) => renderType(type)));
	return docs
		.sort((a, b) => a.name.localeCompare(b.name, "en"))
		.map(({ content }) => content)
		.join("\n\n");
}

/**
 * Renders the documentation for a single type.
 * @param type Type to render.
 * @returns The name of the type, and its documentation.
 */
async function renderType(type: ObjectStructure): Promise<RenderedType> {
	if (!type.isAliased()) {
		throw new Error("Unable to determine alias of type");
	}

	const name = formatAlias(type.alias);
	const properties = renderProperties(type);

	return {
		name,
		content: joinBlocks(
			heading(3, name),
			formatDescription(type.description),
			codeBlock(await type.stringify(serializationOptions), "ts"),
			properties ? `**Properties**\n\n${properties}` : undefined,
		),
	};
}

/**
 * Renders the properties of the object as a nested list.
 * @param obj Object whose properties should be rendered.
 * @returns Markdown list of the properties.
 */
function renderProperties(obj: ObjectStructure): string {
	return obj.members
		.filter((member): member is PropertyStructure => member.isProperty())
		.sort((a, b) => a.name.localeCompare(b.name, "en"))
		.map((property) => {
			const { name, description, type } = property;
			const summary = type.isAliased()
				? type.alias
				: property.serialize(new SerializationContext({ ...shortFormOptions, ...serializationOptions }));

			const details = type.isUnion() ? renderUnion(type) : type.isObject() ? renderProperties(type) : "";
			const body = joinBlocks(formatDescription(description), details);

			const item = `- \`${formatAlias(name)}\`: \`${summary}\`${property.optional ? " (optional)" : ""}`;
			return body ? `${item}\n\n${indent(body)}` : item;
		})
		.join("\n\n");
}

/**
 * Renders the types within the union; only supports unions that contain all objects.
 * @param union Union whose types should be rendered.
 * @returns Markdown list of the union types.
 */
function renderUnion(union: UnionStructure): string {
	if ((union.isAliased() && forcedAliases.includes(union.alias)) || !union.types.every((t) => t.isObject())) {
		return "";
	}

	const items = union.types.map((t) => {
		const name = t.isAliased() ? formatAlias(t.alias) : "object";
		const properties = renderProperties(t as ObjectStructure);
		return properties ? `- ${name}\n\n${indent(properties)}` : `- ${name}`;
	});

	return `One of:\n\n${items.join("\n\n")}`;
}

/**
 * A rendered type, and its name.
 */
type RenderedType = {
	/**
	 * Name of the type.
	 */
	name: string;

	/**
	 * Rendered markdown.
	 */
	content: string;
};

/**
 * Formats the alias; slightly hacky, but prevent name clashes in @elgato/streamdeck.
 * @param alias Alias to format.
 * @returns The formatted alias.
 */
function formatAlias(alias: string): string {
	return alias.startsWith("UI") ? alias.substring(2) : alias;
}
