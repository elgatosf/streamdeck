import type { JSONSchema } from "zod/v4/core";

import type { MethodMetadata } from "./method-metadata.js";

/**
 * Provides context associated with an action, allowing for it to be configured automatically.
 */
export interface ConfigurationContext {
	/**
	 * Schema that defines the structure of the settings associated with an action.
	 */
	readonly settingsSchema: JSONSchema.JSONSchema;

	/**
	 * Methods that can be used when configuring an action.
	 */
	readonly methods: MethodMetadata[];
}
