import type { PluginJsonSchemas } from "./schemas";

/**
 * Options used to validate Stream Deck plugins.
 */
export interface PluginValidationOptions {
	/**
	 * Path to the plugin.
	 */
	path: string;

	/**
	 * JSON schemas used to validate the plugin.
	 */
	schemas: PluginJsonSchemas;
}
