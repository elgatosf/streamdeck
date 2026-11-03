import ejs from "ejs";

import { apiDeclarations } from "../ast/dts-reader.js";
import {
	type ObjectStructure,
	type PropertyStructure,
	SerializationContext,
	type SerializationOptions,
	shortFormOptions,
	type Structure,
	type UnionStructure,
} from "../ast/index.js";
import { ContentWriter, formatJSDocLinks } from "../content/index.js";

const name = "stream-deck-plugin-websocket";
const forcedAliases = ["JsonObject", "JsonValue"];

/**
 * Generates content for the Stream Deck SDK WebSocket page.
 */
export async function loadContent(): Promise<void> {
	const writer = new ContentWriter(name);

	const template = `
<% for (const doc of docs) { %>
### <%= doc.name %>{#<%= doc.name.toLowerCase() %>}
<%- doc.description ?? "" %>

\`\`\`ts
<%- doc.type %>
\`\`\`

<%- doc.contents %>
<% } %>`;

	const docs = [
		{
			name: "PluginEvent",
			dist: "references/websocket/_plugin-events.g.mdx",
			declarations: apiDeclarations.plugin,
		},
		{
			name: "PluginCommand",
			dist: "references/websocket/_plugin-commands.g.mdx",
			declarations: apiDeclarations.plugin,
		},
		// TODO: Re-introduce this once @streamdeck/ui is compatible with @elgato/streamdeck
		// {
		// 	name: "Event",
		// 	dist: "references/websocket/_ui-events.g.mdx",
		// 	declarations: apiDeclarations.ui,
		// },
		// {
		// 	name: "Command",
		// 	dist: "references/websocket/_ui-commands.g.mdx",
		// 	declarations: apiDeclarations.ui,
		// },
		{
			name: "RegistrationInfo",
			dist: "references/websocket/_registration-info.g.mdx",
			declarations: apiDeclarations.plugin,
		},
	];

	for (const { name, dist, declarations } of docs) {
		const contents = await getDocs(declarations.getStructure(name));
		writer.writeFile(dist, ejs.render(template, { docs: contents }));
	}

	// TODO: Re-introduce this once @streamdeck/ui is compatible with @elgato/streamdeck
	// const uiConnectFn = apiDeclarations.ui.getStructure("ConnectElgatoStreamDeckSocketFn");
	// writer.writeFile(
	// 	"references/websocket/_registration-ui-connect.g.mdx",
	// 	writeConnectElgatoStreamDeckSocket(uiConnectFn),
	// );
}

/**
 * Default serialization options.
 */
const serializationOptions: SerializationOptions = {
	preferAlias: ({ alias }) => alias === "JsonObject" || alias === "JsonValue",
};

/**
 * Gets the documentation for the `connectElgatoStreamDeckSocket` function, used to connect to Stream Deck in the PI.
 * @param fn connectElgatoStreamDeckSocket
 * @returns The documentation for `connectElgatoStreamDeckSocket`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used once @streamdeck/ui is compatible, see above.
function writeConnectElgatoStreamDeckSocket(fn: Structure): string {
	if (!fn.isSignature()) {
		throw new Error("Expected ConnectElgatoStreamDeckSocketFn to be a function signature");
	}

	const template = `
### connectElgatoStreamDeckSocket

<%- description %>

\`\`\`ts
window.connectElgatoStreamDeckSocket = <%- type %>
\`\`\`

**Parameters**

| Name | Description |
| - | - |<% for (const param of parameters) { %>
| <%- param.name %> | <%- param.description ?? "" %> |<% } %>`;

	return ejs.render(template, {
		description: fn.description,
		type: fn.serialize(new SerializationContext()),
		parameters: fn.parameters,
	});
}

/**
 * Gets the documentation for all types within the specified structure.
 * @param structure Structure to document.
 * @returns Documentation for the structure.
 */
async function getDocs(structure: Structure): Promise<ObjectDocs[]> {
	// When the structure is an object, return the docs.
	if (structure.isObject()) {
		return [await __getDocs(structure)];
	}

	// Otherwise, expect the structure to be a collection of types.
	if (!structure.isUnion()) {
		throw new Error("Expected structure to be a union");
	}

	const docs: ObjectDocs[] = [];
	for (const type of structure.types) {
		// Specifically, types must be objects.
		if (!type.isObject()) {
			throw new Error("Expected type to be an object");
		}

		docs.push(await __getDocs(type));
	}

	return docs.sort((a, b) => a.name.localeCompare(b.name));

	/**
	 * Gets the documentation for the object.
	 * @param type Object to document.
	 * @returns Documentation for the object.
	 */
	async function __getDocs(type: ObjectStructure): Promise<ObjectDocs> {
		// Ensure the type is aliased.
		if (!type.isAliased()) {
			throw new Error("Unable to determine alias of type");
		}

		return {
			name: formatAlias(type.alias),
			description: formatJSDocLinks(type.description ?? ""),
			contents: getPropertiesOf(type),
			type: await type.stringify(serializationOptions),
		};
	}
}

/**
 * Gets the documentation for all properties within the object.
 * @param obj Object whose properties should be documented.
 * @returns Documentation for the properties.
 */
function getPropertiesOf(obj: ObjectStructure): string {
	const template = `
<% for (const member of members) { %>
<ObjectMember name="<%= member.name %>" <% if (member.optional) { %>optional<% } %>>
	<ObjectMember.Type><%- member.type %></ObjectMember.Type>
	<%- member.description %>
	<%- member.contents ?? "" %>
</ObjectMember>
<% } %>`;

	const propertySerializationCtx = new SerializationContext({ ...shortFormOptions, ...serializationOptions });
	const members = obj.members
		.filter((member): member is PropertyStructure => member.isProperty())
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((property) => {
			const { name, description, type } = property;
			return {
				name: formatAlias(name),
				description: formatJSDocLinks(description ?? ""),
				type: type.isAliased() ? type.alias : property.serialize(propertySerializationCtx),
				contents: type.isUnion() ? getUnionsOf(type) : type.isObject() ? getPropertiesOf(type) : "",
				optional: property.optional,
			};
		});

	if (members.length === 0) {
		return "";
	}

	return ejs.render(template, { members });
}

/**
 * Gets the documentation for all types within the union; only supports unions that contain all objects.
 * @param union Union whose types should be documented.
 * @returns Documentation for the union.
 */
function getUnionsOf(union: UnionStructure): string {
	if ((union.isAliased() && forcedAliases.includes(union.alias)) || !union.types.every((t) => t.isObject())) {
		return "";
	}

	const template = `
One of:
<% for (const type of types) { %>
<details>
    <summary><%- type.name %></summary>
    <%- type.content %>
</details>
<% } %>
        `;

	return ejs.render(template, {
		types: union.types.map((t) => {
			return {
				name: t.isAliased() ? formatAlias(t.alias) : "object",
				content: getPropertiesOf(t as ObjectStructure),
			};
		}),
	});
}

/**
 * Formats the alias; slightly hacky, but prevent name clashes in @elgato/streamdeck.
 * @param alias Alias to format.
 * @returns The formatted alias.
 */
function formatAlias(alias: string): string {
	return alias.startsWith("UI") ? alias.substring(2) : alias;
}

/**
 * Provides information about an object structure's documentation.
 */
type ObjectDocs = {
	/**
	 *
	 */
	name: string;
	/**
	 *
	 */
	description: string | undefined;
	/**
	 *
	 */
	type: string;
	/**
	 *
	 */
	contents: string;
};
