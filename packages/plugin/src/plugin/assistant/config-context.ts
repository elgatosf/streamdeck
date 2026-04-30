import * as z from "zod";

import type { ConfigMethodDefinition } from "./config-method-definition.js";

/**
 * Provides context associated with an action, allowing for it to be configured automatically.
 */
export interface ConfigContext {
	/**
	 * Schema that defines the structure of the settings associated with an action.
	 */
	settingsSchema: z.ZodType | (() => Promise<z.ZodType>) | (() => z.ZodType);

	/**
	 * Methods that can be used when automatically configuring an action.
	 */
	methods?: ConfigMethodDefinition[];
}
