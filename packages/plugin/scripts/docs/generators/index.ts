import { type ClassDeclaration, type MethodDeclaration, Node } from "ts-morph";

import { apiDeclarations, schemaDeclarations, sdkDeclarations } from "../ast/dts-reader.js";
import type { MethodStructure } from "../ast/index.js";
import { codeBlock } from "../markdown.js";
import { renderDefinitions } from "./definitions.js";
import { renderMethods } from "./methods.js";
import { renderProtocolTypes } from "./websocket.js";

/**
 * Ignores `toJSON()`, and type assertion methods such as `isKey()`, as they are documented with the commands available to all actions.
 * @param method The method.
 * @returns `true` when the method should be documented; otherwise `false`.
 */
function ignoreTypeAssertionMethods(method: MethodStructure): boolean {
	return method.name !== "toJSON" && !method.declarations.some((d) => Node.isTypePredicate(d.getReturnTypeNode()));
}

/**
 * Renders the methods of the specified SDK type.
 * @param typeName Name of the type.
 * @param filter Optional filter to apply when determining which methods to render.
 * @returns Markdown documentation of the methods.
 */
function sdkMethods(typeName: string, filter?: (method: MethodStructure) => boolean): () => Promise<string> {
	return () => {
		const type = sdkDeclarations.getStructure(typeName);
		if (!type.isObject()) {
			throw new Error(`Expected ${typeName} to be an object`);
		}

		return renderMethods(type, filter);
	};
}

/**
 * Determines whether the event handler, declared on `SingletonAction`, is raised for the specified action type; determined by the type of the event's `action`.
 * @param handler The event handler.
 * @param actionType The action type.
 * @returns `true` when the event is raised for the action type; otherwise `false`.
 */
function isRaisedFor(handler: MethodDeclaration, actionType: ClassDeclaration): boolean {
	const action = handler.getParameters().at(0)?.getType().getProperty("action")?.getTypeAtLocation(handler);
	const names = (action?.isUnion() ? action.getUnionTypes() : [action]).map((t) => t?.getSymbol()?.getName());

	// The action type itself, or one of its base classes, e.g. `ActionContext`.
	for (let type: ClassDeclaration | undefined = actionType; type; type = type.getBaseClass()) {
		if (names.includes(type.getName())) {
			return true;
		}
	}

	return false;
}

/**
 * Renders the events of the `SingletonAction` class that are raised for the specified action types; when none are specified, events raised for all action types are rendered.
 * @param actionTypeNames Names of the action types.
 * @returns Markdown documentation of the events.
 */
function singletonActionEvents(...actionTypeNames: string[]): () => Promise<string> {
	return () => {
		if (actionTypeNames.length === 0) {
			actionTypeNames = sdkDeclarations
				.getTypeAlias("Action")
				.getType()
				.getUnionTypes()
				.map((t) => t.getSymbol()?.getName() ?? "");
		}

		const actionTypes = actionTypeNames.map((name) => sdkDeclarations.getClass(name));
		const events = sdkDeclarations
			.getClass("SingletonAction")
			.getMethods()
			.filter((handler) => actionTypes.every((actionType) => isRaisedFor(handler, actionType)))
			.map((handler) => handler.getName());

		return sdkMethods("SingletonAction", (m) => events.includes(m.name))();
	};
}

/**
 * Renders the protocol types, i.e. the events or commands, sent over the WebSocket connection.
 * @param typeName Name of the type.
 * @returns Markdown documentation of the types.
 */
function protocolTypes(typeName: string): () => Promise<string> {
	return () => renderProtocolTypes(apiDeclarations.plugin.getStructure(typeName));
}

/**
 * Renders the TypeScript declaration of the specified schema type as a code block.
 * @param typeName Name of the type.
 * @returns Markdown code block of the declaration.
 */
function schemaDeclaration(typeName: string): () => Promise<string> {
	return async () => {
		const type = schemaDeclarations.getStructure(typeName);
		return codeBlock(await type.stringify(), "ts", `title="${typeName} TypeScript declaration"`);
	};
}

/**
 * Renders the definitions of the specified schema type.
 * @param typeName Name of the type.
 * @returns Markdown documentation of the definitions.
 */
function schemaDefinitions(typeName: string): () => Promise<string> {
	return async () => {
		const type = schemaDeclarations.getStructure(typeName);
		if (!type.isObject()) {
			throw new Error(`Expected ${typeName} to be an object`);
		}

		return renderDefinitions(type);
	};
}

/**
 * Generators, indexed by the identifier used within `<!-- generated: {id} -->` regions of the documentation.
 */
export const generators: Record<string, () => Promise<string>> = {
	// Actions (guides)
	"actions-commands": sdkMethods("ActionBase", (m) => m.name !== "toJSON"),
	"actions-events": singletonActionEvents(),
	"keys-commands": sdkMethods("KeyAction", ignoreTypeAssertionMethods),
	"keys-events": singletonActionEvents("KeyAction"),
	"dials-commands": sdkMethods("DialAction", ignoreTypeAssertionMethods),
	"dials-events": singletonActionEvents("DialAction"),
	"neo-infobar-commands": sdkMethods("NeoInfobarAction", ignoreTypeAssertionMethods),

	// WebSocket API (references)
	"websocket-plugin-events": protocolTypes("PluginEvent"),
	"websocket-plugin-commands": protocolTypes("PluginCommand"),
	"websocket-registration-info": protocolTypes("RegistrationInfo"),

	// Manifest and layout (references)
	"manifest-declaration": schemaDeclaration("Manifest"),
	"manifest-definitions": schemaDefinitions("Manifest"),
	"layout-declaration": schemaDeclaration("Layout"),
	"layout-definitions": schemaDefinitions("Layout"),
};
