import { layout, manifest } from "@elgato/schemas/streamdeck/plugins/json";
import type { SchemaObject } from "ajv";

import { schemaStore } from "../../json/store";

/**
 * Gets the JSON schemas associated with validating a Stream Deck plugin.
 * @param param0 The options.
 * @param param0.updateCheck Determines whether a remote update check should occur.
 * @returns The JSON schemas.
 */
export async function getJsonSchemas({ updateCheck }: Options): Promise<PluginJsonSchemas> {
	return {
		layout: await schemaStore.get({
			_default: layout,
			path: "streamdeck/plugins/layout.json",
			updateCheck,
		}),
		manifest: await schemaStore.get({
			_default: manifest,
			path: "streamdeck/plugins/manifest.json",
			updateCheck,
		}),
	};
}

/**
 * Options that determine how to load the JSON schemas.
 */
interface Options {
	/**
	 * Determines whether an update check should occur.
	 */
	updateCheck: boolean;
}

/**
 * Schemas associated with validating Stream Deck plugins.
 */
export interface PluginJsonSchemas {
	/**
	 * JSON schema used to validate layouts, such as those found on Stream Deck + and Stream Deck Neo.
	 */
	layout: SchemaObject;

	/**
	 * JSON schema used to validate the manifest.
	 */
	manifest: SchemaObject;
}
